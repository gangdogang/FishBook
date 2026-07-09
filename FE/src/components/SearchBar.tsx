import { FormEvent, useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  initialValue?: string;
  placeholder?: string;
  onSubmit: (value: string) => void;
  variant?: 'default' | 'compact';
  className?: string;
}

export default function SearchBar({
  initialValue = '',
  placeholder = '생선 검색 (예: 광어, 방어)',
  onSubmit,
  variant = 'default',
  className = '',
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(value.trim());
  }

  const isCompact = variant === 'compact';

  return (
    <form
      onSubmit={handleSubmit}
      className={[
        isCompact
          ? 'flex h-9 w-full min-w-0 items-center gap-2 rounded-full border border-line bg-mist py-0 pl-3 pr-1.5'
          : 'mx-auto flex min-h-[58px] w-full max-w-[520px] min-w-0 items-center gap-3 rounded-card border-[1.5px] border-line bg-white py-0 pl-[18px] pr-2',
        className,
      ].join(' ')}
    >
      <Search className={isCompact ? 'h-3.5 w-3.5 flex-none text-ink-mute/70' : 'h-[17px] w-[17px] flex-none text-ink-mute/70'} aria-hidden />
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className={isCompact ? 'min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-mute/70' : 'min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-mute/70'}
      />
      <button
        className={isCompact ? 'flex h-7 w-7 flex-none items-center justify-center rounded-full bg-sea text-white transition hover:bg-sea' : 'inline-flex h-11 flex-none items-center justify-center rounded-[10px] bg-sea px-[18px] text-sm font-bold text-white transition hover:bg-sea'}
        type="submit"
        aria-label="검색"
      >
        {isCompact ? <Search className="h-3.5 w-3.5" aria-hidden /> : '검색'}
      </button>
    </form>
  );
}
