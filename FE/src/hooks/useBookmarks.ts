import { useCallback, useMemo, useSyncExternalStore } from 'react';

const BOOKMARK_STORAGE_KEY = 'fishnote:bookmarkedFishIds';

type BookmarkSnapshot = number[];

const listeners = new Set<() => void>();
const emptySnapshot: BookmarkSnapshot = [];
let cachedRawValue: string | null | undefined;
let cachedSnapshot: BookmarkSnapshot = emptySnapshot;

function readBookmarks(): BookmarkSnapshot {
  if (typeof window === 'undefined') return emptySnapshot;

  let rawValue: string | null;
  try {
    rawValue = window.localStorage.getItem(BOOKMARK_STORAGE_KEY);
  } catch {
    return emptySnapshot;
  }

  if (rawValue === cachedRawValue) return cachedSnapshot;
  cachedRawValue = rawValue;

  if (!rawValue) {
    cachedSnapshot = emptySnapshot;
    return cachedSnapshot;
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) {
      cachedSnapshot = emptySnapshot;
      return cachedSnapshot;
    }

    const ids = parsed
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value > 0);

    cachedSnapshot = Array.from(new Set(ids));
    return cachedSnapshot;
  } catch {
    cachedSnapshot = emptySnapshot;
    return cachedSnapshot;
  }
}

function writeBookmarks(ids: BookmarkSnapshot) {
  try {
    window.localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    return;
  }

  cachedRawValue = undefined;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  function handleStorage(event: StorageEvent) {
    if (event.key === BOOKMARK_STORAGE_KEY) {
      listener();
    }
  }

  window.addEventListener('storage', handleStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', handleStorage);
  };
}

export function useBookmarks() {
  const bookmarkedIds = useSyncExternalStore(subscribe, readBookmarks, () => emptySnapshot);
  const bookmarkedIdSet = useMemo(() => new Set(bookmarkedIds), [bookmarkedIds]);

  const isBookmarked = useCallback((fishId: number) => bookmarkedIdSet.has(fishId), [bookmarkedIdSet]);

  const toggleBookmark = useCallback((fishId: number) => {
    const currentIds = readBookmarks();
    const nextIds = currentIds.includes(fishId)
      ? currentIds.filter((id) => id !== fishId)
      : [...currentIds, fishId];

    writeBookmarks(nextIds);
  }, []);

  return {
    bookmarkedIds,
    bookmarkedIdSet,
    bookmarkCount: bookmarkedIds.length,
    isBookmarked,
    toggleBookmark,
  };
}
