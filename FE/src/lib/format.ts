export const PRICE_LABELS: Record<number, string> = {
  1: '부담 없는',
  2: '보통',
  3: '특별한 날',
};

export function formatPriceSymbols(level?: number | null) {
  if (!level || level < 1) {
    return '시세';
  }
  return '₩'.repeat(Math.min(3, level));
}

export function formatPriceLabel(level?: number | null) {
  if (!level) {
    return '';
  }
  return PRICE_LABELS[level] ?? '';
}

export function formatPriceLevel(level?: number | null, options: { withLabel?: boolean } = {}) {
  const symbols = formatPriceSymbols(level);
  const label = formatPriceLabel(level);

  if (!options.withLabel || !label) {
    return symbols;
  }
  return `${symbols} ${label}`;
}

export function formatMonths(months: number[]) {
  const normalized = Array.from(new Set(months.filter((month) => month >= 1 && month <= 12))).sort((a, b) => a - b);

  if (normalized.length === 0) {
    return '정보 준비 중';
  }

  if (normalized.length === 12) {
    return '연중';
  }

  const ranges = buildMonthRanges(normalized);
  return ranges.map(([start, end]) => (start === end ? `${start}월` : `${start}–${end}월`)).join(', ');
}

export function formatSeasonBadge(months: number[]) {
  const label = formatMonths(months);
  return label === '연중' || label === '정보 준비 중' ? label : `제철 ${label}`;
}

export function isInSeasonNow(months: number[], date = new Date()) {
  return months.includes(date.getMonth() + 1);
}

function buildMonthRanges(months: number[]) {
  const ranges: Array<[number, number]> = [];

  months.forEach((month) => {
    const lastRange = ranges[ranges.length - 1];
    if (lastRange && lastRange[1] + 1 === month) {
      lastRange[1] = month;
      return;
    }
    ranges.push([month, month]);
  });

  if (ranges.length > 1 && ranges[0][0] === 1 && ranges[ranges.length - 1][1] === 12) {
    const first = ranges.shift();
    const last = ranges.pop();
    if (first && last) {
      ranges.unshift([last[0], first[1]]);
    }
  }

  return ranges;
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
