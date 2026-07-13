package com.fishnote.common;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * IP 기반 고정 윈도(fixed-window) 레이트 리미터.
 * 익명 허용 엔드포인트(후기 작성/삭제/도움돼요/이미지 업로드/로그인)의
 * 스팸·브루트포스·비용 남용을 막는다. 단일 인스턴스 배포(Render 1 dyno) 전제의
 * 인메모리 구현으로, 다중 인스턴스로 확장 시 Redis 등 외부 저장소로 교체할 것.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Duration WINDOW = Duration.ofMinutes(10);
    private static final int MAX_TRACKED_KEYS = 10_000;

    private record Rule(String method, Pattern path, int limit, String bucket) {
    }

    private static final List<Rule> RULES = List.of(
            new Rule("POST", Pattern.compile("/api/v1/fish/\\d+/reviews"), 10, "review-write"),
            new Rule("DELETE", Pattern.compile("/api/v1/reviews/\\d+"), 10, "review-delete"),
            new Rule("POST", Pattern.compile("/api/v1/reviews/\\d+/helpful"), 60, "helpful"),
            new Rule("POST", Pattern.compile("/api/v1/images"), 20, "image-upload"),
            new Rule("POST", Pattern.compile("/api/v1/auth/(login|signup|kakao)"), 20, "auth"));

    private final boolean enabled;
    private final ObjectMapper objectMapper;
    private final ConcurrentHashMap<String, Integer> counters = new ConcurrentHashMap<>();

    public RateLimitFilter(
            @Value("${app.rate-limit.enabled:true}") boolean enabled,
            ObjectMapper objectMapper) {
        this.enabled = enabled;
        this.objectMapper = objectMapper;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !enabled;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        Rule matched = match(request);
        if (matched == null) {
            filterChain.doFilter(request, response);
            return;
        }

        long windowStartMs = System.currentTimeMillis() / WINDOW.toMillis() * WINDOW.toMillis();
        String key = matched.bucket() + "|" + clientIp(request) + "|" + windowStartMs;
        int count = counters.merge(key, 1, Integer::sum);
        purgeExpiredIfNeeded(windowStartMs);

        if (count > matched.limit()) {
            reject(request, response);
            return;
        }
        filterChain.doFilter(request, response);
    }

    private Rule match(HttpServletRequest request) {
        for (Rule rule : RULES) {
            if (rule.method().equals(request.getMethod())
                    && rule.path().matcher(request.getRequestURI()).matches()) {
                return rule;
            }
        }
        return null;
    }

    private String clientIp(HttpServletRequest request) {
        // Render 등 프록시 뒤에서는 원 IP가 X-Forwarded-For 첫 항목에 담긴다
        String forwarded = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwarded)) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private void purgeExpiredIfNeeded(long currentWindowStartMs) {
        if (counters.size() <= MAX_TRACKED_KEYS) {
            return;
        }
        counters.keySet().removeIf(key -> {
            int idx = key.lastIndexOf('|');
            try {
                return Long.parseLong(key.substring(idx + 1)) < currentWindowStartMs;
            } catch (NumberFormatException ex) {
                return true;
            }
        });
    }

    private void reject(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setStatus(429);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getWriter(), new ErrorResponse(
                OffsetDateTime.now(),
                429,
                "Too Many Requests",
                "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
                request.getRequestURI()));
    }
}
