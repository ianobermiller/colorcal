import clsx from 'clsx';
import { Category, Day } from 'thin-backend';
import styles from './CalendarDay.module.css';
import { toISODateString } from './dateUtils';
import { useStore } from './Store';

interface Props {
  categories: Category[];
  date: Date;
  day: Day | undefined;
  onDayClick?(date: Date, day: Day | undefined, isTopLeft: boolean): void;
  startDate: string;
}

export function CalendarDay({ categories, date, day, onDayClick, startDate }: Props) {
  const isTopSelected = useStore((state) => day?.categoryId && state.selectedCategoryID === day.categoryId);
  const isHalfSelected = useStore((state) => day?.halfCategoryId && state.selectedCategoryID === day.halfCategoryId);
  const showMonth = toISODateString(date) === startDate || date.getUTCDate() === 1;

  const topCategory = categories.find((c) => c.id === day?.categoryId);
  const halfCategory = categories.find((c) => c.id === day?.halfCategoryId);

  return (
    <div
      class={styles.day}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const cartesianX = e.clientX - rect.left;
        const cartesianY = rect.bottom - e.clientY;
        const isTopLeft = cartesianY > cartesianX;
        return onDayClick?.(date, day, isTopLeft);
      }}
      style={{ background: topCategory?.color }}
    >
      <span class={clsx({ [styles.selected]: isTopSelected ?? isHalfSelected })}>
        {date.getUTCDate()}
        {showMonth &&
          ' ' +
            date.toLocaleDateString(undefined, {
              month: 'short',
              timeZone: 'UTC',
            })}
      </span>
      {topCategory && <div class={clsx(styles.dayLabel, { [styles.selected]: isTopSelected })}>{topCategory.name}</div>}
      {halfCategory && (
        <>
          <div class={styles.halfDayBackground} style={`--color: ${halfCategory.color}`} />
          <div
            class={clsx(styles.halfDayLabel, {
              [styles.selected]: isHalfSelected,
            })}
          >
            {halfCategory.name}
          </div>
        </>
      )}
    </div>
  );
}

export function FillerDay() {
  return <div class={styles.day} />;
}

const dayOfWeekFormatter = new Intl.DateTimeFormat(undefined, { timeZone: 'UTC', weekday: 'short' });
export function DayOfWeek({ color, index }: { color: string | undefined; index: number }) {
  return (
    <div class={styles.dayOfWeek} style={{ backgroundColor: color }}>
      {dayOfWeekFormatter.format(new Date(`2017-01-0${index + 1}T00:00:00+00:00`))}
    </div>
  );
}
