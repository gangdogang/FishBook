package com.fishnote.price;

import com.fishnote.common.NotFoundException;
import com.fishnote.fish.FishRepository;
import com.fishnote.price.dto.FishPriceObservationResponse;
import com.fishnote.price.dto.FishPriceGraphPointResponse;
import com.fishnote.price.dto.FishPriceSummaryResponse;
import com.fishnote.price.dto.FishShopPriceSeriesResponse;
import com.fishnote.price.dto.FishVariantPriceSeriesResponse;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class FishPriceQueryService {

    private static final int DEFAULT_DAYS = 14;
    private static final int MAX_DAYS = 30;
    private static final int MAX_RECENT_OBSERVATIONS = 20;
    private static final String PUBLIC_SOURCE_LABEL = "상회 시세";

    private final ShopPriceObservationRepository observationRepository;
    private final FishRepository fishRepository;

    public FishPriceQueryService(
            ShopPriceObservationRepository observationRepository, FishRepository fishRepository) {
        this.observationRepository = observationRepository;
        this.fishRepository = fishRepository;
    }

    public FishPriceSummaryResponse getRecentPrices(Long fishId, Integer requestedDays) {
        if (!fishRepository.existsById(fishId)) {
            throw new NotFoundException("생선을 찾을 수 없습니다.");
        }

        int days = clampDays(requestedDays);
        OffsetDateTime observedAfter = OffsetDateTime.now(ShopPriceParser.KST).minusDays(days);
        List<FishPriceObservationResponse> recent = observationRepository
                .findByFish_IdAndObservedAtGreaterThanEqualOrderByObservedAtDesc(
                        fishId, observedAfter, PageRequest.of(0, MAX_RECENT_OBSERVATIONS))
                .stream()
                .map(this::toResponse)
                .toList();

        long observationCount = observationRepository.countByFish_IdAndObservedAtGreaterThanEqual(
                fishId, observedAfter);
        FishPriceObservationResponse latest = recent.isEmpty() ? null : recent.get(0);
        List<ShopPriceObservation> graphRows =
                observationRepository.findByFish_IdAndObservedAtGreaterThanEqualOrderByObservedAtAsc(fishId, observedAfter);

        return new FishPriceSummaryResponse(
                fishId,
                days,
                observationCount,
                latest,
                recent,
                toGraph(graphRows),
                toShopSeries(graphRows),
                toVariantSeries(graphRows));
    }

    private int clampDays(Integer requestedDays) {
        int days = requestedDays == null ? DEFAULT_DAYS : requestedDays;
        return Math.max(1, Math.min(MAX_DAYS, days));
    }

    private FishPriceObservationResponse toResponse(ShopPriceObservation observation) {
        return new FishPriceObservationResponse(
                observation.getObservedAt(),
                observation.getPriceMinKrw(),
                observation.getPriceMaxKrw(),
                observation.getUnit(),
                observation.getOrigin(),
                observation.getSizeGrade(),
                PUBLIC_SOURCE_LABEL,
                shopName(observation));
    }

    private List<FishPriceGraphPointResponse> toGraph(List<ShopPriceObservation> observations) {
        Map<LocalDate, List<ShopPriceObservation>> byDate = new LinkedHashMap<>();
        observations.stream()
                .sorted(Comparator.comparing(ShopPriceObservation::getObservedAt))
                .forEach(observation -> byDate
                        .computeIfAbsent(toLocalDate(observation), ignored -> new ArrayList<>())
                        .add(observation));

        return byDate.entrySet().stream()
                .map(entry -> toGraphPoint(entry.getKey(), entry.getValue()))
                .toList();
    }

    private List<FishShopPriceSeriesResponse> toShopSeries(List<ShopPriceObservation> observations) {
        Map<String, List<ShopPriceObservation>> byShop = new LinkedHashMap<>();
        observations.stream()
                .sorted(Comparator.comparing(ShopPriceObservation::getObservedAt))
                .forEach(observation -> byShop
                        .computeIfAbsent(shopName(observation), ignored -> new ArrayList<>())
                        .add(observation));

        return byShop.entrySet().stream()
                .map(entry -> {
                    List<ShopPriceObservation> shopRows = entry.getValue();
                    ShopPriceObservation latest = shopRows.stream()
                            .max(Comparator.comparing(ShopPriceObservation::getObservedAt))
                            .orElseThrow();
                    return new FishShopPriceSeriesResponse(
                            entry.getKey(), shopRows.size(), toResponse(latest), toGraph(shopRows));
                })
                .toList();
    }

    private List<FishVariantPriceSeriesResponse> toVariantSeries(List<ShopPriceObservation> observations) {
        Map<String, List<ShopPriceObservation>> byVariant = new LinkedHashMap<>();
        observations.stream()
                .sorted(Comparator.comparing(ShopPriceObservation::getObservedAt))
                .forEach(observation -> byVariant
                        .computeIfAbsent(variantKey(observation), ignored -> new ArrayList<>())
                        .add(observation));

        return byVariant.entrySet().stream()
                .map(entry -> {
                    List<ShopPriceObservation> variantRows = entry.getValue();
                    ShopPriceObservation latest = variantRows.stream()
                            .max(Comparator.comparing(ShopPriceObservation::getObservedAt))
                            .orElseThrow();
                    return new FishVariantPriceSeriesResponse(
                            entry.getKey(),
                            variantLabel(latest),
                            farming(latest),
                            blankToEmpty(latest.getOrigin()),
                            blankToEmpty(latest.getUnit()),
                            variantRows.size(),
                            toResponse(latest),
                            toGraph(variantRows));
                })
                .sorted(Comparator.comparingLong(FishVariantPriceSeriesResponse::observationCount).reversed())
                .toList();
    }

    private String variantKey(ShopPriceObservation observation) {
        return String.join(
                "|",
                farming(observation),
                blankToEmpty(observation.getOrigin()),
                blankToEmpty(observation.getUnit()));
    }

    private String variantLabel(ShopPriceObservation observation) {
        List<String> parts = new ArrayList<>();
        String origin = blankToEmpty(observation.getOrigin());
        String farming = farming(observation);
        if (!origin.isBlank()) {
            parts.add(origin);
        }
        if (!farming.isBlank()) {
            parts.add(farming);
        }
        return parts.isEmpty() ? "구분 없음" : String.join(" ", parts);
    }

    private String farming(ShopPriceObservation observation) {
        String condition = observation.getCondition() == null ? "" : observation.getCondition();
        if (condition.contains("자연산")) {
            return "자연산";
        }
        if (condition.contains("양식")) {
            return "양식";
        }
        return "";
    }

    private String blankToEmpty(String value) {
        return value == null || value.isBlank() ? "" : value.trim();
    }

    private FishPriceGraphPointResponse toGraphPoint(LocalDate observedDate, List<ShopPriceObservation> observations) {
        int min = observations.stream()
                .mapToInt(ShopPriceObservation::getPriceMinKrw)
                .min()
                .orElse(0);
        int max = observations.stream()
                .mapToInt(ShopPriceObservation::getPriceMaxKrw)
                .max()
                .orElse(0);
        double avg = observations.stream()
                .mapToInt(observation -> (observation.getPriceMinKrw() + observation.getPriceMaxKrw()) / 2)
                .average()
                .orElse(0);
        return new FishPriceGraphPointResponse(observedDate, min, max, (int) Math.round(avg), observations.size());
    }

    private LocalDate toLocalDate(ShopPriceObservation observation) {
        return observation.getObservedAt().withOffsetSameInstant(ShopPriceParser.KST).toLocalDate();
    }

    private String shopName(ShopPriceObservation observation) {
        return observation.getSourceName() == null || observation.getSourceName().isBlank()
                ? "미확인 상회"
                : observation.getSourceName();
    }
}
