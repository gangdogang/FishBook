import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createReview, deleteReview, getReviews, markReviewHelpful } from '../api/review';
import type { ReviewRequest, ReviewSort } from '../types/review';

export function useReviews(fishId: number, sort: ReviewSort = 'latest') {
  return useQuery({
    queryKey: ['reviews', fishId, sort],
    queryFn: () => getReviews(fishId, sort),
    enabled: Number.isFinite(fishId),
  });
}

export function useCreateReview(fishId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ReviewRequest) => createReview(fishId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', fishId] });
      queryClient.invalidateQueries({ queryKey: ['fish'] });
    },
  });
}

export function useMarkReviewHelpful(fishId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: number) => markReviewHelpful(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', fishId] });
      queryClient.invalidateQueries({ queryKey: ['fish'] });
    },
  });
}

export function useDeleteReview(fishId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, password }: { reviewId: number; password: string }) => deleteReview(reviewId, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', fishId] });
      queryClient.invalidateQueries({ queryKey: ['fish'] });
    },
  });
}
