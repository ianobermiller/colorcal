import clsx from 'clsx';
import { Category, Day } from './data';
import { getDayOfWeek, toISODateString } from './dateUtils';
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
    <BaseDay
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const cartesianX = e.clientX - rect.left;
        const cartesianY = rect.bottom - e.clientY;
        const isTopLeft = cartesianY > cartesianX;
        return onDayClick?.(date, day, isTopLeft);
      }}
      style={{ background: topCategory?.color }}
    >
      <span class={clsx((isTopSelected ?? isHalfSelected) && 'font-bold')}>
        {date.getUTCDate()}
        {showMonth &&
          ' ' +
            date.toLocaleDateString(undefined, {
              month: 'short',
              timeZone: 'UTC',
            })}
      </span>

      {topCategory && <div class={clsx('mt-1 text-xs', isTopSelected && 'font-bold')}>{topCategory.name}</div>}

      {halfCategory && (
        <>
          <div
            class="absolute bottom-0 right-0"
            style={{
              '--color': `${halfCategory.color}`,
              borderBottom: 'solid var(--day-size) var(--color)',
              borderLeft: 'solid var(--day-size) transparent',
            }}
          />
          <div class={clsx('absolute bottom-1 right-1 pl-1 text-right text-xs', isHalfSelected && 'font-bold')}>
            {halfCategory.name}
          </div>
        </>
      )}
    </BaseDay>
  );
}

export const FillerDay = BaseDay;

export function BaseDay(props: JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      class="relative h-[var(--day-size)] w-[var(--day-size)] touch-manipulation select-none border-b border-r border-slate-400 p-0.5"
      {...props}
    />
  );
}

export function DayOfWeek({ color, index }: { color: string | undefined; index: number }) {
  return (
    <div class="w-[var(--day-size)] border-r border-slate-400 p-0.5 text-sm" style={{ backgroundColor: color }}>
      {getDayOfWeek(new Date(`2017-01-0${index + 1}T00:00:00+00:00`))}
    </div>
  );
}
