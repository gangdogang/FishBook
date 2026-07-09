import { useMemo } from 'react';
import { useFishList } from '../hooks/useFish';

const months = Array.from({ length: 12 }, (_, index) => index + 1);

interface MonthSidebarProps {
  selectedMonth?: number;
  onSelect: (month?: number) => void;
}

export default function MonthSidebar({ selectedMonth, onSelect }: MonthSidebarProps) {
  const { data: allFishes = [], isLoading, isError } = useFishList({ sort: 'popular' });

  const monthCounts = useMemo(
    () =>
      months.reduce<Record<number, number>>((counts, month) => {
        counts[month] = allFishes.filter((fish) => fish.seasonMonths.includes(month)).length;
        return counts;
      }, {}),
    [allFishes],
  );

  const countLabel = (month: number) => (isLoading || isError ? '-' : monthCounts[month] ?? 0);

  function handleClick(month: number) {
    onSelect(selectedMonth === month ? undefined : month);
  }

  return (
    <>
      {/* Desktop: vertical sticky list */}
      <nav className="hidden rounded-card border border-line bg-white px-3 py-4 lg:block" aria-label="월별 제철 탐색">
        <div className="mb-2.5 px-2 text-[12.5px] font-semibold text-ink-mute/70">월별 제철</div>
        <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
          <li>
            <button
              type="button"
              onClick={() => onSelect(undefined)}
              aria-pressed={selectedMonth === undefined}
              className={
                selectedMonth === undefined
                  ? 'flex w-full items-center justify-between rounded-[10px] bg-sea px-3 py-[9px] text-sm font-bold text-white transition'
                  : 'flex w-full items-center justify-between rounded-[10px] bg-transparent px-3 py-[9px] text-sm font-medium text-ink transition hover:bg-sea-soft hover:text-sea'
              }
            >
              전체 보기
            </button>
          </li>
          {months.map((month) => {
            const active = selectedMonth === month;
            return (
              <li key={month}>
                <button
                  type="button"
                  onClick={() => handleClick(month)}
                  aria-pressed={active}
                  className={
                    active
                      ? 'flex w-full items-center justify-between rounded-[10px] bg-sea px-3 py-[9px] text-sm font-bold text-white transition'
                      : 'flex w-full items-center justify-between rounded-[10px] bg-transparent px-3 py-[9px] text-sm font-medium text-ink transition hover:bg-sea-soft hover:text-sea'
                  }
                >
                  <span>{month}월</span>
                  <span
                    className={
                      active
                        ? 'inline-flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-white/25 px-1.5 text-[11.5px] font-semibold text-white'
                        : 'inline-flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-chipbg px-1.5 text-[11.5px] font-semibold text-ink-mute'
                    }
                  >
                    {countLabel(month)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile: horizontal scrollable strip, sticky under the header */}
      <nav
        className="sticky top-[66px] z-30 -mx-4 border-b border-line bg-white/95 px-4 py-2.5 backdrop-blur-[10px] sm:-mx-7 sm:px-7 lg:hidden"
        aria-label="월별 제철 탐색"
      >
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => onSelect(undefined)}
            aria-pressed={selectedMonth === undefined}
            className={
              selectedMonth === undefined
                ? 'flex-none whitespace-nowrap rounded-full border border-transparent bg-sea px-3.5 py-[7px] text-[13px] font-semibold text-white transition'
                : 'flex-none whitespace-nowrap rounded-full border border-line bg-white px-3.5 py-[7px] text-[13px] font-medium text-ink transition hover:border-sea hover:text-sea'
            }
          >
            전체
          </button>
          {months.map((month) => {
            const active = selectedMonth === month;
            return (
              <button
                key={month}
                type="button"
                onClick={() => handleClick(month)}
                aria-pressed={active}
                className={
                  active
                    ? 'flex-none whitespace-nowrap rounded-full border border-transparent bg-sea px-3.5 py-[7px] text-[13px] font-semibold text-white transition'
                    : 'flex-none whitespace-nowrap rounded-full border border-line bg-white px-3.5 py-[7px] text-[13px] font-medium text-ink transition hover:border-sea hover:text-sea'
                }
              >
                {month}월 <span className={active ? 'text-white/80' : 'text-ink-mute/70'}>{countLabel(month)}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
