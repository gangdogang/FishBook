package com.fishnote.review;

import com.fishnote.review.dto.ReviewDeleteRequest;
import com.fishnote.review.dto.ReviewHelpfulResponse;
import com.fishnote.review.dto.ReviewListResponse;
import com.fishnote.review.dto.ReviewRequest;
import com.fishnote.review.dto.ReviewResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/fish/{fishId}/reviews")
    public ReviewListResponse list(
            @PathVariable Long fishId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "latest") String sort) {
        return reviewService.findReviews(fishId, page, size, sort);
    }

    @PostMapping("/fish/{fishId}/reviews")
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewResponse create(@PathVariable Long fishId, @Valid @RequestBody ReviewRequest request) {
        return reviewService.createReview(fishId, request);
    }

    @DeleteMapping("/reviews/{reviewId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long reviewId, @Valid @RequestBody ReviewDeleteRequest request) {
        reviewService.deleteReview(reviewId, request.password());
    }

    @PostMapping("/reviews/{reviewId}/helpful")
    public ReviewHelpfulResponse helpful(@PathVariable Long reviewId) {
        return reviewService.increaseHelpfulCount(reviewId);
    }
}
