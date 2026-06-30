import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function getHealth() {
  const { data } = await apiClient.get<{ status: string }>('/health');
  return data;
}
