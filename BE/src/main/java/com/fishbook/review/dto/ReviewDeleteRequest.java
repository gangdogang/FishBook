package com.fishbook.review.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReviewDeleteRequest(
        @NotBlank(message = "password는 필수입니다.")
        @Size(min = 4, max = 20, message = "password는 4~20자여야 합니다.")
        String password
) {
}
