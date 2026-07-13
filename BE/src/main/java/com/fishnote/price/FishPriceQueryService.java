package com.fishnote.price;

import com.fishnote.common.NotFoundException;
import com.fishnote.fish.FishRepository;
import com.fishnote.price.dto.FishPriceObservationResponse;
import com.fishnote.price.dto.FishPriceSummaryResponse;
import java.time.OffsetDateTime;
import java.util.List;
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

        return new FishPriceSummaryResponse(fishId, days, observationCount, latest, recent);
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
                PUBLIC_SOURCE_LABEL);
    }
}
