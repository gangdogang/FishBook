import { useQuery } from '@tanstack/react-query';
import { getFishDetail, getFishList } from '../api/fish';
import type { FishListParams } from '../types/fish';

export function useFishList(params: FishListParams = {}) {
  return useQuery({
    queryKey: ['fish', params],
    queryFn: () => getFishList(params),
  });
}

export function useFishDetail(id: number) {
  return useQuery({
    queryKey: ['fish', id],
    queryFn: () => getFishDetail(id),
    enabled: Number.isFinite(id),
  });
}
