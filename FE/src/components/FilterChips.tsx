import type { Season } from '../types/fish';

const seasons: Array<{ value: Season; label: string }> = [
  { value: 'spring', label: '봄' },
  { value: 'summer', label: '여름' },
  { value: 'fall', label: '가을' },
  { value: 'winter', label: '겨울' },
];

const tastes = ['담백', '기름진', '쫄깃', '고소'];

interface FilterChipsProps {
  season?: Season;
  taste?: string;
  onSeasonChange: (value?: Season) => void;
  onTasteChange: (value?: string) => void;
}

export default function FilterChips({ season, taste, onSeasonChange, onTasteChange }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-2">
        {seasons.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onSeasonChange(season === item.value ? undefined : item.value)}
            className={chipClass(season === item.value)}
          >
            {item.label}
            {season === item.value ? <span aria-hidden>✕</span> : null}
          </button>
        ))}
      </div>
      <span className="mx-0.5 hidden h-8 w-px bg-line sm:block" aria-hidden />
      <div className="flex flex-wrap gap-2">
        {tastes.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onTasteChange(taste === item ? undefined : item)}
            className={chipClass(taste === item)}
          >
            {item}
            {taste === item ? <span aria-hidden>✕</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

function chipClass(active: boolean) {
  return [
    'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-[13px] py-[5px] text-[13px] font-semibold transition duration-150',
    active
      ? 'bg-sea text-white'
      : 'bg-chipbg text-ink hover:text-sea',
  ].join(' ');
}
