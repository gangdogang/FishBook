import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useBookmarks } from '../hooks/useBookmarks';
import { formatPriceLevel, formatSeasonBadge, isInSeasonNow } from '../lib/format';
import type { FishSummary, SimilarFish } from '../types/fish';

interface FishCardProps {
  fish: FishSummary | SimilarFish;
  compact?: boolean;
}

export default function FishCard({ fish, compact = false }: FishCardProps) {
  const summary = fish as FishSummary;
  const hasSummary = 'description' in summary;
  const nameEn = getOptionalString(fish, 'nameEn');
  const seasonMonths = 'seasonMonths' in summary ? summary.seasonMonths : [];
  const inSeasonNow = seasonMonths.length > 0 && isInSeasonNow(seasonMonths);
  const reviewCount = 'reviewCount' in summary ? summary.reviewCount : undefined;
  const shouldShowRating = 'avgRating' in summary && typeof reviewCount === 'number' && reviewCount > 0;
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
      className="group block overflow-hidden rounded-card border border-line bg-white shadow-none transition duration-150 hover:shadow-[0_8px_24px_rgba(26,43,51,0.08)]"
    >
      <div className="relative flex aspect-[4/3] items-center justify-center bg-chipbg">
        {fish.imageUrl ? (
          <img src={fish.imageUrl} alt={`${fish.name} 회 사진`} className="h-full w-full object-cover" />
        ) : (
          <svg viewBox="0 0 64 40" width={compact ? '72' : '82'} height={compact ? '45' : '51'} fill="none" strokeWidth="1.6" className="stroke-ink-mute/30" aria-hidden>
            <path d="M2 20 C16 3, 42 3, 52 20 C42 37, 16 37, 2 20 Z" />
            <path d="M50 20 L63 9 L63 31 Z" />
            <circle cx="18" cy="17" r="2" />
          </svg>
        )}
        {inSeasonNow ? <SeasonBadgeNow className="absolute left-2.5 top-2.5" /> : null}
        <button
          type="button"
          onClick={handleBookmarkClick}
          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white/90 text-ink-mute transition hover:text-sea"
          aria-label={bookmarked ? `${fish.name} 저장 해제` : `${fish.name} 저장`}
          aria-pressed={bookmarked}
        >
          <Heart className={bookmarked ? 'h-4 w-4 fill-sea text-sea' : 'h-4 w-4 fill-none text-ink-mute/70'} aria-hidden />
        </button>
      </div>

      <div className={compact ? 'p-3.5' : 'p-3.5'}>
        <div className="flex min-w-0 items-baseline justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-[16px] font-bold leading-tight text-ink">{fish.name}</h3>
            {nameEn ? <span className="block truncate text-xs leading-snug text-ink-mute">{nameEn}</span> : null}
          </div>
          {shouldShowRating ? <RatingSummary avgRating={summary.avgRating} reviewCount={reviewCount} /> : null}
        </div>

        {hasSummary && summary.description ? (
          <p className="mb-2.5 mt-[3px] truncate text-[13px] leading-[1.5] text-ink-mute">{summary.description}</p>
        ) : null}

        {'priceLevel' in summary || seasonMonths.length > 0 ? (
          <div className="flex items-center justify-between gap-2">
            {seasonMonths.length > 0 ? <SeasonBadgeOutline label={formatSeasonBadge(seasonMonths)} /> : <span />}
            {'priceLevel' in summary ? (
              <span className="flex-none text-[13px] font-bold tabular-nums text-ink">{formatPriceLevel(summary.priceLevel)}</span>
            ) : (
              <span />
            )}
          </div>
        ) : null}
      </div>
    </Link>
  );
}

function SeasonBadgeNow({ className = '' }: { className?: string }) {
  return (
    <span className={['inline-flex items-center gap-[5px] rounded-full bg-sea px-2.5 py-[3px] text-xs font-bold text-white', className].join(' ')}>
      <span className="h-[5px] w-[5px] rounded-full bg-white" aria-hidden />
      지금 제철
    </span>
  );
}

function SeasonBadgeOutline({ label }: { label: string }) {
  return (
    <span className="inline-flex min-w-0 items-center rounded-full border border-line bg-white px-2.5 py-[3px] text-xs font-semibold text-ink-mute">
      <span className="truncate">{label}</span>
    </span>
  );
}

function RatingSummary({ avgRating, reviewCount }: { avgRating: number; reviewCount: number }) {
  return (
    <span className="flex flex-none items-center gap-1 whitespace-nowrap text-[13px] font-bold tabular-nums text-ink">
      <span className="text-star">★</span>
      {avgRating.toFixed(1)}
      <span className="font-medium text-ink-mute">({reviewCount})</span>
    </span>
  );
}

function getOptionalString(value: object, key: string) {
  if (key in value) {
    const maybeString = (value as Record<string, unknown>)[key];
    return typeof maybeString === 'string' ? maybeString : undefined;
  }
  return undefined;
}
