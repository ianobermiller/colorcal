export function dateRangeAlignWeek(start: Date, end: Date): (Date | null)[] {
  const dates: (Date | null)[] = dateRange(start, end);

  const firstDayOfWeek = dates[0]?.getUTCDay() ?? 0;

  // Filler days
  for (let i = 0; i < firstDayOfWeek; i++) {
    dates.unshift(null);
  }

  console.log({ dates });

  return dates;
}

export function dateRange(tryStart: Date, tryEnd: Date): Date[] {
  const [start, end] = tryStart < tryEnd ? [tryStart, tryEnd] : [tryEnd, tryStart];

  const dates: Date[] = [];
  let current = start;
  while (current <= end) {
    dates.push(current);
    current = new Date(current);
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return dates;
}

export function toISODateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getDayOfWeek(date: Date): string {
  return date.toLocaleDateString(undefined, { timeZone: 'UTC', weekday: 'short' });
}

export function getMonth(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'short', timeZone: 'UTC' });
}
