import { type Accessor, createSignal, type JSX, Show, splitProps } from 'solid-js';

import type { CategoryWithColor, Day } from './types';

import { DayEditor } from './DayEditor';
import { selectedCategoryID } from './Store';
import { getColorForMode } from './utils/colors';
import { getDayOfWeek, toISODateString } from './utils/date';

interface Props {
    calendarId: string;
    categories: Accessor<CategoryWithColor[]>;
    date: Accessor<Date>;
    day: Day | null | undefined;
    hideHalfLabel: boolean;
    hideLabel: boolean;
    noBorderRight?: boolean;
    onDayClick?(date: Date, day: Day | null | undefined, isTopLeft: boolean): void;
    startDate: Accessor<string>;
}

function BaseDay(props: { noBorderRight?: boolean } & JSX.HTMLAttributes<HTMLDivElement>) {
    const [local, rest] = splitProps(props, ['noBorderRight']);
    return (
        <div
            classList={{
                'border-r': !local.noBorderRight,
                'group relative box-border size-[var(--day-size)] touch-manipulation border-b border-slate-400 p-0.5 select-none dark:text-slate-100':
                    true,
            }}
            {...rest}
        />
    );
}

export const FillerDay = BaseDay;

export function CalendarDay(props: Props) {
    const isTopSelected = () => props.day?.categoryId && selectedCategoryID() === props.day.categoryId;
    const isHalfSelected = () => props.day?.halfCategoryId && selectedCategoryID() === props.day.halfCategoryId;
    const showMonth = () => toISODateString(props.date()) === props.startDate() || props.date().getUTCDate() === 1;

    const topCategory = () => props.categories().find((c) => c.id === props.day?.categoryId);
    const halfCategory = () => props.categories().find((c) => c.id === props.day?.halfCategoryId);

    const [isShowingEditor, setIsShowingEditor] = createSignal(false);

    return (
        <>
            <BaseDay
                noBorderRight={props.noBorderRight}
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const cartesianX = e.clientX - rect.left;
                    const cartesianY = rect.bottom - e.clientY;
                    const isTopLeft = cartesianY > cartesianX;
                    return props.onDayClick?.(props.date(), props.day, isTopLeft);
                }}
                style={{ background: getColorForMode(topCategory()?.color) }}
            >
                <span classList={{ 'font-bold': Boolean(isTopSelected() ?? isHalfSelected()) }}>
                    {props.date().getUTCDate()}
                    {showMonth() &&
                        ' ' + props.date().toLocaleDateString(undefined, { month: 'short', timeZone: 'UTC' })}
                </span>

                <Show when={!props.hideLabel && topCategory()}>
                    <div classList={{ 'font-bold': Boolean(isTopSelected()), 'mt-1 text-sm': true }}>
                        {topCategory()?.name}
                    </div>
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
                            <Show when={!props.hideHalfLabel}>
                                <div
                                    classList={{
                                        'absolute right-1 bottom-1 pl-1 text-right text-sm': true,
                                        'font-bold': Boolean(isHalfSelected()),
                                    }}
                                >
                                    {category().name}
                                </div>
                            </Show>
                        </>
                    )}
                </Show>

                <Show when={props.day?.icon}>
                    <div class="absolute top-1/2 left-1/2 -translate-1/2 sm:text-3xl" title={props.day?.note}>
                        {props.day?.icon}
                    </div>
                </Show>

                <div
                    class="absolute top-0.5 right-0.5 cursor-pointer opacity-0 group-hover:opacity-100 hover:font-bold"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsShowingEditor(true);
                    }}
                >
                    Edit
                </div>
            </BaseDay>

            <Show when={isShowingEditor()}>
                <Show when={props.day}>
                    {(day) => (
                        <DayEditor
                            calendarId={props.calendarId}
                            day={day()}
                            onClose={() => setIsShowingEditor(false)}
                        />
                    )}
                </Show>
            </Show>
        </>
    );
}

export function DayOfWeek(props: { color: string | undefined; index: number }) {
    return (
        <div
            class="box-border w-[var(--day-size)] border-t border-r border-b border-slate-400 px-0.5 py-2 text-sm dark:text-slate-100"
            style={{ 'background-color': getColorForMode(props.color) }}
        >
            {getDayOfWeek(new Date(`2017-01-0${props.index + 1}T00:00:00+00:00`))}
        </div>
    );
}
