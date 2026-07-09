interface SeasonBarProps {
  months: number[];
}

export default function SeasonBar({ months }: SeasonBarProps) {
  const active = new Set(months);
  const currentMonth = new Date().getMonth() + 1;

  return (
    <div className="grid grid-cols-12 gap-[3px] pt-[18px]">
      {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
        <div key={month} className="relative min-w-0">
          {month === currentMonth ? (
            <span className="absolute bottom-[19px] left-1/2 -translate-x-1/2 text-[10px] font-bold leading-none text-sea">지금</span>
          ) : null}
          <div className={['h-2 w-full rounded-full', active.has(month) ? 'bg-sea' : 'bg-chipbg'].join(' ')} />
          <span className="mt-[7px] block text-center text-[10px] leading-none text-ink-mute">{month}</span>
        </div>
      ))}
    </div>
  );
}
