import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { FiEdit, FiSettings } from 'react-icons/fi';
import { urlToUuid } from 'uuid-url';
import { IconButton } from './Button';
import { CalendarGrid } from './CalendarGrid';
import { CategoryList } from './CategoryList';
import { Notes } from './Notes';
import { Settings } from './Settings';
import { useStore } from './Store';
import { Category, Day, id, transact, tx, useAuth, useQuerySingle } from './data';
import { getDayOfWeek, getMonth, toISODateString } from './dateUtils';
import { autoColor } from './autoColor';

interface Props {
  path: string;
  id: string;
}

export function Editor({ id: urlID }: Props) {
  const { user } = useAuth();
  const ownerId = user?.id ?? '';

  const id = urlToUuid(urlID);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isShowingSettings, setIsShowingSettings] = useState(false);
  const { data: calendar } = useQuerySingle({ calendars: { $: { where: { id } }, categories: {}, days: {} } });
  const categories = calendar?.categories;
  const days = calendar?.days.sort((a, b) => a.date.localeCompare(b.date));

  const updateTitle = useCallback(
    (e: JSX.TargetedEvent<HTMLInputElement>) => {
      setIsEditingTitle(false);
      transact(tx.calendars[id].update({ title: e.currentTarget.value }));
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
      toggleDay(ownerId, id, date, day, isTopLeft);
    },
    [id, ownerId],
  );

  const onCopy = useCallback(
    (category: Category) => {
      days && copyHtmlToClipboard(getHtmlForCategory(category, days));
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
    days && copyHtmlToClipboard(sortedCategories.map((cat) => getHtmlForCategory(cat, days)).join(''));
  }, [days, sortedCategories]);

  const onAutoColor = useCallback(() => {
    if (!days || !calendar) return;

    autoColor(days, calendar, sortedCategories);
  }, [calendar, days, sortedCategories]);

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
    <div class="lg:flex">
      <div class="mb-6 flex flex-grow flex-col gap-4">
        <header class="relative">
          <h2 class={clsx('text-lg', isEditingTitle && 'opacity-0')}>
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
            <input
              class="absolute top-1/2 -translate-y-1/2"
              defaultValue={calendar.title}
              onBlur={updateTitle}
              onKeyDown={(e) => e.key === 'Enter' && updateTitle(e)}
              ref={titleInputRef}
              type="text"
            />
          )}
        </header>

        <div class="flex gap-2">
          <input
            onChange={(e) => {
              transact(tx.calendars[id].update({ startDate: e.currentTarget.value }));
            }}
            type="date"
            value={calendar.startDate}
          />
          <input
            onChange={(e) => {
              transact(tx.calendars[id].update({ endDate: e.currentTarget.value }));
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

function copyHtmlToClipboard(html: string) {
  navigator.clipboard.write([
    new ClipboardItem({
      'text/html': new Blob([html], { type: 'text/html' }),
      'text/plain': new Blob([html], { type: 'text/plain' }),
    }),
  ]);
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

function lastIfNotFound(index: number | undefined): number {
  return index != null && index >= 0 ? index : Number.POSITIVE_INFINITY;
}

function toggleDay(ownerId: string, calendarId: string, date: Date, day: Day | undefined, isTopLeft: boolean) {
  const { selectedCategoryID } = useStore.getState();
  if (!day) {
    const dayId = id();
    transact(
      tx.days[dayId].create({
        categoryId: selectedCategoryID,
        date: toISODateString(date),
        halfCategoryId: null,
        ownerId,
      }),
      tx.calendars[calendarId].link({ days: dayId }),
    );
    return;
  }

  const top = !day.categoryId ? 'empty' : day.categoryId === selectedCategoryID ? 'same' : 'different';
  const half = !day.halfCategoryId ? 'empty' : day.halfCategoryId === selectedCategoryID ? 'same' : 'different';

  if (
    (top === 'same' && half === 'same') ||
    (top === 'same' && half === 'empty') ||
    (top === 'empty' && half === 'same')
  ) {
    return transact(tx.days[day.id].update({ categoryId: null, halfCategoryId: null }));
  }

  if ((top === 'empty' && half === 'empty') || (top === 'empty' && half === 'different')) {
    return transact(tx.days[day.id].update({ categoryId: selectedCategoryID }));
  }

  if (top === 'same' && half === 'different') {
    return transact(tx.days[day.id].update({ halfCategoryId: selectedCategoryID }));
  }

  if (top === 'different' && half === 'same') {
    return transact(tx.days[day.id].update({ categoryId: selectedCategoryID, halfCategoryId: null }));
  }

  if ((top === 'different' && half === 'empty') || (top === 'different' && half === 'different')) {
    if (isTopLeft) {
      return transact(
        tx.days[day.id].update({
          categoryId: selectedCategoryID,
          halfCategoryId: half === 'empty' ? day.categoryId : day.halfCategoryId,
        }),
      );
    } else {
      return transact(tx.days[day.id].update({ halfCategoryId: selectedCategoryID }));
    }
  }
}
