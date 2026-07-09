interface SeasonBarProps {
  months: number[];
}

export default function SeasonBar({ months }: SeasonBarProps) {
  const active = new Set(months);

  return (
    <div className="flex items-end gap-[5px]">
      {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
        <div key={month} className="flex min-w-0 flex-1 flex-col items-center">
          <div className={['w-full rounded-md', active.has(month) ? 'h-11 bg-ink-mute' : 'h-[26px] bg-chipbg'].join(' ')} />
          <span className={['mt-1.5 text-[11px]', active.has(month) ? 'font-semibold text-ink' : 'text-ink-mute/70'].join(' ')}>{month}</span>
        </div>
      ))}
    </div>
  );
}
