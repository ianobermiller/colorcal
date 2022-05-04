import clsx from "clsx";
import { route } from "preact-router";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { Day, deleteRecord, query, updateRecord } from "thin-backend";
import { useQuery, useQuerySingleResult } from "thin-backend/react";
import { urlToUuid } from "uuid-url";
import { IconButton } from "./Button";
import styles from "./Calendar.module.css";
import { CalendarDay, FillerDay } from "./CalendarDay";
import { CategoryList } from "./CategoryList";
import { dateRangeAlignWeek, toISODateString } from "./dateUtils";

interface Props {
  path: string;
  id?: string;
}

export function Calendar({ id: urlID }: Props) {
  const id = urlID ? urlToUuid(urlID) : null;
  const [isEditingTitle, setIsEditingTitle] = useState(false);
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
    [calendar?.id]
  );

  const titleInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    titleInputRef.current?.focus();
    titleInputRef.current?.select();
  });

  if (!id || !calendar || !days || !categories) {
    return <h1>Loading...</h1>;
  }

  const sortedCategories = sortBy(
    categories,
    (cat) => lastIfNotFound(days.findIndex((d) => d.categoryId === cat.id)),
    (cat) => lastIfNotFound(days.findIndex((d) => d.halfCategoryId === cat.id))
  );

  const dayByDate = days.reduce((acc, day) => {
    acc[day.date] = day;
    return acc;
  }, {} as Record<string, Day | undefined>);

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
          <h1 class={clsx({ [styles.transparent]: isEditingTitle })}>
            {calendar.title}{" "}
            <IconButton
              onClick={() => {
                setIsEditingTitle(true);
              }}
            >
              <FiEdit />
            </IconButton>
          </h1>
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
              if (confirm(`Delete calendar "${calendar.title}"?`)) {
                // TODO: soft delete
                deleteRecord("calendars", id);
                route("/");
              }
            }}
          >
            <FiTrash2 />
          </IconButton>
        </div>

        <div class={styles.calendar}>
          {dateRangeAlignWeek(
            new Date(calendar.startDate),
            new Date(calendar.endDate)
          ).map((date) => {
            return date ? (
              <CalendarDay
                calendarId={calendar.id}
                day={dayByDate[toISODateString(date)]}
                date={date}
                categories={sortedCategories}
                startDate={calendar.startDate}
              />
            ) : (
              <FillerDay />
            );
          })}
        </div>
      </div>

      <CategoryList
        calendarId={calendar.id}
        categories={sortedCategories}
        countByCategory={countByCategory}
      />
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
