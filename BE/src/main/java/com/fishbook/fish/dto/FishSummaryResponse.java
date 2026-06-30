package com.fishbook.fish.dto;

import java.util.List;

public record FishSummaryResponse(
        Long id,
        String name,
        String imageUrl,
        String description,
        Short priceLevel,
        List<String> tasteTags,
        List<Short> seasonMonths,
        boolean featured,
        double avgRating,
        long reviewCount
) {
}
