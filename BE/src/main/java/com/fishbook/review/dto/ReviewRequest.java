package com.fishbook.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReviewRequest(
        @NotBlank(message = "nickname은 필수입니다.")
        @Size(max = 30, message = "nickname은 30자 이하여야 합니다.")
        String nickname,

        @Min(value = 1, message = "rating은 1 이상이어야 합니다.")
        @Max(value = 5, message = "rating은 5 이하여야 합니다.")
        Short rating,

        @NotBlank(message = "content는 필수입니다.")
        @Size(max = 1000, message = "content는 1000자 이하여야 합니다.")
        String content,

        String imageUrl,

        @NotBlank(message = "password는 필수입니다.")
        @Size(min = 4, max = 20, message = "password는 4~20자여야 합니다.")
        String password
) {
}
