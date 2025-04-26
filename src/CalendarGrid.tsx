import type { Calendar, Category, Day } from './types';

import { CalendarDay, DayOfWeek, FillerDay } from './CalendarDay';
import { dateRangeAlignWeek, toISODateString } from './dateUtils';
import { indexArray } from './indexArray';

interface Props {
  calendar: Calendar;
  categories: Category[];
  days: Day[];
  onDayClick?(date: Date, day: Day | undefined, isTopLeft: boolean): void;
}

export function CalendarGrid({ calendar, categories, days, onDayClick }: Props) {
  const dayByDate = indexArray(days, (day) => day.date);
  const range = dateRangeAlignWeek(new Date(calendar.startDate), new Date(calendar.endDate)).map((date) => ({
    date,
    day: date && dayByDate[toISODateString(date)],
  }));

  return (
    <div
      className="flex flex-wrap border-t border-l border-slate-400"
      style={{ '--day-size': 'calc((min(724px, 100vw) - 24px - 7px) / 7)', width: 'calc(var(--day-size) * 7 + 1px)' }}
    >
      {Array.from({ length: 7 }, (_, index) => {
        const { day } = range[index];
        const topCategory = categories.find((c) => c.id === day?.categoryId);
        return <DayOfWeek color={topCategory?.color} index={index} key={index} />;
      })}
      {range.map(({ date, day }, i) => {
        const prevDay = range[i - 1]?.day;
        const nextDay = range[i + 1]?.day;
        const noBorderRight = i % 7 !== 6 && nextDay?.categoryId === (day?.halfCategoryId ?? day?.categoryId);
        return date ? (
          <CalendarDay
            categories={categories}
            date={date}
            day={day}
            hideHalfLabel={nextDay?.categoryId === day?.halfCategoryId}
            hideLabel={prevDay?.categoryId === day?.categoryId}
            noBorderRight={noBorderRight}
            onDayClick={onDayClick}
            startDate={calendar.startDate}
          />
        ) : (
          <FillerDay />
        );
      })}
    </div>
  );
}
