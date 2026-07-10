import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

interface CardCarouselProps {
  ariaLabel: string;
  children: ReactNode;
}

// 가로 스크롤 슬라이더. 모바일은 손가락 스와이프, 데스크톱은 양옆 화살표.
// 자식 요소들이 각자 flex-none 폭을 갖고 있어야 한다.
export default function CardCarousel({ ariaLabel, children }: CardCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  function updateArrows() {
    const track = trackRef.current;
    if (!track) return;
    setCanPrev(track.scrollLeft > 8);
    setCanNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 8);
  }

  useEffect(() => {
    updateArrows();
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(updateArrows);
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  function scrollByPage(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.9, behavior: 'smooth' });
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={updateArrows}
        role="region"
        aria-label={ariaLabel}
        className="-mx-4 flex snap-x snap-mandatory gap-[14px] overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {canPrev ? (
        <button type="button" onClick={() => scrollByPage(-1)} aria-label="이전" className={arrowClass('left')}>
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
      ) : null}
      {canNext ? (
        <button type="button" onClick={() => scrollByPage(1)} aria-label="다음" className={arrowClass('right')}>
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

function arrowClass(side: 'left' | 'right') {
  return [
    'absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full',
    'border border-line bg-white/95 text-ink shadow-[0_6px_18px_rgba(26,43,51,0.14)] transition hover:text-sea sm:flex',
    side === 'left' ? '-left-4' : '-right-4',
  ].join(' ');
}
