import clsx from 'clsx';
import { Category, Day } from 'thin-backend';
import styles from './CalendarDay.module.css';
import { toISODateString } from './dateUtils';
import { useStore } from './Store';

interface Props {
  categories: Category[];
  date: Date;
  day: Day | undefined;
  onDayClick?(date: Date, day: Day | undefined): void;
  startDate: string;
}

export function CalendarDay({ categories, date, day, onDayClick, startDate }: Props) {
  const isTopSelected = useStore((state) => day?.categoryId && state.selectedCategoryID === day?.categoryId);
  const isHalfSelected = useStore((state) => day?.halfCategoryId && state.selectedCategoryID === day?.halfCategoryId);
  const showMonth = toISODateString(date) === startDate || date.getUTCDate() === 1;

  const topCategory = categories.find((c) => c.id === day?.categoryId);
  const halfCategory = categories.find((c) => c.id === day?.halfCategoryId);

  return (
    <div class={styles.day} style={{ background: topCategory?.color }} onClick={() => onDayClick?.(date, day)}>
      <span class={clsx({ [styles.selected]: isTopSelected || isHalfSelected })}>
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
