import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useBookmarks } from '../hooks/useBookmarks';
import { formatMonths, formatPriceLevel } from '../lib/format';
import type { FishSummary, SimilarFish } from '../types/fish';

interface FishCardProps {
  fish: FishSummary | SimilarFish;
  compact?: boolean;
}

export default function FishCard({ fish, compact = false }: FishCardProps) {
  const summary = fish as FishSummary;
  const hasSummary = 'description' in summary;
  const nameEn = getOptionalString(fish, 'nameEn');
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(fish.id);

  function handleBookmarkClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    toggleBookmark(fish.id);
  }

  return (
    <Link
      to={`/fish/${fish.id}`}
      className="group block overflow-hidden rounded-card border border-line bg-white transition duration-150 hover:-translate-y-[3px] hover:border-brand-500 hover:shadow-[0_12px_30px_rgba(15,148,136,0.09)]"
    >
      <div className="relative flex aspect-[4/3] items-center justify-center bg-[#E6F4F2]">
        {fish.imageUrl ? (
          <img src={fish.imageUrl} alt={fish.name} className="h-full w-full object-cover" />
        ) : (
          <svg viewBox="0 0 64 40" width={compact ? '72' : '82'} height={compact ? '45' : '51'} fill="none" stroke="rgba(15,148,136,0.32)" strokeWidth="1.6" aria-hidden>
            <path d="M2 20 C16 3, 42 3, 52 20 C42 37, 16 37, 2 20 Z" />
            <path d="M50 20 L63 9 L63 31 Z" />
            <circle cx="18" cy="17" r="2" />
          </svg>
        )}
        {'seasonMonths' in summary ? (
          <span className="absolute left-3 top-3 rounded-full bg-brand-50 px-2.5 py-[5px] text-xs font-semibold text-brand-700">
            {formatMonths(summary.seasonMonths)}
          </span>
        ) : null}
        <button
          type="button"
          onClick={handleBookmarkClick}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border-0 bg-white/95 text-faint shadow-sm transition hover:text-brand-700"
          aria-label={bookmarked ? `${fish.name} 저장 해제` : `${fish.name} 저장`}
          aria-pressed={bookmarked}
        >
          <Bookmark className={bookmarked ? 'h-4 w-4 fill-brand-600 text-brand-600' : 'h-4 w-4 fill-none text-faint'} aria-hidden />
        </button>
      </div>

      <div className={compact ? 'p-4' : 'px-4 pb-[17px] pt-[15px]'}>
        <div className="mb-1.5 flex min-w-0 items-baseline gap-2">
          <h3 className="truncate text-[17px] font-semibold tracking-[-0.01em] text-ink">{fish.name}</h3>
          {nameEn ? <span className="truncate text-xs text-faint">{nameEn}</span> : null}
        </div>

        {hasSummary && summary.description ? (
          <p className="mb-3 line-clamp-2 min-h-[39px] text-[13.5px] leading-[1.45] text-muted">{summary.description}</p>
        ) : null}

        {'tasteTags' in summary ? (
          <div className="mb-3.5 flex min-h-7 flex-wrap gap-1.5">
            {summary.tasteTags.map((tag) => (
              <span key={tag} className="rounded-full border border-[#EDF0F2] bg-[#F7F9FA] px-[9px] py-[3px] text-xs text-ink">
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {'priceLevel' in summary || 'avgRating' in summary ? (
          <div className="flex items-center justify-between border-t border-[#F2F4F5] pt-3">
            {'priceLevel' in summary ? (
              <span className="text-sm font-semibold text-brand-700">{formatPriceLevel(summary.priceLevel)}</span>
            ) : (
              <span />
            )}
            {'avgRating' in summary ? (
              <span className="flex items-center gap-1 text-[13px] text-muted">
                <span className="text-accent">★</span>
                <b className="font-semibold text-ink">{summary.avgRating.toFixed(1)}</b>
                <span className="text-faint">({summary.reviewCount})</span>
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </Link>
  );
}

function getOptionalString(value: object, key: string) {
  if (key in value) {
    const maybeString = (value as Record<string, unknown>)[key];
    return typeof maybeString === 'string' ? maybeString : undefined;
  }
  return undefined;
}
