import { Check } from 'lucide-react';
import { useMemo, useState } from 'react';
import FishCard from '../components/FishCard';
import { useFishList } from '../hooks/useFish';

const months = Array.from({ length: 12 }, (_, index) => index + 1);

export default function CalendarPage() {
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1);
  const {
    data: monthFishes = [],
    isLoading: isMonthLoading,
    isError: isMonthError,
  } = useFishList({ month: selectedMonth, sort: 'popular' });
  const {
    data: allFishes = [],
    isLoading: isCountsLoading,
    isError: isCountsError,
  } = useFishList({ sort: 'popular' });

  const monthCounts = useMemo(
    () =>
      months.reduce<Record<number, number>>((counts, month) => {
        counts[month] = allFishes.filter((fish) => fish.seasonMonths.includes(month)).length;
        return counts;
      }, {}),
    [allFishes],
  );

  return (
    <main className="mx-auto max-w-[980px] px-4 pb-20 pt-9 sm:px-7">
      <h1 className="mb-2 text-[30px] font-bold tracking-[-0.03em] text-ink">제철 캘린더</h1>
      <p className="mb-[26px] text-[15.5px] leading-[1.5] text-ink-mute">달을 선택하면 그 달에 제철인 회를 모아 보여드려요.</p>

      <div className="mb-8 grid grid-cols-2 gap-[9px] sm:grid-cols-4 lg:grid-cols-6">
        {months.map((month) => {
          const active = selectedMonth === month;
          const count = isCountsLoading || isCountsError ? '-' : monthCounts[month] ?? 0;

          return (
            <button
              key={month}
              type="button"
              onClick={() => setSelectedMonth(month)}
              className={
                active
                  ? 'inline-flex items-center justify-center gap-[5px] rounded-[11px] border border-transparent bg-sea px-2.5 py-[11px] text-sm font-bold text-white transition'
                  : 'inline-flex items-center justify-center gap-[5px] rounded-[11px] border border-line bg-white px-2.5 py-[11px] text-sm font-medium text-ink transition hover:border-sea hover:text-sea'
              }
              aria-pressed={active}
            >
              {active ? <Check className="h-3.5 w-3.5 flex-none stroke-[3]" aria-hidden /> : null}
              {month}월
              <span
                className={
                  active
                    ? 'inline-flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-white/25 px-1 text-[11px] font-semibold text-white'
                    : 'inline-flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-chipbg px-1 text-[11px] font-semibold text-ink-mute/70'
                }
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h2 className="m-0 text-[22px] font-bold tracking-[-0.02em] text-ink">
          {selectedMonth}월 제철{' '}
          <span className="text-[17px] font-medium text-ink-mute/70">{isMonthLoading || isMonthError ? '-' : monthFishes.length}종</span>
        </h2>
        <span className="rounded-full bg-sea-soft px-3 py-[5px] text-[13px] font-semibold text-sea">
          {seasonOfMonth(selectedMonth)} 제철
        </span>
      </div>

      {isMonthLoading ? <StateText text="제철 생선을 불러오는 중입니다." /> : null}
      {isMonthError ? <StateText text="제철 생선을 불러오지 못했습니다." /> : null}
      {!isMonthLoading && !isMonthError && monthFishes.length === 0 ? <EmptyState /> : null}
      {!isMonthLoading && !isMonthError && monthFishes.length > 0 ? (
        <div className="grid gap-[22px] [grid-template-columns:repeat(auto-fill,minmax(256px,1fr))]">
          {monthFishes.map((fish) => (
            <FishCard key={fish.id} fish={fish} />
          ))}
        </div>
      ) : null}
    </main>
  );
}

function seasonOfMonth(month: number) {
  if (month >= 3 && month <= 5) return '봄';
  if (month >= 6 && month <= 8) return '여름';
  if (month >= 9 && month <= 11) return '가을';
  return '겨울';
}

function StateText({ text }: { text: string }) {
  return <div className="rounded-card border border-line bg-white p-8 text-center text-ink-mute">{text}</div>;
}

function EmptyState() {
  return (
    <div className="rounded-card border border-dashed border-line px-5 py-[60px] text-center">
      <p className="m-0 text-[14.5px] text-ink-mute">이 달에 등록된 제철 회가 아직 없어요.</p>
    </div>
  );
}
