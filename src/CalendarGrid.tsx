import type { Accessor } from 'solid-js';

import { createMemo, createSignal, For, onCleanup, onMount, Show } from 'solid-js';

import type { Calendar, CategoryWithColor, Day } from './types';

import { CalendarDay, DayOfWeek, FillerDay } from './CalendarDay';
import { dateRangeAlignWeek, toISODateString } from './dateUtils';
import { indexArray } from './indexArray';

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
      day: () => date && dayByDate()[toISODateString(date)],
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
    window.addEventListener('resize', listener);
    listener();

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
        const topCategory = props.categories().find((c) => c.id === day()?.categoryId);
        return <DayOfWeek color={topCategory?.color} index={index} />;
      })}

      <For each={range()}>
        {({ date, day }, i) => {
          const prevDay = () => range()[i() - 1]?.day();
          const nextDay = () => range()[i() + 1]?.day();
          const isLastDayOfWeek = () => i() % 7 !== 6;
          const nextCategoryId = () => nextDay()?.categoryId;
          const thisCategoryId = () => day()?.halfCategoryId ?? day()?.categoryId;
          const noBorderRight = () =>
            Boolean(isLastDayOfWeek() && thisCategoryId() && nextCategoryId() === thisCategoryId());

          return (
            <Show fallback={<FillerDay />} when={date}>
              {(date) => (
                <CalendarDay
                  categories={props.categories}
                  date={date}
                  day={day}
                  hideHalfLabel={nextCategoryId() === day()?.halfCategoryId}
                  hideLabel={prevDay()?.categoryId === day()?.categoryId}
                  noBorderRight={noBorderRight()}
                  onDayClick={props.onDayClick}
                  startDate={() => props.calendar().startDate}
                />
              )}
            </Show>
          );
        }}
      </For>
    </div>
  );
}
