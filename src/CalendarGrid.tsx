import { Calendar, Category, Day } from './data';
import styles from './CalendarGrid.module.css';
import { CalendarDay, DayOfWeek, FillerDay } from './CalendarDay';
import { dateRangeAlignWeek, toISODateString } from './dateUtils';

interface Props {
  calendar: Calendar;
  categories: Category[];
  days: Day[];
  onDayClick?(date: Date, day: Day | undefined, isTopLeft: boolean): void;
}

export function CalendarGrid({ calendar, categories, days, onDayClick }: Props) {
  const dayByDate = indexArray(days, (day) => day.date);
  const range = dateRangeAlignWeek(new Date(calendar.startDate), new Date(calendar.endDate));

  return (
    <div class={styles.calendar}>
      {Array.from({ length: 7 }, (_, index) => {
        const date = range[index];
        const day = date && dayByDate[toISODateString(date)];
        const topCategory = categories.find((c) => c.id === day?.categoryId);
        return <DayOfWeek color={topCategory?.color} index={index} />;
      })}
      {range.map((date) =>
        date ? (
          <CalendarDay
            categories={categories}
            date={date}
            day={dayByDate[toISODateString(date)]}
            onDayClick={onDayClick}
            startDate={calendar.startDate}
          />
        ) : (
          <FillerDay />
        ),
      )}
    </div>
  );
}

function indexArray<T, K extends string>(arr: T[], getKey: (t: T) => K): Record<K, T | undefined> {
  const result = {} as Record<K, T | undefined>;
  for (const item of arr) {
    result[getKey(item)] = item;
  }
  return result;
}
