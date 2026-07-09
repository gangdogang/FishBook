import { Link, useNavigate } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { useState, type MouseEvent, type ReactNode } from 'react';
import FilterChips from '../components/FilterChips';
import FishCard from '../components/FishCard';
import SearchBar from '../components/SearchBar';
import { useBookmarks } from '../hooks/useBookmarks';
import { useFishList } from '../hooks/useFish';
import { formatPriceLevel, formatSeasonBadge, isInSeasonNow } from '../lib/format';
import type { FishSort, FishSummary, Season } from '../types/fish';

const popularTags = ['광어', '방어', '연어', '참돔'];

export default function HomePage() {
  const navigate = useNavigate();
  const currentMonth = new Date().getMonth() + 1;
  const [season, setSeason] = useState<Season | undefined>();
  const [taste, setTaste] = useState<string | undefined>();
  const [sort, setSort] = useState<FishSort>('popular');
  const { data: fishes = [], isLoading, isError } = useFishList({ season, taste, sort });
  const {
    data: monthFishes = [],
    isLoading: isMonthLoading,
    isError: isMonthError,
  } = useFishList({ month: currentMonth, sort: 'popular' });
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
    navigate(`/search${params.toString() ? `?${params.toString()}` : ''}`);
  }

  function resetFilters() {
    setSeason(undefined);
    setTaste(undefined);
  }

  return (
    <main className="bg-mist pb-20">
      <section className="mx-auto max-w-[980px] px-4 pb-10 pt-12 text-center sm:px-7">
        <h1 className="mb-2 text-[28px] font-extrabold leading-tight text-ink">오늘 이 회, 무슨 생선일까요?</h1>
        <p className="mb-[22px] text-[15px] text-ink-mute">이름·제철·맛·가격대까지, 3초면 확인해요</p>
        <SearchBar placeholder="생선 이름을 입력해 보세요" onSubmit={goSearch} variant="default" />
        <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 text-[13px] text-ink-mute">
          <span>많이 찾는 생선</span>
          {popularTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => goSearch(tag)}
              className="rounded-full bg-chipbg px-3 py-1 text-[13px] font-semibold text-ink transition hover:text-sea"
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[980px] px-4 pt-2 sm:px-7">
        <SectionHeader title={`${currentMonth}월, 지금이 제철이에요`}>
          <Link to="/calendar" className="text-[13px] font-semibold text-sea transition hover:text-sea">
            제철 캘린더 →
          </Link>
        </SectionHeader>

        {isMonthLoading ? <StateText text="이달의 제철 생선을 불러오는 중입니다." /> : null}
        {isMonthError ? <StateText text="이달의 제철 생선을 불러오지 못했습니다." /> : null}
        {!isMonthLoading && !isMonthError && monthFishes.length === 0 ? <StateText text="이달 제철 생선이 아직 없습니다." /> : null}
        {!isMonthLoading && !isMonthError && monthFishes.length > 0 ? (
          <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            <div className="grid auto-cols-[220px] grid-flow-col gap-[14px] sm:auto-cols-fr sm:grid-flow-row sm:grid-cols-2 lg:grid-cols-4">
              {monthFishes.slice(0, 4).map((fish) => (
                <FishCard key={fish.id} fish={fish} />
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="mx-auto max-w-[980px] px-4 pt-9 sm:px-7">
        <SectionHeader title="에디터 추천" />

        {isFeaturedLoading ? <StateText text="에디터 추천을 불러오는 중입니다." /> : null}
        {isFeaturedError ? <StateText text="에디터 추천을 불러오지 못했습니다." /> : null}
        {!isFeaturedLoading && !isFeaturedError && featuredFishes.length === 0 ? <StateText text="추천 생선이 아직 없습니다." /> : null}
        {!isFeaturedLoading && !isFeaturedError && featuredFishes.length > 0 ? (
          <div className="grid gap-[14px] md:grid-cols-2">
            {featuredFishes.slice(0, 2).map((fish) => (
              <FeaturedFishCard key={fish.id} fish={fish} />
            ))}
          </div>
        ) : null}
      </section>

      <section className="mx-auto max-w-[980px] px-4 pt-10 sm:px-7">
        <SectionHeader title="전체 도감" count={isLoading || isError ? undefined : `${fishes.length}종`} />

        <div className="mb-[18px] flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <FilterChips
            season={season}
            taste={taste}
            onSeasonChange={setSeason}
            onTasteChange={setTaste}
            onReset={resetFilters}
            className="min-w-0"
          />
          <SortSegment value={sort} onChange={setSort} />
        </div>

        {isLoading ? <StateText text="도감을 불러오는 중입니다." /> : null}
        {isError ? <StateText text="도감을 불러오지 못했습니다." /> : null}
        {!isLoading && !isError && fishes.length === 0 ? <EmptyFilterState onReset={resetFilters} /> : null}
        {!isLoading && !isError && fishes.length > 0 ? (
          <div className="grid grid-cols-1 gap-[14px] md:grid-cols-2 lg:grid-cols-4">
            {fishes.map((fish) => (
              <FishCard key={fish.id} fish={fish} />
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}

function SectionHeader({ title, count, children }: { title: string; count?: string; children?: ReactNode }) {
  return (
    <div className="mb-[14px] flex items-baseline gap-3">
      <h2 className="m-0 text-[19px] font-extrabold leading-tight text-ink">{title}</h2>
      {count ? <span className="text-[13px] tabular-nums text-ink-mute">{count}</span> : null}
      {children ? <div className="ml-auto flex-none">{children}</div> : null}
    </div>
  );
}

function SortSegment({ value, onChange }: { value: FishSort; onChange: (value: FishSort) => void }) {
  return (
    <div className="inline-flex w-fit flex-none rounded-full border border-line bg-white p-1" aria-label="정렬">
      <button
        type="button"
        onClick={() => onChange('popular')}
        aria-pressed={value === 'popular'}
        className={segmentClass(value === 'popular')}
      >
        인기순
      </button>
      <button
        type="button"
        onClick={() => onChange('name')}
        aria-pressed={value === 'name'}
        className={segmentClass(value === 'name')}
      >
        이름순
      </button>
    </div>
  );
}

function segmentClass(active: boolean) {
  return [
    'min-h-8 rounded-full px-3.5 text-[13px] font-bold transition',
    active ? 'bg-sea text-white' : 'text-ink-mute hover:text-sea',
  ].join(' ');
}

function StateText({ text }: { text: string }) {
  return <div className="rounded-card border border-line bg-white p-8 text-center text-ink-mute">{text}</div>;
}

function EmptyFilterState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-card border border-dashed border-line bg-white px-5 py-12 text-center">
      <h3 className="mb-1 text-[17px] font-bold text-ink">이 조건에 맞는 생선이 아직 없어요</h3>
      <p className="mb-4 text-[14px] text-ink-mute">필터를 하나 줄여보시면 어떨까요?</p>
      <button type="button" onClick={onReset} className="text-[13px] font-bold text-sea transition hover:text-sea">
        필터 초기화
      </button>
    </div>
  );
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
      <div className="relative aspect-[5/2] bg-chipbg">
        {fish.imageUrl ? (
          <img src={fish.imageUrl} alt={`${fish.name} 회 사진`} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg viewBox="0 0 64 40" width="96" height="60" fill="none" strokeWidth="1.5" className="stroke-ink-mute/30" aria-hidden>
              <path d="M2 20 C16 3, 42 3, 52 20 C42 37, 16 37, 2 20 Z" />
              <path d="M50 20 L63 9 L63 31 Z" />
              <circle cx="18" cy="17" r="2" />
            </svg>
          </div>
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
      <div className="p-3.5">
        <div className="mb-[3px] flex min-w-0 items-baseline justify-between gap-2">
          <h3 className="truncate text-[16px] font-bold leading-tight text-ink">{fish.name}</h3>
          {fish.reviewCount > 0 ? (
            <span className="flex flex-none items-center gap-1 whitespace-nowrap text-[13px] font-bold tabular-nums text-ink">
              <span className="text-star">★</span>
              {fish.avgRating.toFixed(1)}
              <span className="font-medium text-ink-mute">({fish.reviewCount})</span>
            </span>
          ) : null}
        </div>
        {fish.description ? <p className="mb-2.5 line-clamp-2 text-[13px] leading-[1.5] text-ink-mute">{fish.description}</p> : null}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex min-w-0 items-center rounded-full border border-line bg-white px-2.5 py-[3px] text-xs font-semibold text-ink-mute">
            <span className="truncate">{formatSeasonBadge(fish.seasonMonths)}</span>
          </span>
          <span className="flex-none text-[13px] font-bold tabular-nums text-ink">{formatPriceLevel(fish.priceLevel)}</span>
        </div>
      </div>
    </Link>
  );
}
