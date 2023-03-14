import clsx from 'clsx';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { FiEdit, FiSettings } from 'react-icons/fi';
import { Day, createRecord, query, updateRecord } from 'thin-backend';
import { useQuery, useQuerySingleResult } from 'thin-backend-react';
import { urlToUuid } from 'uuid-url';
import { IconButton } from './Button';
import { CalendarGrid } from './CalendarGrid';
import { CategoryList } from './CategoryList';
import { toISODateString } from './dateUtils';
import styles from './Editor.module.css';
import { Notes } from './Notes';
import { Settings } from './Settings';
import { useStore } from './Store';

interface Props {
  path: string;
  id: string;
}

export function Editor({ id: urlID }: Props) {
  const id = urlToUuid(urlID);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isShowingSettings, setIsShowingSettings] = useState(false);
  const calendar = useQuerySingleResult(query('calendars').where('id', id));

  const days = useQuery(query('days').where('calendarId', id).orderByAsc('date'));
  const categories = useQuery(query('categories').where('calendarId', id).orderByAsc('createdAt'));
  const updateTitle = useCallback(
    (e: JSX.TargetedEvent<HTMLInputElement>) => {
      setIsEditingTitle(false);
      updateRecord('calendars', id, {
        title: e.currentTarget.value,
      });
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
      toggleDay(id, date, day, isTopLeft);
    },
    [id],
  );

  if (!id || !calendar || !days || !categories) {
    return <h1>Loading...</h1>;
  }

  const sortedCategories = sortBy(
    categories,
    (cat) => lastIfNotFound(days.findIndex((d) => d.categoryId === cat.id)),
    (cat) => lastIfNotFound(days.findIndex((d) => d.halfCategoryId === cat.id)),
  );

  const countByCategory = days.reduce<Record<string, number | undefined>>((acc, day) => {
    if (day.categoryId) {
      const existing = acc[day.categoryId] ?? 0;
      acc[day.categoryId] = existing + 1;
    }
    return acc;
  }, {});

  return (
    <div class={styles.root}>
      <div class={styles.main}>
        <header>
          <h2 class={clsx({ [styles.transparent]: isEditingTitle })}>
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
              defaultValue={calendar.title}
              onBlur={updateTitle}
              onKeyDown={(e) => e.key === 'Enter' && updateTitle(e)}
              ref={titleInputRef}
              type="text"
            />
          )}
        </header>

        <div class={styles.controls}>
          <input
            onChange={(e) =>
              updateRecord('calendars', id, {
                startDate: e.currentTarget.value,
              })
            }
            type="date"
            value={calendar.startDate}
          />
          <input
            onChange={(e) => updateRecord('calendars', id, { endDate: e.currentTarget.value })}
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
      </div>

      <div>
        <CategoryList calendarId={calendar.id} categories={sortedCategories} countByCategory={countByCategory} />

        <Notes calendarId={calendar.id} notes={calendar.notes} />
      </div>

      {isShowingSettings && <Settings calendar={calendar} onClose={() => setIsShowingSettings(false)} />}
    </div>
  );
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

function lastIfNotFound(index: number): number {
  return index >= 0 ? index : Number.POSITIVE_INFINITY;
}

async function toggleDay(calendarId: string, date: Date, day: Day | undefined, isTopLeft: boolean) {
  const { selectedCategoryID } = useStore.getState();
  if (!day) {
    return createRecord('days', {
      calendarId: calendarId,
      categoryId: selectedCategoryID,
      date: toISODateString(date),
    });
  }

  const top = !day.categoryId ? 'empty' : day.categoryId === selectedCategoryID ? 'same' : 'different';
  const half = !day.halfCategoryId ? 'empty' : day.halfCategoryId === selectedCategoryID ? 'same' : 'different';

  if (
    (top === 'same' && half === 'same') ||
    (top === 'same' && half === 'empty') ||
    (top === 'empty' && half === 'same')
  ) {
    return updateRecord('days', day.id, {
      categoryId: null,
      halfCategoryId: null,
    });
  }

  if ((top === 'empty' && half === 'empty') || (top === 'empty' && half === 'different')) {
    return updateRecord('days', day.id, { categoryId: selectedCategoryID });
  }

  if (top === 'same' && half === 'different') {
    return updateRecord('days', day.id, { halfCategoryId: null });
  }

  if (top === 'different' && half === 'same') {
    return updateRecord('days', day.id, {
      categoryId: selectedCategoryID,
      halfCategoryId: null,
    });
  }

  if ((top === 'different' && half === 'empty') || (top === 'different' && half === 'different')) {
    if (isTopLeft) {
      return updateRecord('days', day.id, {
        categoryId: selectedCategoryID,
        halfCategoryId: half === 'empty' ? day.categoryId : day.halfCategoryId,
      });
    } else {
      return updateRecord('days', day.id, {
        halfCategoryId: selectedCategoryID,
      });
    }
  }
}
