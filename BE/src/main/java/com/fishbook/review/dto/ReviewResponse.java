package com.fishbook.review.dto;

import java.time.OffsetDateTime;

public record ReviewResponse(
        Long id,
        Long fishId,
        String nickname,
        Short rating,
        String content,
        String imageUrl,
        int helpfulCount,
        OffsetDateTime createdAt
) {
}
