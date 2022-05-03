import { useCurrentUser, useQuery } from "thin-backend/react";
import { Calendar, createRecord, logout, query } from "thin-backend";
import { useCallback, useRef } from "preact/hooks";
import { toISODateString } from "./dateUtils";
import { Button } from "./Button";
import styles from "./CalendarList.module.css";

interface Props {
  path: string;
}

export function CalendarList({}: Props) {
  const user = useCurrentUser();
  const calendars = useQuery(query("calendars").orderByDesc("updatedAt"));
  const calendarName = useRef<HTMLInputElement>(null);

  const createCalendar = useCallback(() => {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    createRecord("calendars", {
      endDate: toISODateString(endDate),
      startDate: toISODateString(startDate),
      title: calendarName.current?.value,
    });
  }, []);

  return (
    <>
      <h1>Calendars</h1>
      <p>
        Logged in as {user?.email}{" "}
        <a href="javascript:;" onClick={() => logout()}>
          Logout
        </a>
      </p>
      <ul class={styles.list}>
        {calendars?.map((cal) => (
          <li class={styles.calendar}>
            <a href={`/${cal.id}`}>
              <h2>{cal.title}</h2>
              <p>
                {formatDate(cal.startDate)} to {formatDate(cal.endDate)}
              </p>
            </a>
          </li>
        ))}
      </ul>
      <div class={styles.addCalendar}>
        <input
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              createCalendar();
              e.currentTarget.value = "";
            }
          }}
          ref={calendarName}
          type="text"
        />
        <Button onClick={createCalendar}>Add</Button>
      </div>
    </>
  );
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    dateStyle: "medium",
    timeZone: "UTC",
  });
}
