import type { Accessor } from 'solid-js';

import { createMemo, createSignal, Index, onCleanup, onMount, Show } from 'solid-js';

import type { Calendar, CategoryWithColor, Day } from './types';

import { CalendarDay, DayOfWeek, FillerDay } from './CalendarDay';
import { dateRangeAlignWeek, toISODateString } from './utils/date';
import { indexArray } from './utils/indexArray';

interface Props {
  calendar: Accessor<Calendar>;
  categories: Accessor<CategoryWithColor[]>;
  days: Accessor<Day[]>;
  onDayClick?(date: Date, day: Day | undefined, isTopLeft: boolean): void;
}

export function CalendarGrid(props: Props) {
  const dayByDate = createMemo(() => indexArray(props.days(), (day) => day.date));
  const range = createMemo(() =>
    dateRangeAlignWeek(new Date(props.calendar().startDate), new Date(props.calendar().endDate)).map((date) => ({
      date,
      day: date && dayByDate()[toISODateString(date)],
    })),
  );
  const [daySize, setDaySize] = createSignal(0);

  let rootRef: HTMLDivElement | undefined;
  onMount(() => {
    // Subtract one to account for the border on the calendar itself
    const listener = () => {
      if (rootRef) {
        setDaySize(Math.floor((rootRef.offsetWidth - 1) / 7));
      }
    };
    listener();

    window.addEventListener('resize', listener);
    onCleanup(() => window.removeEventListener('resize', listener));
  });

  return (
    <div
      class="flex flex-wrap border-l border-slate-400 dark:text-slate-900"
      ref={rootRef}
      style={{ '--day-size': `${daySize()}px` }}
    >
      {Array.from({ length: 7 }, (_, index) => {
        const { day } = range()[index];
        const topCategory = props.categories().find((c) => c.id === day?.categoryId);
        return <DayOfWeek color={topCategory?.color} index={index} />;
      })}

      <Index each={range()}>
        {(entry, i) => {
          const prevDay = () => range()[i - 1]?.day;
          const nextDay = () => range()[i + 1]?.day;
          const isLastDayOfWeek = () => i % 7 !== 6;
          const nextCategoryId = () => nextDay()?.categoryId;
          const thisCategoryId = () => entry().day?.halfCategoryId ?? entry().day?.categoryId;
          const noBorderRight = () =>
            Boolean(isLastDayOfWeek() && thisCategoryId() && nextCategoryId() === thisCategoryId());

          return (
            <Show fallback={<FillerDay />} when={entry().date}>
              {(date) => (
                <CalendarDay
                  categories={props.categories}
                  date={date}
                  day={entry().day}
                  hideHalfLabel={nextCategoryId() === entry().day?.halfCategoryId}
                  hideLabel={prevDay()?.categoryId === entry().day?.categoryId}
                  noBorderRight={noBorderRight()}
                  onDayClick={props.onDayClick}
                  startDate={() => props.calendar().startDate}
                />
              )}
            </Show>
          );
        }}
      </Index>
    </div>
  );
}
