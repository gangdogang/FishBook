import { isAxiosError } from 'axios';

interface ApiErrorBody {
  message?: string;
}

export function getErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    const body = error.response?.data as ApiErrorBody | undefined;
    return body?.message ?? '요청을 처리하지 못했습니다.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return '요청을 처리하지 못했습니다.';
}
