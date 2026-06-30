package com.fishbook.fish.dto;

import java.util.List;

public record SimilarFishResponse(
        Long id,
        String name,
        String imageUrl,
        Short priceLevel,
        double avgRating,
        List<Short> seasonMonths
) {
}
