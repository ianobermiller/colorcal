import { useLayoutEffect, useRef, useState } from 'preact/hooks';

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
  const [daySize, setDaySize] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const listener = () => setDaySize(Math.floor(node.offsetWidth / 7) - 1);
    window.addEventListener('resize', listener);
    listener();
    return () => window.removeEventListener('resize', listener);
  }, []);

  return (
    <div
      className="flex flex-wrap border-l border-slate-400 dark:text-slate-900"
      ref={rootRef}
      style={{ '--day-size': `${daySize}px` }}
    >
      {Array.from({ length: 7 }, (_, index) => {
        const { day } = range[index];
        const topCategory = categories.find((c) => c.id === day?.categoryId);
        return <DayOfWeek color={topCategory?.color} index={index} key={index} />;
      })}

      {range.map(({ date, day }, i) => {
        const prevDay = range[i - 1]?.day;
        const nextDay = range[i + 1]?.day;
        const isLastDayOfWeek = i % 7 !== 6;
        const nextCategoryId = nextDay?.categoryId;
        const thisCategoryId = day?.halfCategoryId ?? day?.categoryId;
        const noBorderRight = Boolean(isLastDayOfWeek && thisCategoryId && nextCategoryId === thisCategoryId);

        return date ? (
          <CalendarDay
            categories={categories}
            date={date}
            day={day}
            hideHalfLabel={nextCategoryId === day?.halfCategoryId}
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
