import clsx from 'clsx';
import { type Accessor, type JSX, Show } from 'solid-js';

import type { CategoryWithColor, Day } from './types';

import { getColorForMode } from './colors';
import { getDayOfWeek, toISODateString } from './dateUtils';
import { selectedCategoryID } from './Store';

interface Props {
  categories: Accessor<CategoryWithColor[]>;
  date: Date;
  day: Accessor<Day | null | undefined>;
  hideHalfLabel: boolean;
  hideLabel: boolean;
  noBorderRight?: boolean;
  onDayClick?(date: Date, day: Day | null | undefined, isTopLeft: boolean): void;
  startDate: Accessor<string>;
}

export function BaseDay({ noBorderRight, ...props }: { noBorderRight?: boolean } & JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      class={clsx(
        !noBorderRight && 'border-r',
        'relative box-border size-[var(--day-size)] touch-manipulation border-b border-slate-400 p-0.5 select-none dark:text-slate-100',
      )}
      {...props}
    />
  );
}

export const FillerDay = BaseDay;

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
  const isTopSelected = () => day()?.categoryId && selectedCategoryID() === day()?.categoryId;
  const isHalfSelected = () => day()?.halfCategoryId && selectedCategoryID() === day()?.halfCategoryId;
  const showMonth = () => toISODateString(date) === startDate() || date.getUTCDate() === 1;

  const topCategory = () => categories().find((c) => c.id === day()?.categoryId);
  const halfCategory = () => categories().find((c) => c.id === day()?.halfCategoryId);

  return (
    <BaseDay
      noBorderRight={noBorderRight}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const cartesianX = e.clientX - rect.left;
        const cartesianY = rect.bottom - e.clientY;
        const isTopLeft = cartesianY > cartesianX;
        return onDayClick?.(date, day(), isTopLeft);
      }}
      style={{ background: getColorForMode(topCategory()?.color) }}
    >
      <span class={clsx((isTopSelected() ?? isHalfSelected()) && 'font-bold')}>
        {date.getUTCDate()}
        {showMonth() && ' ' + date.toLocaleDateString(undefined, { month: 'short', timeZone: 'UTC' })}
      </span>

      <Show when={!hideLabel && topCategory()}>
        <div class={clsx('mt-1 text-sm', isTopSelected() && 'font-bold')}>{topCategory()?.name}</div>
      </Show>

      <Show when={halfCategory()}>
        {(category) => (
          <>
            <div
              class="absolute right-0 bottom-0"
              style={{
                '--color': getColorForMode(category().color),
                'border-bottom': 'solid var(--day-size) var(--color)',
                'border-left': 'solid var(--day-size) transparent',
              }}
            />
            {!hideHalfLabel && (
              <div class={clsx('absolute right-1 bottom-1 pl-1 text-right text-sm', isHalfSelected() && 'font-bold')}>
                {category().name}
              </div>
            )}
          </>
        )}
      </Show>
    </BaseDay>
  );
}

export function DayOfWeek({ color, index }: { color: string | undefined; index: number }) {
  return (
    <div
      class="box-border w-[var(--day-size)] border-t border-r border-b border-slate-400 px-0.5 py-2 text-sm dark:text-slate-100"
      style={{ 'background-color': getColorForMode(color) }}
    >
      {getDayOfWeek(new Date(`2017-01-0${index + 1}T00:00:00+00:00`))}
    </div>
  );
}
