const KAKAO_AUTHORIZE_URL = 'https://kauth.kakao.com/oauth/authorize';
const KAKAO_CALLBACK_PATH = '/auth/kakao/callback';
const KAKAO_STATE_KEY = 'fishnote:kakaoOAuthState';
const KAKAO_REDIRECT_KEY = 'fishnote:kakaoOAuthRedirect';

export function isKakaoOAuthConfigured() {
  return Boolean(import.meta.env.VITE_KAKAO_REST_API_KEY?.trim());
}

export function startKakaoOAuth(redirectPath: string) {
  const clientId = import.meta.env.VITE_KAKAO_REST_API_KEY?.trim();
  if (!clientId) {
    throw new Error('카카오 로그인이 아직 설정되지 않았습니다.');
  }

  const state = createRandomState();
  const callbackUri = getKakaoCallbackUri();
  sessionStorage.setItem(KAKAO_STATE_KEY, state);
  sessionStorage.setItem(KAKAO_REDIRECT_KEY, safeRedirectPath(redirectPath));

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUri,
    response_type: 'code',
    state,
  });
  window.location.assign(`${KAKAO_AUTHORIZE_URL}?${params.toString()}`);
}

export function consumeKakaoOAuthAttempt(returnedState: string | null) {
  const expectedState = sessionStorage.getItem(KAKAO_STATE_KEY);
  const redirectPath = safeRedirectPath(sessionStorage.getItem(KAKAO_REDIRECT_KEY) ?? '/');
  sessionStorage.removeItem(KAKAO_STATE_KEY);
  sessionStorage.removeItem(KAKAO_REDIRECT_KEY);

  if (!returnedState || !expectedState || returnedState !== expectedState) {
    throw new Error('카카오 로그인 요청을 확인할 수 없습니다. 로그인 페이지에서 다시 시도해 주세요.');
  }
  return redirectPath;
}

export function getKakaoCallbackUri() {
  return `${window.location.origin}${KAKAO_CALLBACK_PATH}`;
}

function createRandomState() {
  const bytes = new Uint8Array(24);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('');
}

function safeRedirectPath(path: string) {
  if (!path.startsWith('/') || path.startsWith('//')) return '/';
  const pathname = path.split(/[?#]/, 1)[0];
  if (pathname === '/login' || pathname === '/signup' || pathname === KAKAO_CALLBACK_PATH) return '/';
  return path;
}
