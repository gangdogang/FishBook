import { useEffect } from 'react';

const DEFAULT_TITLE = 'FishNote — 회 도감 | 제철·맛·가격으로 보는 생선';
const DEFAULT_DESCRIPTION = '내가 먹는 회가 어떤 생선인지, 제철·맛·가격을 한눈에. 회 도감 FishNote.';
const DEFAULT_IMAGE = '/fish/gwangeo.jpg';

function setMeta(selector: string, content: string) {
  const element = document.querySelector<HTMLMetaElement>(selector);
  if (element) {
    element.setAttribute('content', content);
  }
}

/**
 * 라우트별 document.title / description 동기화 (SPA 동적 메타).
 * title에 페이지 이름만 넘기면 "이름 | FishNote" 형태로 표시된다.
 */
export function usePageMeta(title?: string, description?: string, imageUrl?: string | null) {
  useEffect(() => {
    const nextTitle = title ? `${title} | FishNote` : DEFAULT_TITLE;
    const nextDescription = description ?? DEFAULT_DESCRIPTION;
    const canonicalUrl = new URL(window.location.pathname, window.location.origin).toString();
    const socialImageUrl = new URL(imageUrl || DEFAULT_IMAGE, window.location.origin).toString();

    document.title = nextTitle;
    setMeta('meta[name="description"]', nextDescription);
    setMeta('meta[property="og:title"]', nextTitle);
    setMeta('meta[property="og:description"]', nextDescription);
    setMeta('meta[property="og:url"]', canonicalUrl);
    setMeta('meta[property="og:image"]', socialImageUrl);
    setMeta('meta[name="twitter:title"]', nextTitle);
    setMeta('meta[name="twitter:description"]', nextDescription);
    setMeta('meta[name="twitter:image"]', socialImageUrl);
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', canonicalUrl);

    return () => {
      document.title = DEFAULT_TITLE;
      setMeta('meta[name="description"]', DEFAULT_DESCRIPTION);
      setMeta('meta[property="og:title"]', DEFAULT_TITLE);
      setMeta('meta[property="og:description"]', DEFAULT_DESCRIPTION);
      setMeta('meta[property="og:image"]', new URL(DEFAULT_IMAGE, window.location.origin).toString());
    };
  }, [title, description, imageUrl]);
}
