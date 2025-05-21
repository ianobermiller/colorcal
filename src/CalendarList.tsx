import { useNavigate } from '@solidjs/router';
import { createMemo, For, Show } from 'solid-js';
import { uuidToUrl } from 'uuid-url';

import { Button } from './components/Button';
import { Input } from './components/Input';
import { db, id } from './db';
import { useAuth, useQuery } from './db';
import { toISODateString } from './utils/date';

export function CalendarList() {
    const { user } = useAuth();
    const ownerId = () => user()?.id ?? '';

    const { data } = useQuery(() => ({ calendars: { $: { where: { ownerId: ownerId() } } } }));
    const calendars = createMemo(() => (data()?.calendars ?? []).sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1)));

    let inputRef: HTMLInputElement | undefined;

    const onCreate = () => {
        const title = inputRef?.value ?? 'Untitled Calendar';
        void createCalendar(ownerId(), title);
    };

    return (
        <div class="flex flex-col gap-4">
            <h2 class="mb-2 text-xl">Your Calendars</h2>

            <div class="flex gap-2">
                <Input
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            onCreate();
                            e.currentTarget.value = '';
                        }
                    }}
                    placeholder="Calendar Name"
                    ref={inputRef}
                    type="text"
                />

                <Button onClick={onCreate}>Create a Calendar</Button>
            </div>

            <Show when={calendars().length > 0}>
                <div class="">
                    <div class="hidden w-full border-b font-medium text-gray-500 lg:grid lg:grid-cols-[2fr_repeat(3,_1fr)] dark:border-gray-600 dark:text-gray-200">
                        <div class="p-4 pt-0 pb-3 pl-8 text-left">Name</div>
                        <div class="p-4 pt-0 pb-3 pl-8 text-right">Start Date</div>
                        <div class="p-4 pt-0 pb-3 pl-8 text-right">End Date</div>
                        <div class="p-4 pt-0 pb-3 pl-8 text-right">Last Modified</div>
                    </div>

                    <For each={calendars()}>
                        {(cal) => (
                            <a
                                class="block border-b border-gray-100 bg-white p-4 text-gray-600 lg:grid lg:grid-cols-[2fr_repeat(3,_1fr)] lg:p-0 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                href={`/${uuidToUrl(cal.id)}`}
                            >
                                <h3 class="text-gray-900 lg:p-4 lg:pl-8 lg:text-left dark:text-gray-200">
                                    {cal.title}
                                </h3>

                                <div class="inline text-sm after:content-['_-_'] lg:block lg:p-4 lg:pl-8 lg:text-right lg:text-base lg:after:content-['']">
                                    {formatDate(cal.startDate)}
                                </div>

                                <div class="inline text-sm lg:block lg:p-4 lg:pl-8 lg:text-right lg:text-base">
                                    {formatDate(cal.endDate)}
                                </div>

                                <div class="hidden lg:block lg:p-4 lg:pl-8 lg:text-right">
                                    {formatDate(new Date(cal.updatedAt))}
                                </div>
                            </a>
                        )}
                    </For>
                </div>
            </Show>
        </div>
    );
}

async function createCalendar(ownerId: string, title: string) {
    const navigate = useNavigate();
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    const calendarId = id();
    await db.transact(
        db.tx.calendars[calendarId].update({
            endDate: toISODateString(endDate),
            isPubliclyVisible: false,
            notes: '',
            ownerId,
            startDate: toISODateString(startDate),
            title,
            updatedAt: Date.now(),
        }),
    );
    navigate(`/${uuidToUrl(calendarId)}`);
}

function formatDate(date: Date | string): string {
    return (typeof date === 'string' ? new Date(date) : date).toLocaleDateString(undefined, {
        dateStyle: 'medium',
        timeZone: 'UTC',
    });
}
