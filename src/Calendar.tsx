import { useQuery, useQuerySingleResult } from "thin-backend/react";
import { Day, deleteRecord, query, updateRecord } from "thin-backend";
import { route } from "preact-router";
import styles from "./Calendar.module.css";
import { dateRangeAlignWeek, toISODateString } from "./dateUtils";
import { CalendarDay, FillerDay } from "./CalendarDay";
import { CategoryList } from "./CategoryList";
import { Button, IconButton } from "./Button";
import { FiHome, FiTrash2 } from "react-icons/fi";

interface Props {
  path: string;
  id?: string;
}

export function Calendar({ id }: Props) {
  const calendar = useQuerySingleResult(
    query("calendars").where("id", id || "")
  );
  const days = useQuery(query("days").where("calendarId", calendar?.id!));
  const categories =
    useQuery(query("categories").where("calendarId", calendar?.id!)) || [];

  if (!id || !calendar) {
    return null;
  }

  const dayByDate = (days || []).reduce((acc, day) => {
    acc[day.date] = day;
    return acc;
  }, {} as Record<string, Day | undefined>);

  const countByCategory = (days || []).reduce((acc, day) => {
    if (day.categoryId) {
      const existing = acc[day.categoryId] || 0;
      acc[day.categoryId] = existing + 1;
    }
    return acc;
  }, {} as Record<string, number | undefined>);

  return (
    <div class={styles.root}>
      <div class={styles.main}>
        <h1>
          {calendar.title}{" "}
          <a href="/">
            <FiHome />
          </a>
        </h1>
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
                categories={categories}
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
        categories={categories}
        countByCategory={countByCategory}
      />
    </div>
  );
}
