import type { Accessor } from 'solid-js';

import { createMemo, createSignal, Index, onCleanup, onMount, Show } from 'solid-js';

import type { Calendar, CategoryWithColor, Day } from './types';

import { CalendarDay, DayOfWeek, FillerDay } from './CalendarDay';
import { db, id, transactCalendar } from './db';
import { useOwnerId } from './hooks/useOwnerId';
import { selectedCategoryID } from './Store';
import { dateRange, dateRangeAlignWeek, toISODateString } from './utils/date';
import { indexArray } from './utils/indexArray';

interface DragState {
    currentDate: Date;
    currentIsTopLeft: boolean;
    startDate: Date;
    startIsTopLeft: boolean;
}

interface Props {
    calendar: Accessor<Calendar>;
    categories: Accessor<CategoryWithColor[]>;
    days: Accessor<Day[]>;
    readonly: boolean;
}

export function CalendarGrid(props: Props) {
    const ownerId = useOwnerId();
    const dayByDate = createMemo(() => indexArray(props.days(), (day) => day.date));
    const categoryById = createMemo(() => indexArray(props.categories(), (cat) => cat.id));
    const range = createMemo(() =>
        dateRangeAlignWeek(new Date(props.calendar().startDate), new Date(props.calendar().endDate)).map((date) => ({
            date,
            day: date && dayByDate()[toISODateString(date)],
        })),
    );
    const [daySize, setDaySize] = createSignal(0);
    const [dragState, setDragState] = createSignal<DragState | null>(null);

    const handleDayClick = (date: Date, day: Day | undefined, isTopLeft: boolean) => {
        if (!props.readonly) {
            void toggleDay(ownerId(), props.calendar().id, date, day, isTopLeft);
        }
    };

    const finishDrag = (current: DragState) => {
        const isForward = current.startDate < current.currentDate;
        const startDate = isForward ? current.startDate : current.currentDate;
        const endDate = isForward ? current.currentDate : current.startDate;
        const startIsTopLeft = isForward ? current.startIsTopLeft : current.currentIsTopLeft;
        const endIsTopLeft = isForward ? current.currentIsTopLeft : current.startIsTopLeft;

        const dates = dateRange(startDate, endDate);
        const operations = dates.flatMap((date, index) => {
            const isFirstDay = index === 0;
            const isLastDay = index === dates.length - 1;

            const selectedCategoryId = selectedCategoryID();
            const categoryId = !isFirstDay || startIsTopLeft ? selectedCategoryId : undefined;
            const halfCategoryId = !isLastDay || !endIsTopLeft ? selectedCategoryId : undefined;

            const day = dayByDate()[toISODateString(date)];
            if (!day) {
                return createDay({
                    calendarId: props.calendar().id,
                    categoryId: categoryId ?? null,
                    date,
                    halfCategoryId: halfCategoryId ?? null,
                    ownerId: ownerId(),
                });
            }

            return db.tx.days[day.id].update({ categoryId, halfCategoryId });
        });

        // Execute all operations in a single transaction
        void transactCalendar(props.calendar().id, ...operations);
    };

    const handlePointerDown = (date: Date, day: Day | undefined, isTopLeft: boolean) => {
        if (props.readonly) return;

        setDragState({
            currentDate: date,
            currentIsTopLeft: isTopLeft,
            startDate: date,
            startIsTopLeft: isTopLeft,
        });

        const handleGlobalPointerUp = (e: PointerEvent) => {
            const current = dragState();
            if (current) {
                if (rootRef) {
                    const rect = rootRef.getBoundingClientRect();
                    // Only apply if pointer up is inside the grid
                    if (
                        e.clientX >= rect.left &&
                        e.clientX <= rect.right &&
                        e.clientY >= rect.top &&
                        e.clientY <= rect.bottom
                    ) {
                        if (current.currentDate.getTime() !== current.startDate.getTime()) {
                            finishDrag(current);
                        }
                    }
                }
                setDragState(null);
            }

            window.removeEventListener('pointerup', handleGlobalPointerUp);
        };

        window.addEventListener('pointerup', handleGlobalPointerUp);

        onCleanup(() => window.removeEventListener('pointerup', handleGlobalPointerUp));
    };

    const handlePointerMove = (date: Date, isTopLeft: boolean) => {
        const current = dragState();
        if (current) {
            setDragState({
                ...current,
                currentDate: date,
                currentIsTopLeft: isTopLeft,
            });
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

    const isInDragRange = (date: Date) => {
        const current = dragState();
        if (!current) return false;
        const startDate = current.startDate < current.currentDate ? current.startDate : current.currentDate;
        const endDate = current.startDate < current.currentDate ? current.currentDate : current.startDate;
        return date >= startDate && date <= endDate;
    };

    return (
        <div
            class="flex flex-wrap border-l border-slate-400 dark:text-slate-900"
            ref={rootRef}
            style={{ '--day-size': `${daySize()}px` }}
        >
            {Array.from({ length: 7 }, (_, index) => {
                const { day } = range()[index];
                const categories = categoryById();
                const topCategory = day?.categoryId ? categories[day.categoryId] : undefined;
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
                            {(date) => {
                                return (
                                    <CalendarDay
                                        calendarId={props.calendar().id}
                                        date={date}
                                        day={entry().day}
                                        halfCategory={categoryById()[entry().day?.halfCategoryId ?? '']}
                                        hideHalfLabel={nextCategoryId() === entry().day?.halfCategoryId}
                                        hideLabel={prevDay()?.categoryId === entry().day?.categoryId}
                                        isInDragRange={isInDragRange(date())}
                                        noBorderRight={noBorderRight()}
                                        onDayClick={handleDayClick}
                                        onPointerDown={handlePointerDown}
                                        onPointerMove={handlePointerMove}
                                        readonly={props.readonly}
                                        startDate={() => props.calendar().startDate}
                                        topCategory={categoryById()[entry().day?.categoryId ?? '']}
                                    />
                                );
                            }}
                        </Show>
                    );
                }}
            </Index>
        </div>
    );
}

function createDay(params: {
    calendarId: string;
    categoryId: null | string;
    date: Date;
    halfCategoryId: null | string;
    ownerId: string;
}): Parameters<typeof transactCalendar>[1][] {
    const dayId = id();
    return [
        db.tx.days[dayId].update({
            categoryId: params.categoryId,
            date: toISODateString(params.date),
            halfCategoryId: params.halfCategoryId,
            ownerId: params.ownerId,
        }),
        db.tx.calendars[params.calendarId].link({ days: dayId }),
    ];
}

function toggleDay(ownerId: string, calendarId: string, date: Date, day: Day | undefined, isTopLeft: boolean) {
    const categoryId = selectedCategoryID();

    if (!day) {
        void transactCalendar(
            calendarId,
            ...createDay({
                calendarId,
                categoryId,
                date,
                halfCategoryId: null,
                ownerId,
            }),
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
