import EditIcon from '~icons/feather/edit';
import SettingsIcon from '~icons/feather/settings';
import clsx from 'clsx';
import { createEffect, createMemo, createSignal, Show } from 'solid-js';
import { urlToUuid } from 'uuid-url';

import type { Category, Day } from './types';

import { autoColor } from './autoColor';
import { IconButton } from './Button';
import { CalendarGrid } from './CalendarGrid';
import { CategoryList } from './CategoryList';
import { getDayOfWeek, getMonth, toISODateString } from './dateUtils';
import { db, id } from './db';
import { Input } from './Input';
import { useAuth, useQuery } from './instantdb-solid';
import { Notes } from './Notes';
import { Settings } from './Settings';
import { selectedCategoryID } from './Store';

interface Props {
  id: string;
}

export function Editor({ id: urlID }: Props) {
  const { user } = useAuth();
  const ownerId = () => user()?.id ?? '';

  const id = urlToUuid(urlID);
  const [isEditingTitle, setIsEditingTitle] = createSignal(false);
  const [isShowingSettings, setIsShowingSettings] = createSignal(false);
  const { data } = useQuery(() => ({ calendars: { $: { where: { id } }, categories: {}, days: {} } }), {
    ruleParams: { knownCalendarId: id },
  });
  const calendar = () => data()?.calendars[0];
  const days = createMemo(() => {
    const calendarDays = calendar()?.days;
    return calendarDays ? [...calendarDays].sort((a, b) => a.date.localeCompare(b.date)) : [];
  });
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

  const updateTitle = (e: { currentTarget: { value: string } }) => {
    setIsEditingTitle(false);
    void db.transact(db.tx.calendars[id].update({ title: e.currentTarget.value }));
  };

  let titleInputRef: HTMLInputElement | undefined;

  createEffect(() => {
    if (isEditingTitle()) {
      titleInputRef?.focus();
      titleInputRef?.select();
    }
  });

  const onDayClick = (date: Date, day: Day | undefined, isTopLeft: boolean) => {
    void toggleDay(ownerId(), id, date, day, isTopLeft);
  };

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

  return (
    <Show fallback={<h1>Loading...</h1>} when={calendar()}>
      {(cal) => (
        <div class="gap-4 lg:flex">
          <div class="mb-6 flex flex-grow flex-col gap-4">
            <header class="relative">
              <h2 class={clsx('text-lg', isEditingTitle() && 'opacity-0')}>
                {cal().title}{' '}
                <IconButton
                  onClick={() => {
                    setIsEditingTitle(true);
                  }}
                >
                  <EditIcon height="16" width="16" />
                </IconButton>
              </h2>

              {isEditingTitle() && (
                <Input
                  class="inline w-auto"
                  onBlur={updateTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updateTitle(e);
                    }
                  }}
                  ref={titleInputRef}
                  type="text"
                  value={cal().title}
                />
              )}
            </header>

            <div class="flex gap-2">
              <Input
                onChange={(e) => {
                  void db.transact(db.tx.calendars[id].update({ startDate: e.currentTarget.value }));
                }}
                type="date"
                value={cal().startDate}
              />
              <Input
                onChange={(e) => {
                  void db.transact(db.tx.calendars[id].update({ endDate: e.currentTarget.value }));
                }}
                type="date"
                value={cal().endDate}
              />
              <IconButton
                onClick={() => {
                  setIsShowingSettings(true);
                }}
              >
                <SettingsIcon height="16" width="16" />
              </IconButton>
            </div>

            <CalendarGrid calendar={cal} categories={categories} days={days} onDayClick={onDayClick} />

            <Notes calendarId={id} notes={cal().notes} />
          </div>
          <div>
            <CategoryList
              calendarId={id}
              categories={categories()}
              countByCategory={countByCategory()}
              onCopy={onCopy}
              onCopyAll={onCopyAll}
            />
          </div>

          {isShowingSettings() && (
            <Settings
              calendar={cal}
              onClose={() => {
                setIsShowingSettings(false);
              }}
            />
          )}
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
            <li></li>
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

function toggleDay(ownerId: string, calendarId: string, date: Date, day: Day | undefined, isTopLeft: boolean) {
  const categoryId = selectedCategoryID();

  if (!day) {
    const dayId = id();
    void db.transact([
      db.tx.days[dayId].update({
        categoryId,
        date: toISODateString(date),
        halfCategoryId: null,
        ownerId,
      }),
      db.tx.calendars[calendarId].link({ days: dayId }),
    ]);
    return;
  }

  const top = !day.categoryId ? 'empty' : day.categoryId === categoryId ? 'same' : 'different';
  const half = !day.halfCategoryId ? 'empty' : day.halfCategoryId === categoryId ? 'same' : 'different';

  if (
    (top === 'same' && half === 'same') ||
    (top === 'same' && half === 'empty') ||
    (top === 'empty' && half === 'same')
  ) {
    return db.transact(db.tx.days[day.id].update({ categoryId: null, halfCategoryId: null }));
  }

  if ((top === 'empty' && half === 'empty') || (top === 'empty' && half === 'different')) {
    return db.transact(db.tx.days[day.id].update({ categoryId: categoryId }));
  }

  if (top === 'same' && half === 'different') {
    return db.transact(db.tx.days[day.id].update({ halfCategoryId: categoryId }));
  }

  if (top === 'different' && half === 'same') {
    return db.transact(db.tx.days[day.id].update({ categoryId, halfCategoryId: null }));
  }

  if ((top === 'different' && half === 'empty') || (top === 'different' && half === 'different')) {
    if (isTopLeft) {
      return db.transact(
        db.tx.days[day.id].update({
          categoryId,
          halfCategoryId: half === 'empty' ? day.categoryId : day.halfCategoryId,
        }),
      );
    } else {
      return db.transact(db.tx.days[day.id].update({ halfCategoryId: categoryId }));
    }
  }
}
