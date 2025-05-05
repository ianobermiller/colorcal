import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { FiEdit, FiSettings } from 'react-icons/fi';
import { urlToUuid } from 'uuid-url';

import type { Category, Day } from './types';

import { autoColor } from './autoColor';
import { IconButton } from './Button';
import { CalendarGrid } from './CalendarGrid';
import { CategoryList } from './CategoryList';
import { getDayOfWeek, getMonth, toISODateString } from './dateUtils';
import { db, id } from './db';
import { Input } from './Input';
import { Notes } from './Notes';
import { Settings } from './Settings';
import { useStore } from './Store';

interface Props {
  id: string;
  path: string;
}

export function Editor({ id: urlID }: Props) {
  const { user } = db.useAuth();
  const ownerId = user?.id ?? '';

  const id = urlToUuid(urlID);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isShowingSettings, setIsShowingSettings] = useState(false);
  const { data } = db.useQuery({ calendars: { $: { where: { id } }, categories: {}, days: {} } });
  const calendar = data?.calendars[0];
  const categories = calendar?.categories;
  const days = calendar?.days.sort((a, b) => a.date.localeCompare(b.date));

  const updateTitle = useCallback(
    (e: JSX.TargetedEvent<HTMLInputElement>) => {
      setIsEditingTitle(false);
      void db.transact(db.tx.calendars[id].update({ title: e.currentTarget.value }));
    },
    [id],
  );

  const titleInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    titleInputRef.current?.focus();
    titleInputRef.current?.select();
  });

  const onDayClick = useCallback(
    (date: Date, day: Day | undefined, isTopLeft: boolean) => {
      void toggleDay(ownerId, id, date, day, isTopLeft);
    },
    [id, ownerId],
  );

  const onCopy = useCallback(
    (category: Category) => {
      if (!days) return;
      void copyHtmlToClipboard(getHtmlForCategory(category, days));
    },
    [days],
  );

  const sortedCategories = useMemo(
    () =>
      sortBy(
        categories ?? [],
        (cat) => lastIfNotFound(days?.findIndex((d) => d.categoryId === cat.id)),
        (cat) => lastIfNotFound(days?.findIndex((d) => d.halfCategoryId === cat.id)),
      ),
    [categories, days],
  );

  const onCopyAll = useCallback(() => {
    if (!days) return;
    void copyHtmlToClipboard(sortedCategories.map((cat) => getHtmlForCategory(cat, days)).join(''));
  }, [days, sortedCategories]);

  const onAutoColor = useCallback(
    (e: MouseEvent) => {
      if (!calendar || !days) return;

      const colors = autoColor(calendar, days, sortedCategories, e.shiftKey);
      void db.transact(sortedCategories.map(({ id }, i) => db.tx.categories[id].update({ color: colors[i] })));
    },
    [calendar, days, sortedCategories],
  );

  if (!id || !calendar || !categories || !days) {
    return <h1>Loading...</h1>;
  }

  const countByCategory = days.reduce<Record<string, number | undefined>>((acc, day) => {
    if (day.categoryId) {
      const existing = acc[day.categoryId] ?? 0;
      acc[day.categoryId] = existing + 1;
    }
    return acc;
  }, {});

  return (
    <div className="gap-4 lg:flex">
      <div className="mb-6 flex flex-grow flex-col gap-4">
        <header className="relative">
          <h2 className={clsx('text-lg', isEditingTitle && 'opacity-0')}>
            {calendar.title}{' '}
            <IconButton
              onClick={() => {
                setIsEditingTitle(true);
              }}
            >
              <FiEdit />
            </IconButton>
          </h2>

          {isEditingTitle && (
            <Input
              className="absolute top-1/2 -translate-y-1/2"
              defaultValue={calendar.title}
              onBlur={updateTitle}
              onKeyDown={(e) => e.key === 'Enter' && updateTitle(e)}
              ref={titleInputRef}
              type="text"
            />
          )}
        </header>

        <div className="flex gap-2">
          <Input
            onChange={(e) => {
              void db.transact(db.tx.calendars[id].update({ startDate: e.currentTarget.value }));
            }}
            type="date"
            value={calendar.startDate}
          />
          <Input
            onChange={(e) => {
              void db.transact(db.tx.calendars[id].update({ endDate: e.currentTarget.value }));
            }}
            type="date"
            value={calendar.endDate}
          />
          <IconButton
            onClick={() => {
              setIsShowingSettings(true);
            }}
          >
            <FiSettings />
          </IconButton>
        </div>

        <CalendarGrid calendar={calendar} categories={categories} days={days} onDayClick={onDayClick} />

        <Notes calendarId={calendar.id} notes={calendar.notes} />
      </div>
      <div>
        <CategoryList
          calendarId={calendar.id}
          categories={sortedCategories}
          countByCategory={countByCategory}
          onAutoColor={onAutoColor}
          onCopy={onCopy}
          onCopyAll={onCopyAll}
        />
      </div>
      {isShowingSettings && <Settings calendar={calendar} onClose={() => setIsShowingSettings(false)} />}
    </div>
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
  const { selectedCategoryID } = useStore.getState();
  if (!day) {
    const dayId = id();
    void db.transact([
      db.tx.days[dayId].update({
        categoryId: selectedCategoryID,
        date: toISODateString(date),
        halfCategoryId: null,
        ownerId,
      }),
      db.tx.calendars[calendarId].link({ days: dayId }),
    ]);
    return;
  }

  const top = !day.categoryId ? 'empty' : day.categoryId === selectedCategoryID ? 'same' : 'different';
  const half = !day.halfCategoryId ? 'empty' : day.halfCategoryId === selectedCategoryID ? 'same' : 'different';

  if (
    (top === 'same' && half === 'same') ||
    (top === 'same' && half === 'empty') ||
    (top === 'empty' && half === 'same')
  ) {
    return db.transact(db.tx.days[day.id].update({ categoryId: null, halfCategoryId: null }));
  }

  if ((top === 'empty' && half === 'empty') || (top === 'empty' && half === 'different')) {
    return db.transact(db.tx.days[day.id].update({ categoryId: selectedCategoryID }));
  }

  if (top === 'same' && half === 'different') {
    return db.transact(db.tx.days[day.id].update({ halfCategoryId: selectedCategoryID }));
  }

  if (top === 'different' && half === 'same') {
    return db.transact(db.tx.days[day.id].update({ categoryId: selectedCategoryID, halfCategoryId: null }));
  }

  if ((top === 'different' && half === 'empty') || (top === 'different' && half === 'different')) {
    if (isTopLeft) {
      return db.transact(
        db.tx.days[day.id].update({
          categoryId: selectedCategoryID,
          halfCategoryId: half === 'empty' ? day.categoryId : day.halfCategoryId,
        }),
      );
    } else {
      return db.transact(db.tx.days[day.id].update({ halfCategoryId: selectedCategoryID }));
    }
  }
}
