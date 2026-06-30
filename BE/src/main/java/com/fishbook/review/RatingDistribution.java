package com.fishbook.review;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class RatingDistribution {

    private RatingDistribution() {
    }

    public static Map<String, Long> from(List<RatingCount> ratingCounts) {
        Map<String, Long> distribution = new LinkedHashMap<>();
        for (int rating = 5; rating >= 1; rating--) {
            distribution.put(String.valueOf(rating), 0L);
        }
        for (RatingCount ratingCount : ratingCounts) {
            Short rating = ratingCount.getRating();
            if (rating != null && rating >= 1 && rating <= 5) {
                distribution.put(String.valueOf(rating), ratingCount.getCount());
            }
        }
        return distribution;
    }
}
