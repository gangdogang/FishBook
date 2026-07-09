import { FormEvent, useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  initialValue?: string;
  placeholder?: string;
  onSubmit: (value: string) => void;
}

export default function SearchBar({ initialValue = '', placeholder = '생선 검색 (예: 광어, 방어)', onSubmit }: SearchBarProps) {
  const [value, setValue] = useState(initialValue);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(value.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-10 w-full min-w-0 items-center gap-2 rounded-[10px] border border-line bg-chipbg py-0 pl-[13px] pr-[5px]">
      <Search className="h-[17px] w-[17px] flex-none text-ink-mute/70" aria-hidden />
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-mute/70"
      />
      <button className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[7px] bg-sea text-white transition hover:bg-sea" type="submit" aria-label="검색">
        <Search className="h-[15px] w-[15px]" aria-hidden />
      </button>
    </form>
  );
}
