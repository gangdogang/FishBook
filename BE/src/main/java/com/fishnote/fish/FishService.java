package com.fishnote.fish;

import com.fishnote.common.NotFoundException;
import com.fishnote.fish.dto.FishDetailResponse;
import com.fishnote.fish.dto.FishSummaryResponse;
import com.fishnote.fish.dto.SimilarFishResponse;
import com.fishnote.review.FishRatingStat;
import com.fishnote.review.ReviewRepository;
import com.fishnote.review.RatingDistribution;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@Transactional(readOnly = true)
public class FishService {

    private static final Set<Short> SPRING = Set.of((short) 3, (short) 4, (short) 5);
    private static final Set<Short> SUMMER = Set.of((short) 6, (short) 7, (short) 8);
    private static final Set<Short> FALL = Set.of((short) 9, (short) 10, (short) 11);
    private static final Set<Short> WINTER = Set.of((short) 12, (short) 1, (short) 2);

    private final FishRepository fishRepository;
    private final ReviewRepository reviewRepository;

    public FishService(FishRepository fishRepository, ReviewRepository reviewRepository) {
        this.fishRepository = fishRepository;
        this.reviewRepository = reviewRepository;
    }

    public List<FishSummaryResponse> findFishes(
            String search,
            String season,
            String taste,
            Short priceLevel,
            Short month,
            Boolean featured,
            String sort) {
        Set<Short> seasonMonths = resolveSeason(season);
        validateMonth(month);
        Comparator<FishSummaryResponse> comparator = "name".equalsIgnoreCase(sort)
                ? Comparator.comparing(FishSummaryResponse::name)
                : Comparator.comparing(FishSummaryResponse::reviewCount).reversed()
                        .thenComparing(FishSummaryResponse::avgRating, Comparator.reverseOrder())
                        .thenComparing(FishSummaryResponse::name);

        // 필터는 DB에서 수행 (전체 로드 후 인메모리 필터링 금지 — 데이터 증가 대비)
        // 컬렉션(제철 월·맛 태그)은 default_batch_fetch_size 배치 페치로 로딩된다.
        List<Specification<Fish>> specs = new ArrayList<>();
        if (StringUtils.hasText(search)) {
            specs.add(FishSpecifications.matchesSearch(search));
        }
        if (seasonMonths != null) {
            specs.add(FishSpecifications.inSeasonMonths(seasonMonths));
        }
        if (StringUtils.hasText(taste)) {
            specs.add(FishSpecifications.hasTasteTag(taste));
        }
        if (priceLevel != null) {
            specs.add(FishSpecifications.hasPriceLevel(priceLevel));
        }
        if (month != null) {
            specs.add(FishSpecifications.inMonth(month));
        }
        if (Boolean.TRUE.equals(featured)) {
            specs.add(FishSpecifications.isFeatured());
        }
        List<Fish> fishes = fishRepository.findAll(Specification.allOf(specs));

        // 생선별 별점·후기 수를 개별 쿼리 대신 한 번에 집계 (N+1 방지)
        Map<Long, FishRatingStat> stats = ratingStats(fishes.stream().map(Fish::getId).toList());

        return fishes.stream()
                .map(fish -> toSummary(fish, stats.get(fish.getId())))
                .sorted(comparator)
                .toList();
    }

    public FishDetailResponse getFish(Long id) {
        Fish fish = fishRepository.findDetailById(id)
                .orElseThrow(() -> new NotFoundException("생선을 찾을 수 없습니다."));
        return toDetail(fish);
    }

    public List<FishSummaryResponse> summarizeFishes(List<Fish> fishes) {
        Map<Long, FishRatingStat> stats = ratingStats(fishes.stream().map(Fish::getId).toList());
        return fishes.stream()
                .map(fish -> toSummary(fish, stats.get(fish.getId())))
                .toList();
    }

    private Set<Short> resolveSeason(String season) {
        if (!StringUtils.hasText(season)) {
            return null;
        }
        return switch (season.toLowerCase(Locale.ROOT)) {
            case "spring" -> SPRING;
            case "summer" -> SUMMER;
            case "fall", "autumn" -> FALL;
            case "winter" -> WINTER;
            default -> throw new IllegalArgumentException("season은 spring/summer/fall/winter 중 하나여야 합니다.");
        };
    }

    private void validateMonth(Short month) {
        if (month != null && (month < 1 || month > 12)) {
            throw new IllegalArgumentException("month는 1~12 사이여야 합니다.");
        }
    }

    private FishSummaryResponse toSummary(Fish fish, FishRatingStat stat) {
        return new FishSummaryResponse(
                fish.getId(),
                fish.getName(),
                fish.getImageUrl(),
                fish.getDescription(),
                fish.getPriceLevel(),
                fish.getTasteTags().stream().sorted().toList(),
                fish.getSeasonMonths().stream().sorted().toList(),
                fish.isFeatured(),
                averageRating(stat),
                reviewCount(stat));
    }

    private FishDetailResponse toDetail(Fish fish) {
        List<Long> statIds = new ArrayList<>();
        statIds.add(fish.getId());
        fish.getSimilarFishes().forEach(similar -> statIds.add(similar.getId()));
        Map<Long, FishRatingStat> stats = ratingStats(statIds);

        return new FishDetailResponse(
                fish.getId(),
                fish.getName(),
                fish.getNameEn(),
                fish.getImageUrl(),
                detailImages(fish),
                fish.getDescription(),
                fish.getTasteDesc(),
                fish.getTasteTags().stream().sorted().toList(),
                fish.getSeasonMonths().stream().sorted().toList(),
                fish.getPriceLevel(),
                averageRating(stats.get(fish.getId())),
                reviewCount(stats.get(fish.getId())),
                RatingDistribution.from(reviewRepository.countByRatingForFishId(fish.getId())),
                List.copyOf(fish.getTips()),
                fish.getSimilarFishes().stream()
                        .map(similar -> toSimilar(similar, stats.get(similar.getId())))
                        .sorted(Comparator.comparing(SimilarFishResponse::name))
                        .toList());
    }

    private SimilarFishResponse toSimilar(Fish fish, FishRatingStat stat) {
        return new SimilarFishResponse(
                fish.getId(),
                fish.getName(),
                fish.getImageUrl(),
                fish.getPriceLevel(),
                averageRating(stat),
                fish.getSeasonMonths().stream().sorted().toList());
    }

    private List<String> detailImages(Fish fish) {
        if (!fish.getImages().isEmpty()) {
            return List.copyOf(fish.getImages());
        }
        return StringUtils.hasText(fish.getImageUrl()) ? List.of(fish.getImageUrl()) : List.of();
    }

    private Map<Long, FishRatingStat> ratingStats(Collection<Long> fishIds) {
        if (fishIds.isEmpty()) {
            return Map.of();
        }
        return reviewRepository.findRatingStatsByFishIds(fishIds).stream()
                .collect(Collectors.toMap(FishRatingStat::getFishId, Function.identity()));
    }

    private double averageRating(FishRatingStat stat) {
        if (stat == null || stat.getAvgRating() == null) {
            return 0.0;
        }
        return Math.round(stat.getAvgRating() * 10.0) / 10.0;
    }

    private long reviewCount(FishRatingStat stat) {
        return stat == null ? 0 : stat.getReviewCount();
    }
}
