import clsx from 'clsx';

import type { Category, Day } from './types';

import { getDayOfWeek, toISODateString } from './dateUtils';
import { useStore } from './Store';

interface Props {
  categories: Category[];
  date: Date;
  day: Day | null | undefined;
  hideHalfLabel: boolean;
  hideLabel: boolean;
  noBorderRight?: boolean;
  onDayClick?(date: Date, day: Day | null | undefined, isTopLeft: boolean): void;
  startDate: string;
}

export function CalendarDay({
  categories,
  date,
  day,
  hideHalfLabel,
  hideLabel,
  noBorderRight,
  onDayClick,
  startDate,
}: Props) {
  const isTopSelected = useStore((state) => day?.categoryId && state.selectedCategoryID === day.categoryId);
  const isHalfSelected = useStore((state) => day?.halfCategoryId && state.selectedCategoryID === day.halfCategoryId);
  const showMonth = toISODateString(date) === startDate || date.getUTCDate() === 1;

  const topCategory = categories.find((c) => c.id === day?.categoryId);
  const halfCategory = categories.find((c) => c.id === day?.halfCategoryId);

  return (
    <BaseDay
      noBorderRight={noBorderRight}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const cartesianX = e.clientX - rect.left;
        const cartesianY = rect.bottom - e.clientY;
        const isTopLeft = cartesianY > cartesianX;
        return onDayClick?.(date, day, isTopLeft);
      }}
      style={{ background: topCategory?.color }}
    >
      <span className={clsx((isTopSelected ?? isHalfSelected) && 'font-bold')}>
        {date.getUTCDate()}
        {showMonth && ' ' + date.toLocaleDateString(undefined, { month: 'short', timeZone: 'UTC' })}
      </span>

      {!hideLabel && topCategory && (
        <div className={clsx('mt-1 text-sm', isTopSelected && 'font-bold')}>{topCategory.name}</div>
      )}

      {halfCategory && (
        <>
          <div
            className="absolute right-0 bottom-0"
            style={{
              '--color': halfCategory.color,
              borderBottom: 'solid var(--day-size) var(--color)',
              borderLeft: 'solid var(--day-size) transparent',
            }}
          />
          {!hideHalfLabel && (
            <div className={clsx('absolute right-1 bottom-1 pl-1 text-right text-sm', isHalfSelected && 'font-bold')}>
              {halfCategory.name}
            </div>
          )}
        </>
      )}
    </BaseDay>
  );
}

export const FillerDay = BaseDay;

export function BaseDay({ noBorderRight, ...props }: { noBorderRight?: boolean } & JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        !noBorderRight && 'border-r',
        'relative h-[var(--day-size)] w-[var(--day-size)] touch-manipulation border-b border-slate-400 p-0.5 select-none',
      )}
      {...props}
    />
  );
}

export function DayOfWeek({ color, index }: { color: string | undefined; index: number }) {
  return (
    <div
      className="w-[var(--day-size)] border-t border-r border-slate-400 p-0.5 text-sm"
      style={{ backgroundColor: color }}
    >
      {getDayOfWeek(new Date(`2017-01-0${index + 1}T00:00:00+00:00`))}
    </div>
  );
}
