import { apiClient } from './client';
import type { FishDetail, FishListParams, FishSummary } from '../types/fish';

export async function getFishList(params: FishListParams = {}) {
  const { data } = await apiClient.get<FishSummary[]>('/fish', { params });
  return data;
}

export async function getFishDetail(id: number) {
  const { data } = await apiClient.get<FishDetail>(`/fish/${id}`);
  return data;
}
