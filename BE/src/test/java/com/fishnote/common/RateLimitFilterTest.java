package com.fishnote.common;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class RateLimitFilterTest {

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Test
    void reviewWritesBeyondLimitAreRejectedWith429() throws Exception {
        RateLimitFilter filter = new RateLimitFilter(true, objectMapper);

        for (int i = 0; i < 10; i++) {
            MockHttpServletResponse response = fire(filter, "POST", "/api/v1/fish/1/reviews", "1.2.3.4");
            assertThat(response.getStatus()).isEqualTo(200);
        }

        MockHttpServletResponse blocked = fire(filter, "POST", "/api/v1/fish/1/reviews", "1.2.3.4");
        assertThat(blocked.getStatus()).isEqualTo(429);
        assertThat(blocked.getContentAsString()).contains("요청이 너무 많습니다");
    }

    @Test
    void differentIpsHaveIndependentLimits() throws Exception {
        RateLimitFilter filter = new RateLimitFilter(true, objectMapper);

        for (int i = 0; i < 11; i++) {
            fire(filter, "POST", "/api/v1/fish/1/reviews", "1.2.3.4");
        }
        MockHttpServletResponse other = fire(filter, "POST", "/api/v1/fish/1/reviews", "5.6.7.8");
        assertThat(other.getStatus()).isEqualTo(200);
    }

    @Test
    void unmatchedEndpointsAreNotLimited() throws Exception {
        RateLimitFilter filter = new RateLimitFilter(true, objectMapper);

        for (int i = 0; i < 50; i++) {
            MockHttpServletResponse response = fire(filter, "GET", "/api/v1/fish", "1.2.3.4");
            assertThat(response.getStatus()).isEqualTo(200);
        }
    }

    @Test
    void disabledFilterDoesNotLimit() throws Exception {
        RateLimitFilter filter = new RateLimitFilter(false, objectMapper);

        for (int i = 0; i < 30; i++) {
            MockHttpServletResponse response = fire(filter, "POST", "/api/v1/fish/1/reviews", "1.2.3.4");
            assertThat(response.getStatus()).isEqualTo(200);
        }
    }

    private MockHttpServletResponse fire(RateLimitFilter filter, String method, String uri, String ip)
            throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest(method, uri);
        request.setRemoteAddr(ip);
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain());
        return response;
    }
}
