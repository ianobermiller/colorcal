import EditIcon from '~icons/feather/edit';
import SettingsIcon from '~icons/feather/settings';
import { createMemo, createSignal, For, Show } from 'solid-js';
import { urlToUuid } from 'uuid-url';

import type { Category, Day } from './types';

import { CalendarGrid } from './CalendarGrid';
import { CategoryList } from './CategoryList';
import { IconButton } from './components/Button';
import { Input } from './components/Input';
import { DayEditor } from './DayEditor';
import { db, transactCalendar } from './db';
import { useAuth, useQuery } from './db';
import { Notes } from './Notes';
import { Settings } from './Settings';
import { autoColor } from './utils/autoColor';
import { getDayOfWeek, getMonth } from './utils/date';

interface Props {
    id: string;
}

export function Editor(props: Props) {
    const { user } = useAuth();
    const ownerId = () => user()?.id ?? '';

    const id = () => urlToUuid(props.id);
    const [isShowingSettings, setIsShowingSettings] = createSignal(false);
    const { data } = useQuery(
        () => ({ calendars: { $: { where: { id: id() } }, categories: {}, days: {} } }),
        () => ({ ruleParams: { knownCalendarId: id() } }),
    );
    const calendar = () => data()?.calendars[0];
    const isOwner = () => calendar()?.ownerId === ownerId();
    const days = createMemo(() => {
        const calendarDays = calendar()?.days;
        return calendarDays ? [...calendarDays].sort((a, b) => a.date.localeCompare(b.date)) : [];
    });
    const daysWithNote = createMemo(() => days().filter((d) => d.note));
    const categories = createMemo(() => {
        const cal = calendar();
        if (!cal?.categories) return [];
        const currentDays = days();
        const sorted = sortBy(
            cal.categories,
            (cat) => lastIfNotFound(currentDays.findIndex((d) => d.categoryId === cat.id)),
            (cat) => lastIfNotFound(currentDays.findIndex((d) => d.halfCategoryId === cat.id)),
        );
        return autoColor(cal, currentDays, sorted);
    });
    const countByCategory = createMemo(() => {
        return days().reduce<Record<string, number>>((acc, day) => {
            if (day.categoryId) {
                const existing = acc[day.categoryId] ?? 0;
                acc[day.categoryId] = existing + 1;
            }
            return acc;
        }, {});
    });

    const onCopy = (category: Category) => {
        const currentDays = days();
        if (!currentDays.length) return;
        void copyHtmlToClipboard(getHtmlForCategory(category, currentDays));
    };

    const onCopyAll = () => {
        const currentDays = days();
        const currentCategories = categories();
        if (currentDays.length === 0 || currentCategories.length === 0) return;
        void copyHtmlToClipboard(currentCategories.map((cat) => getHtmlForCategory(cat, currentDays)).join(''));
    };

    const [editingDay, setEditingDay] = createSignal<Day | undefined>(undefined);

    return (
        <Show fallback={<h1>Loading...</h1>} when={calendar()}>
            {(cal) => (
                <div class="gap-4 lg:flex">
                    <div class="mb-6 flex flex-grow flex-col gap-4">
                        <header class="relative">
                            <h2 class="text-lg">{cal().title} </h2>
                        </header>

                        <Show when={isOwner()}>
                            <div class="flex gap-2">
                                <Input
                                    onChange={(e) => {
                                        void transactCalendar(
                                            id(),
                                            db.tx.calendars[id()].update({ startDate: e.currentTarget.value }),
                                        );
                                    }}
                                    readonly={!isOwner()}
                                    type="date"
                                    value={cal().startDate}
                                />
                                <Input
                                    onChange={(e) => {
                                        void transactCalendar(
                                            id(),
                                            db.tx.calendars[id()].update({ endDate: e.currentTarget.value }),
                                        );
                                    }}
                                    readonly={!isOwner()}
                                    type="date"
                                    value={cal().endDate}
                                />
                                <Show when={isOwner()}>
                                    <IconButton onClick={() => setIsShowingSettings(true)}>
                                        <SettingsIcon height="16" width="16" />
                                    </IconButton>
                                </Show>
                            </div>
                        </Show>

                        <CalendarGrid calendar={cal} categories={categories} days={days} readonly={!isOwner()} />

                        <Notes calendarId={id()} notes={cal().notes} readonly={!isOwner()} />

                        <ul class="list-disc pl-4">
                            <For each={daysWithNote()}>
                                {(day) => {
                                    const date = new Date(day.date);

                                    return (
                                        <li class="group hover:bg-slate-200 dark:hover:bg-slate-800">
                                            <div class="flex">
                                                <span>
                                                    <strong>
                                                        {getMonth(date)} {date.getUTCDate()} - {getDayOfWeek(date)}
                                                    </strong>{' '}
                                                    {day.icon} {day.note}
                                                </span>
                                                <Show when={isOwner()}>
                                                    <IconButton
                                                        class="ml-auto opacity-0 group-hover:opacity-100"
                                                        onClick={() => setEditingDay(day)}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Show>
                                            </div>
                                        </li>
                                    );
                                }}
                            </For>
                        </ul>
                    </div>

                    <Show when={isOwner()}>
                        <div>
                            <CategoryList
                                calendarId={id()}
                                categories={categories()}
                                countByCategory={countByCategory()}
                                onCopy={onCopy}
                                onCopyAll={onCopyAll}
                            />
                        </div>
                    </Show>

                    <Show when={isShowingSettings()}>
                        <Settings
                            calendar={cal}
                            onClose={() => {
                                setIsShowingSettings(false);
                            }}
                        />
                    </Show>

                    <Show when={editingDay()}>
                        {(day) => <DayEditor calendarId={id()} day={day()} onClose={() => setEditingDay(undefined)} />}
                    </Show>
                </div>
            )}
        </Show>
    );
}

function copyHtmlToClipboard(html: string) {
    return navigator.clipboard.write([
        new ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([html], { type: 'text/plain' }),
        }),
    ]);
}

function getHtmlForCategory(category: Category, days: Day[]) {
    const matchingDays = days.filter(
        (day) => day.halfCategoryId === category.id || (day.halfCategoryId == null && day.categoryId === category.id),
    );
    return `
    <h2>${category.name.split(' - ').at(-1) ?? ''}</h2>
    <br />
    ${matchingDays
        .map((day) => {
            const date = new Date(day.date);
            return `
          <h3>${getMonth(date)} ${date.getUTCDate()} - ${getDayOfWeek(date)}</h3>
          <ul>
            <li>${day.icon ? `${day.icon} ` : ''}${day.note ?? ''}</li>
          </ul>
          <br />
        `;
        })
        .join('')}
  `;
}

function lastIfNotFound(index: number | undefined): number {
    return index != null && index >= 0 ? index : Number.POSITIVE_INFINITY;
}

function sortBy<T>(array: T[], ...predicates: ((element: T) => number | string)[]): T[] {
    return array.slice().sort((a, b) => {
        if (a === b) {
            return 0;
        }

        for (const predicate of predicates) {
            const aValue = predicate(a);
            const bValue = predicate(b);
            if (aValue === bValue) {
                continue;
            }
            return aValue > bValue ? 1 : -1;
        }
        return 0;
    });
}
