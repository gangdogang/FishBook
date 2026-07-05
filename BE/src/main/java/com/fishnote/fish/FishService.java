package com.fishnote.fish;

import com.fishnote.common.NotFoundException;
import com.fishnote.fish.dto.FishDetailResponse;
import com.fishnote.fish.dto.FishSummaryResponse;
import com.fishnote.fish.dto.SimilarFishResponse;
import com.fishnote.review.ReviewRepository;
import com.fishnote.review.RatingDistribution;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
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

        return fishRepository.findAll().stream()
                .filter(fish -> matchesSearch(fish, search))
                .filter(fish -> seasonMonths == null || fish.getSeasonMonths().stream().anyMatch(seasonMonths::contains))
                .filter(fish -> !StringUtils.hasText(taste) || fish.getTasteTags().contains(taste))
                .filter(fish -> priceLevel == null || priceLevel.equals(fish.getPriceLevel()))
                .filter(fish -> month == null || fish.getSeasonMonths().contains(month))
                .filter(fish -> !Boolean.TRUE.equals(featured) || fish.isFeatured())
                .map(this::toSummary)
                .sorted(comparator)
                .toList();
    }

    public FishDetailResponse getFish(Long id) {
        Fish fish = fishRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("생선을 찾을 수 없습니다."));
        return toDetail(fish);
    }

    private boolean matchesSearch(Fish fish, String search) {
        if (!StringUtils.hasText(search)) {
            return true;
        }
        String keyword = search.toLowerCase(Locale.ROOT);
        return fish.getName().toLowerCase(Locale.ROOT).contains(keyword)
                || (fish.getNameEn() != null && fish.getNameEn().toLowerCase(Locale.ROOT).contains(keyword));
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

    private FishSummaryResponse toSummary(Fish fish) {
        return new FishSummaryResponse(
                fish.getId(),
                fish.getName(),
                fish.getImageUrl(),
                fish.getDescription(),
                fish.getPriceLevel(),
                fish.getTasteTags().stream().sorted().toList(),
                fish.getSeasonMonths().stream().sorted().toList(),
                fish.isFeatured(),
                averageRating(fish.getId()),
                reviewRepository.countByFishId(fish.getId()));
    }

    private FishDetailResponse toDetail(Fish fish) {
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
                averageRating(fish.getId()),
                reviewRepository.countByFishId(fish.getId()),
                RatingDistribution.from(reviewRepository.countByRatingForFishId(fish.getId())),
                List.copyOf(fish.getTips()),
                fish.getSimilarFishes().stream()
                        .map(this::toSimilar)
                        .sorted(Comparator.comparing(SimilarFishResponse::name))
                        .toList());
    }

    private SimilarFishResponse toSimilar(Fish fish) {
        return new SimilarFishResponse(
                fish.getId(),
                fish.getName(),
                fish.getImageUrl(),
                fish.getPriceLevel(),
                averageRating(fish.getId()),
                fish.getSeasonMonths().stream().sorted().toList());
    }

    private List<String> detailImages(Fish fish) {
        if (!fish.getImages().isEmpty()) {
            return List.copyOf(fish.getImages());
        }
        return StringUtils.hasText(fish.getImageUrl()) ? List.of(fish.getImageUrl()) : List.of();
    }

    private double averageRating(Long fishId) {
        return reviewRepository.averageRatingByFishId(fishId)
                .map(value -> Math.round(value * 10.0) / 10.0)
                .orElse(0.0);
    }
}
