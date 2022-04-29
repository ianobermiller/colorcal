export function dateRangeAlignWeek(start: Date, end: Date): Array<Date | null> {
  const dates: Array<Date | null> = dateRange(start, end);

  const firstDayOfWeek = dates[0]!.getUTCDay();

  // Filler days
  for (let i = 0; i < firstDayOfWeek; i++) {
    dates.unshift(null);
  }

  return dates;
}

export function dateRange(tryStart: Date, tryEnd: Date): Date[] {
  const [start, end] =
    tryStart < tryEnd ? [tryStart, tryEnd] : [tryEnd, tryStart];

  const dates: Array<Date> = [];
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
