import { apiClient } from './client';
import type { Review, ReviewHelpfulResponse, ReviewList, ReviewRequest, ReviewSort } from '../types/review';

export async function getReviews(fishId: number, sort: ReviewSort = 'latest', page = 0, size = 20) {
  const { data } = await apiClient.get<ReviewList>(`/fish/${fishId}/reviews`, {
    params: { page, size, sort },
  });
  return data;
}

export async function createReview(fishId: number, request: ReviewRequest) {
  const { data } = await apiClient.post<Review>(`/fish/${fishId}/reviews`, request);
  return data;
}

export async function deleteReview(reviewId: number, password: string) {
  await apiClient.delete(`/reviews/${reviewId}`, {
    data: { password },
  });
}

export async function markReviewHelpful(reviewId: number) {
  const { data } = await apiClient.post<ReviewHelpfulResponse>(`/reviews/${reviewId}/helpful`);
  return data;
}
