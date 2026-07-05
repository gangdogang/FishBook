package com.fishnote.fish.dto;

import java.util.List;
import java.util.Map;

public record FishDetailResponse(
        Long id,
        String name,
        String nameEn,
        String imageUrl,
        List<String> images,
        String description,
        String tasteDesc,
        List<String> tasteTags,
        List<Short> seasonMonths,
        Short priceLevel,
        double avgRating,
        long reviewCount,
        Map<String, Long> ratingDistribution,
        List<String> tips,
        List<SimilarFishResponse> similarFishes
) {
}
