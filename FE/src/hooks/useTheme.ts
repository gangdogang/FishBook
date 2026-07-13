import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'fishnote-theme';

/** index.html의 부트 스크립트와 짝: html.dark 클래스가 단일 진실 소스 */
function isDarkNow() {
  return document.documentElement.classList.contains('dark');
}

let listeners: Array<() => void> = [];

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((item) => item !== listener);
  };
}

export function useTheme() {
  const isDark = useSyncExternalStore(subscribe, isDarkNow, () => false);

  const toggleTheme = useCallback(() => {
    const nextDark = !isDarkNow();
    document.documentElement.classList.toggle('dark', nextDark);
    try {
      localStorage.setItem(STORAGE_KEY, nextDark ? 'dark' : 'light');
    } catch {
      // 사파리 프라이빗 모드 등 저장 불가 환경은 무시
    }
    emit();
  }, []);

  return { isDark, toggleTheme };
}
