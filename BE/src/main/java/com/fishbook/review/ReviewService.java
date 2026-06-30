package com.fishbook.review;

import com.fishbook.common.ForbiddenException;
import com.fishbook.common.NotFoundException;
import com.fishbook.fish.Fish;
import com.fishbook.fish.FishRepository;
import com.fishbook.review.dto.ReviewHelpfulResponse;
import com.fishbook.review.dto.ReviewListResponse;
import com.fishbook.review.dto.ReviewRequest;
import com.fishbook.review.dto.ReviewResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReviewService {

    private final FishRepository fishRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;

    public ReviewService(FishRepository fishRepository, ReviewRepository reviewRepository, PasswordEncoder passwordEncoder) {
        this.fishRepository = fishRepository;
        this.reviewRepository = reviewRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public ReviewListResponse findReviews(Long fishId, int page, int size, String sort) {
        ensureFishExists(fishId);
        Pageable pageable = PageRequest.of(page, size, reviewSort(sort));
        return new ReviewListResponse(
                fishId,
                averageRating(fishId),
                reviewRepository.countByFishId(fishId),
                RatingDistribution.from(reviewRepository.countByRatingForFishId(fishId)),
                reviewRepository.findByFishId(fishId, pageable).stream()
                        .map(this::toResponse)
                        .toList());
    }

    @Transactional
    public ReviewResponse createReview(Long fishId, ReviewRequest request) {
        Fish fish = fishRepository.findById(fishId)
                .orElseThrow(() -> new NotFoundException("생선을 찾을 수 없습니다."));

        Review review = new Review();
        review.setFish(fish);
        review.setNickname(request.nickname());
        review.setRating(request.rating());
        review.setContent(request.content());
        review.setImageUrl(request.imageUrl());
        review.setPasswordHash(passwordEncoder.encode(request.password()));

        return toResponse(reviewRepository.save(review));
    }

    @Transactional
    public void deleteReview(Long reviewId, String password) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new NotFoundException("후기를 찾을 수 없습니다."));
        if (!passwordEncoder.matches(password, review.getPasswordHash())) {
            throw new ForbiddenException("비밀번호가 일치하지 않습니다.");
        }
        reviewRepository.delete(review);
    }

    @Transactional
    public ReviewHelpfulResponse increaseHelpfulCount(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new NotFoundException("후기를 찾을 수 없습니다."));
        review.setHelpfulCount(review.getHelpfulCount() + 1);
        return new ReviewHelpfulResponse(review.getId(), review.getHelpfulCount());
    }

    private void ensureFishExists(Long fishId) {
        if (!fishRepository.existsById(fishId)) {
            throw new NotFoundException("생선을 찾을 수 없습니다.");
        }
    }

    private ReviewResponse toResponse(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getFish().getId(),
                review.getNickname(),
                review.getRating(),
                review.getContent(),
                review.getImageUrl(),
                review.getHelpfulCount(),
                review.getCreatedAt());
    }

    private Sort reviewSort(String sort) {
        if ("latest".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
        if ("helpful".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Order.desc("helpfulCount"), Sort.Order.desc("createdAt"));
        }
        throw new IllegalArgumentException("sort는 latest 또는 helpful 중 하나여야 합니다.");
    }

    private double averageRating(Long fishId) {
        return reviewRepository.averageRatingByFishId(fishId)
                .map(value -> Math.round(value * 10.0) / 10.0)
                .orElse(0.0);
    }
}
