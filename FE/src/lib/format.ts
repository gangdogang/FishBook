export function formatPriceLevel(level?: number | null) {
  if (!level) {
    return '시세';
  }
  return '₩'.repeat(level);
}

export function formatMonths(months: number[]) {
  return months.map((month) => `${month}월`).join(', ');
}

export function seasonLabel(season?: string) {
  switch (season) {
    case 'spring':
      return '봄';
    case 'summer':
      return '여름';
    case 'fall':
      return '가을';
    case 'winter':
      return '겨울';
    default:
      return '전체';
  }
}
