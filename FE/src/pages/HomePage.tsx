import { Link, useNavigate } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import type { MouseEvent } from 'react';
import FilterChips from '../components/FilterChips';
import FishCard from '../components/FishCard';
import MonthSidebar from '../components/MonthSidebar';
import { useBookmarks } from '../hooks/useBookmarks';
import { useFishList } from '../hooks/useFish';
import { formatPriceLevel, formatSeasonBadge, isInSeasonNow } from '../lib/format';
import type { FishSummary, Season } from '../types/fish';
import { useState } from 'react';

const popularTags = ['광어', '방어', '연어', '참돔'];

export default function HomePage() {
  const navigate = useNavigate();
  const [season, setSeason] = useState<Season | undefined>();
  const [taste, setTaste] = useState<string | undefined>();
  const [month, setMonth] = useState<number | undefined>();
  const { data: fishes = [], isLoading, isError } = useFishList({ season, taste, month, sort: 'popular' });
  const {
    data: featuredFishes = [],
    isLoading: isFeaturedLoading,
    isError: isFeaturedError,
  } = useFishList({ featured: true, sort: 'popular' });

  function goSearch(search?: string) {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (season) params.set('season', season);
    if (taste) params.set('taste', taste);
    navigate(`/search?${params.toString()}`);
  }

  function handleMonthSelect(nextMonth?: number) {
    setMonth(nextMonth);
    if (nextMonth) setSeason(undefined);
  }

  function handleSeasonChange(nextSeason?: Season) {
    setSeason(nextSeason);
    if (nextSeason) setMonth(undefined);
  }

  return (
    <main className="bg-mist">
      <section className="border-b border-line bg-mist">
        <div className="mx-auto max-w-[980px] px-4 py-10 text-center sm:px-7 sm:pb-9">
          <div className="mb-[18px] inline-flex items-center gap-[7px] rounded-full bg-sea-soft px-[13px] py-1.5 text-[13px] font-semibold text-sea">
            <span className="h-1.5 w-1.5 rounded-full bg-sea" aria-hidden />
            지금은 {currentSeasonLabel()} 제철
          </div>
          <h1 className="mx-auto mb-3 max-w-[600px] text-[34px] font-bold leading-[1.18] tracking-[-0.035em] text-ink sm:text-[38px]">
            내가 먹는 회, 어떤 생선인지 알고 드세요
          </h1>
          <p className="mx-auto max-w-[480px] text-[16.5px] leading-[1.55] text-ink-mute">
            제철·맛·가격으로 둘러보는 회 도감. 횟집 가기 전에 미리 만나보세요.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[13px] text-ink-mute/70">인기 검색</span>
            {popularTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => goSearch(tag)}
                className="rounded-full border border-line bg-white px-3 py-[5px] text-[13px] text-ink transition hover:border-sea hover:text-sea"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[980px] px-4 pb-2 pt-11 sm:px-7">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <div className="mb-1.5 text-[13px] font-semibold tracking-[0.02em] text-ink-mute">EDITOR'S PICK</div>
            <h2 className="m-0 text-[26px] font-bold tracking-[-0.025em] text-ink">지금 가장 사랑받는 회</h2>
          </div>
          <Link to="/search" className="flex flex-none items-center gap-1 text-sm text-ink-mute transition hover:text-sea">
            전체 보기
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M9 6l6 6-6 6" />
            </svg>
          </Link>
        </div>

        {isFeaturedLoading ? <StateText text="에디터 추천을 불러오는 중입니다." /> : null}
        {isFeaturedError ? <StateText text="에디터 추천을 불러오지 못했습니다." /> : null}
        {!isFeaturedLoading && !isFeaturedError && featuredFishes.length === 0 ? <StateText text="추천 생선이 아직 없습니다." /> : null}
        {!isFeaturedLoading && !isFeaturedError && featuredFishes.length > 0 ? (
          <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(290px,1fr))]">
            {featuredFishes.map((fish) => (
              <FeaturedFishCard key={fish.id} fish={fish} />
            ))}
          </div>
        ) : null}
      </section>

      <section className="mx-auto max-w-[980px] px-4 pb-20 pt-6 sm:px-7 lg:flex lg:items-start lg:gap-8 lg:pt-12">
        <aside className="lg:sticky lg:top-[82px] lg:w-[232px] lg:flex-none">
          <MonthSidebar selectedMonth={month} onSelect={handleMonthSelect} />
        </aside>

        <div className="min-w-0 flex-1 pt-5 lg:pt-0">
          <div className="mb-[22px] flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="m-0 text-2xl font-bold tracking-[-0.025em] text-ink">
              {month ? `${month}월 제철 도감` : '전체 도감'}{' '}
              <span className="text-lg font-medium text-ink-mute/70">{isLoading ? '' : `${fishes.length}종`}</span>
            </h2>
            <FilterChips season={season} taste={taste} onSeasonChange={handleSeasonChange} onTasteChange={setTaste} />
          </div>

          {isLoading ? <StateText text="불러오는 중입니다." /> : null}
          {isError ? <StateText text="목록을 불러오지 못했습니다." /> : null}
          {!isLoading && !isError && fishes.length === 0 ? <StateText text="조건에 맞는 생선이 없습니다." /> : null}
          {!isLoading && !isError ? (
            <div className="grid gap-[22px] [grid-template-columns:repeat(auto-fill,minmax(256px,1fr))]">
              {fishes.map((fish) => (
                <FishCard key={fish.id} fish={fish} />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function StateText({ text }: { text: string }) {
  return <div className="rounded-card border border-line bg-white p-8 text-center text-ink-mute">{text}</div>;
}

function FeaturedFishCard({ fish }: { fish: FishSummary }) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(fish.id);
  const inSeasonNow = isInSeasonNow(fish.seasonMonths);

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
      <div className="relative flex aspect-[16/10] items-center justify-center bg-chipbg">
        {fish.imageUrl ? (
          <img src={fish.imageUrl} alt={`${fish.name} 회 사진`} className="h-full w-full object-cover" />
        ) : (
          <svg viewBox="0 0 64 40" width="110" height="69" fill="none" strokeWidth="1.5" className="stroke-ink-mute/30" aria-hidden>
            <path d="M2 20 C16 3, 42 3, 52 20 C42 37, 16 37, 2 20 Z" />
            <path d="M50 20 L63 9 L63 31 Z" />
            <circle cx="18" cy="17" r="2" />
          </svg>
        )}
        {inSeasonNow ? (
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-[5px] rounded-full bg-sea px-2.5 py-[3px] text-xs font-bold text-white">
            <span className="h-[5px] w-[5px] rounded-full bg-white" aria-hidden />
            지금 제철
          </span>
        ) : null}
        <button
          type="button"
          onClick={handleBookmarkClick}
          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white/90 text-ink-mute transition hover:text-sea"
          aria-label={bookmarked ? `${fish.name} 저장 해제` : `${fish.name} 저장`}
          aria-pressed={bookmarked}
        >
          <Bookmark className={bookmarked ? 'h-4 w-4 fill-sea text-sea' : 'h-4 w-4 fill-none text-ink-mute/70'} aria-hidden />
        </button>
      </div>
      <div className="px-5 pb-5 pt-[18px]">
        <div className="mb-[7px] flex min-w-0 items-baseline justify-between gap-[9px]">
          <h3 className="m-0 truncate text-xl font-bold text-ink">{fish.name}</h3>
          {fish.reviewCount > 0 ? (
            <span className="flex flex-none items-center gap-1 whitespace-nowrap text-[13px] font-bold tabular-nums text-ink">
              <span className="text-star">★</span>
              {fish.avgRating.toFixed(1)}
              <span className="font-medium text-ink-mute">({fish.reviewCount})</span>
            </span>
          ) : null}
        </div>
        {fish.description ? <p className="mb-3.5 line-clamp-2 text-sm leading-[1.5] text-ink-mute">{fish.description}</p> : null}
        <div className="flex flex-wrap items-center gap-[7px]">
          <span className="inline-flex rounded-full border border-line bg-white px-2.5 py-[3px] text-xs font-semibold text-ink-mute">
            {formatSeasonBadge(fish.seasonMonths)}
          </span>
          {fish.tasteTags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-full bg-chipbg px-[13px] py-[5px] text-[13px] font-semibold text-ink">
              {tag}
            </span>
          ))}
          <span className="ml-auto flex-none text-[13px] font-bold tabular-nums text-ink">{formatPriceLevel(fish.priceLevel)}</span>
        </div>
      </div>
    </Link>
  );
}

function currentSeasonLabel(date = new Date()) {
  const month = date.getMonth() + 1;
  if (month >= 3 && month <= 5) return '봄';
  if (month >= 6 && month <= 8) return '여름';
  if (month >= 9 && month <= 11) return '가을';
  return '겨울';
}
