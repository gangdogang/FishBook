import { Link } from 'react-router-dom';
import FishCard from '../components/FishCard';
import { useBookmarks } from '../hooks/useBookmarks';
import { useFishList } from '../hooks/useFish';

export default function SavedPage() {
  const { bookmarkedIdSet, bookmarkCount } = useBookmarks();
  const { data: fishes = [], isLoading, isError } = useFishList({ sort: 'popular' });
  const savedFishes = fishes.filter((fish) => bookmarkedIdSet.has(fish.id));

  return (
    <main className="mx-auto max-w-[1200px] px-4 pb-20 pt-8 sm:px-7">
      <div className="mb-[22px] flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1.5 text-[13px] font-semibold tracking-[0.02em] text-ink-mute">SAVED FISH</p>
          <h1 className="m-0 text-2xl font-bold tracking-[-0.025em] text-ink">
            저장한 도감 <span className="text-lg font-medium text-ink-mute/70">{bookmarkCount}종</span>
          </h1>
        </div>
        <Link to="/search" className="text-sm font-semibold text-sea transition hover:text-sea">
          전체 도감 둘러보기
        </Link>
      </div>

      {isLoading ? <StateText text="저장한 도감을 불러오는 중입니다." /> : null}
      {isError ? <StateText text="저장한 도감을 불러오지 못했습니다." /> : null}
      {!isLoading && !isError && bookmarkCount === 0 ? <EmptyState /> : null}
      {!isLoading && !isError && bookmarkCount > 0 && savedFishes.length === 0 ? (
        <StateText text="저장한 생선을 현재 도감에서 찾을 수 없습니다." />
      ) : null}
      {!isLoading && !isError && savedFishes.length > 0 ? (
        <div className="grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(232px,1fr))]">
          {savedFishes.map((fish) => (
            <FishCard key={fish.id} fish={fish} />
          ))}
        </div>
      ) : null}
    </main>
  );
}

function StateText({ text }: { text: string }) {
  return <div className="rounded-card border border-line bg-white p-8 text-center text-ink-mute">{text}</div>;
}

function EmptyState() {
  return (
    <div className="rounded-card border border-dashed border-line px-5 py-[72px] text-center">
      <div className="mx-auto mb-5 flex h-[84px] w-[84px] items-center justify-center rounded-full bg-chipbg">
        <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="#C2C8CC" strokeWidth="1.8" aria-hidden>
          <path d="M6 4h12v16l-6-4-6 4z" />
        </svg>
      </div>
      <h2 className="mb-2 text-lg font-bold text-ink">저장한 생선이 없어요</h2>
      <p className="mb-5 text-[14.5px] leading-[1.5] text-ink-mute">도감에서 마음에 드는 생선을 저장해두면 여기에서 다시 볼 수 있어요.</p>
      <Link
        to="/search"
        className="inline-flex rounded-[10px] border border-sea bg-white px-[22px] py-[11px] text-sm font-semibold text-sea transition hover:bg-sea-soft"
      >
        도감 둘러보기
      </Link>
    </div>
  );
}
