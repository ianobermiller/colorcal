import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { FiEdit, FiSettings } from "react-icons/fi";
import { createRecord, Day, query, updateRecord } from "thin-backend";
import { useQuery, useQuerySingleResult } from "thin-backend-react";
import { urlToUuid } from "uuid-url";
import { IconButton } from "./Button";
import { CalendarGrid } from "./CalendarGrid";
import { CategoryList } from "./CategoryList";
import { toISODateString } from "./dateUtils";
import styles from "./Editor.module.css";
import { Settings } from "./Settings";
import { useStore } from "./Store";

interface Props {
  path: string;
  id?: string;
}

export function Editor({ id: urlID }: Props) {
  const id = urlID ? urlToUuid(urlID) : null;
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isShowingSettings, setIsShowingSettings] = useState(false);
  const calendar = useQuerySingleResult(
    query("calendars").where("id", id || "")
  );
  const days = useQuery(
    query("days").where("calendarId", calendar?.id!).orderByAsc("date")
  );
  const categories = useQuery(
    query("categories")
      .where("calendarId", calendar?.id!)
      .orderByAsc("createdAt")
  );
  const updateTitle = useCallback(
    (e: JSX.TargetedEvent<HTMLInputElement>) => {
      setIsEditingTitle(false);
      if (calendar) {
        updateRecord("calendars", calendar.id, {
          title: e.currentTarget.value,
        });
      }
    },
    [calendar]
  );

  const titleInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    titleInputRef.current?.focus();
    titleInputRef.current?.select();
  });

  const onDayClick = useCallback(
    (date: Date, day: Day | undefined) => {
      calendar?.id && toggleDay(calendar.id, date, day);
    },
    [calendar?.id]
  );

  if (!id || !calendar || !days || !categories) {
    return <h1>Loading...</h1>;
  }

  const sortedCategories = sortBy(
    categories,
    (cat) => lastIfNotFound(days.findIndex((d) => d.categoryId === cat.id)),
    (cat) => lastIfNotFound(days.findIndex((d) => d.halfCategoryId === cat.id))
  );

  const countByCategory = days.reduce((acc, day) => {
    if (day.categoryId) {
      const existing = acc[day.categoryId] || 0;
      acc[day.categoryId] = existing + 1;
    }
    return acc;
  }, {} as Record<string, number | undefined>);

  return (
    <div class={styles.root}>
      <div class={styles.main}>
        <header>
          <h2 class={clsx({ [styles.transparent]: isEditingTitle })}>
            {calendar.title}{" "}
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
              ref={titleInputRef}
              type="text"
              defaultValue={calendar.title}
              onBlur={updateTitle}
              onKeyDown={(e) => e.key === "Enter" && updateTitle(e)}
            />
          )}
        </header>

        <div class={styles.controls}>
          <input
            type="date"
            value={calendar.startDate}
            onChange={(e) =>
              updateRecord("calendars", id, {
                startDate: e.currentTarget.value,
              })
            }
          />
          <input
            type="date"
            value={calendar.endDate}
            onChange={(e) =>
              updateRecord("calendars", id, { endDate: e.currentTarget.value })
            }
          />
          <IconButton
            onClick={() => {
              setIsShowingSettings(true);
            }}
          >
            <FiSettings />
          </IconButton>
        </div>

        <CalendarGrid
          calendar={calendar}
          categories={categories}
          days={days}
          onDayClick={onDayClick}
        />
      </div>

      <CategoryList
        calendarId={calendar.id}
        categories={sortedCategories}
        countByCategory={countByCategory}
      />

      {isShowingSettings && (
        <Settings
          calendar={calendar}
          onClose={() => setIsShowingSettings(false)}
        />
      )}
    </div>
  );
}

function sortBy<T>(
  array: T[],
  ...predicates: Array<(element: T) => string | number>
): T[] {
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

async function toggleDay(calendarId: string, date: Date, day: Day | undefined) {
  const { selectedCategoryID } = useStore.getState();
  if (!day) {
    return createRecord("days", {
      calendarId: calendarId,
      categoryId: selectedCategoryID,
      date: toISODateString(date),
    });
  }

  const top = !day.categoryId
    ? "empty"
    : day.categoryId === selectedCategoryID
    ? "same"
    : "different";
  const half = !day.halfCategoryId
    ? "empty"
    : day.halfCategoryId === selectedCategoryID
    ? "same"
    : "different";

  if (
    (top === "same" && half === "same") ||
    (top === "same" && half === "empty") ||
    (top === "empty" && half === "same")
  ) {
    return updateRecord("days", day.id, {
      categoryId: null,
      halfCategoryId: null,
    });
  }

  if (
    (top === "empty" && half === "empty") ||
    (top === "empty" && half === "different")
  ) {
    return updateRecord("days", day.id, { categoryId: selectedCategoryID });
  }

  if (top === "same" && half === "different") {
    return updateRecord("days", day.id, { halfCategoryId: null });
  }

  if (top === "different" && half === "same") {
    return updateRecord("days", day.id, {
      categoryId: selectedCategoryID,
      halfCategoryId: null,
    });
  }

  if (
    (top === "different" && half === "empty") ||
    (top === "different" && half === "different")
  ) {
    return updateRecord("days", day.id, {
      halfCategoryId: selectedCategoryID,
    });
  }
}
