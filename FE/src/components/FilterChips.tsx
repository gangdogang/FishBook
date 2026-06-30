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
          </button>
        ))}
      </div>
    </div>
  );
}

function chipClass(active: boolean) {
  return [
    'whitespace-nowrap rounded-full border px-3.5 py-[7px] text-[13px] transition duration-150',
    active
      ? 'border-transparent bg-brand-500 font-semibold text-white'
      : 'border-line bg-white font-medium text-ink hover:border-brand-500 hover:text-brand-700',
  ].join(' ');
}
