export function chipClass(active: boolean) {
  return [
    'inline-flex min-h-11 items-center gap-1 whitespace-nowrap rounded-full px-3.25 py-1.75 text-13 font-semibold transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea focus-visible:ring-offset-2',
    active ? 'bg-sea text-white' : 'bg-chipbg text-ink hover:text-sea',
  ].join(' ');
}

export function inputClass(hasError: boolean) {
  return [
    'block w-full rounded-btn border bg-mist px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-mute/70 focus:border-sea',
    hasError ? 'border-red-300 dark:border-red-900' : 'border-line',
  ].join(' ');
}
