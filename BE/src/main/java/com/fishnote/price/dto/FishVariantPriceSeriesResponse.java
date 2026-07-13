package com.fishnote.price.dto;

import java.util.List;

public record FishVariantPriceSeriesResponse(
        String variantKey,
        String variantLabel,
        String farming,
        String origin,
        String unit,
        long observationCount,
        FishPriceObservationResponse latest,
        List<FishPriceGraphPointResponse> graph) {}
