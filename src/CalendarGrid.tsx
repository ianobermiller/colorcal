import type { Accessor } from 'solid-js';

import { createMemo, createSignal, Index, onCleanup, onMount, Show } from 'solid-js';

import type { Calendar, CategoryWithColor, Day } from './types';

import { CalendarDay, DayOfWeek, FillerDay } from './CalendarDay';
import { db, id, transactCalendar } from './db';
import { useOwnerId } from './hooks/useOwnerId';
import { selectedCategoryID } from './Store';
import { dateRangeAlignWeek, toISODateString } from './utils/date';
import { indexArray } from './utils/indexArray';

interface Props {
    calendar: Accessor<Calendar>;
    categories: Accessor<CategoryWithColor[]>;
    days: Accessor<Day[]>;
    readonly: boolean;
}

export function CalendarGrid(props: Props) {
    const ownerId = useOwnerId();
    const dayByDate = createMemo(() => indexArray(props.days(), (day) => day.date));
    const range = createMemo(() =>
        dateRangeAlignWeek(new Date(props.calendar().startDate), new Date(props.calendar().endDate)).map((date) => ({
            date,
            day: date && dayByDate()[toISODateString(date)],
        })),
    );
    const [daySize, setDaySize] = createSignal(0);

    const handleDayClick = (date: Date, day: Day | undefined, isTopLeft: boolean) => {
        if (!props.readonly) {
            void toggleDay(ownerId(), props.calendar().id, date, day, isTopLeft);
        }
    };

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
                                    calendarId={props.calendar().id}
                                    categories={props.categories}
                                    date={date}
                                    day={entry().day}
                                    hideHalfLabel={nextCategoryId() === entry().day?.halfCategoryId}
                                    hideLabel={prevDay()?.categoryId === entry().day?.categoryId}
                                    noBorderRight={noBorderRight()}
                                    onDayClick={handleDayClick}
                                    readonly={props.readonly}
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

function toggleDay(ownerId: string, calendarId: string, date: Date, day: Day | undefined, isTopLeft: boolean) {
    const categoryId = selectedCategoryID();

    if (!day) {
        const dayId = id();
        void transactCalendar(
            calendarId,
            db.tx.days[dayId].update({
                categoryId,
                date: toISODateString(date),
                halfCategoryId: null,
                ownerId,
            }),
            db.tx.calendars[calendarId].link({ days: dayId }),
        );
        return;
    }

    const top = !day.categoryId ? 'empty' : day.categoryId === categoryId ? 'same' : 'different';
    const half = !day.halfCategoryId ? 'empty' : day.halfCategoryId === categoryId ? 'same' : 'different';

    if (
        (top === 'same' && half === 'same') ||
        (top === 'same' && half === 'empty') ||
        (top === 'empty' && half === 'same')
    ) {
        return transactCalendar(calendarId, db.tx.days[day.id].update({ categoryId: null, halfCategoryId: null }));
    }

    if ((top === 'empty' && half === 'empty') || (top === 'empty' && half === 'different')) {
        return transactCalendar(calendarId, db.tx.days[day.id].update({ categoryId: categoryId }));
    }

    if (top === 'same' && half === 'different') {
        return transactCalendar(calendarId, db.tx.days[day.id].update({ halfCategoryId: categoryId }));
    }

    if (top === 'different' && half === 'same') {
        return transactCalendar(calendarId, db.tx.days[day.id].update({ categoryId, halfCategoryId: null }));
    }

    if ((top === 'different' && half === 'empty') || (top === 'different' && half === 'different')) {
        if (isTopLeft) {
            return transactCalendar(
                calendarId,
                db.tx.days[day.id].update({
                    categoryId,
                    halfCategoryId: half === 'empty' ? day.categoryId : day.halfCategoryId,
                }),
            );
        } else {
            return transactCalendar(calendarId, db.tx.days[day.id].update({ halfCategoryId: categoryId }));
        }
    }
}
