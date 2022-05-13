import { useCallback, useRef } from "preact/hooks";
import { createRecord, logout, query, loginWithRedirect } from "thin-backend";
import { useCurrentUser, useQuery } from "thin-backend/react";
import { uuidToUrl } from "uuid-url";
import { Button } from "./Button";
import styles from "./CalendarList.module.css";
import { toISODateString } from "./dateUtils";

interface Props {
  path: string;
}

export function CalendarList({}: Props) {
  const user = useCurrentUser();
  const calendars = useQuery(
    query("calendars").where("userId", user?.id!).orderByDesc("updatedAt")
  );
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
      {user ? (
        <>
          <p>
            Logged in as {user.email}{" "}
            <a href="javascript:;" onClick={() => logout()}>
              Logout
            </a>
          </p>

          <ul class={styles.list}>
            {calendars?.map((cal) => (
              <li class={styles.calendar}>
                <a href={`/${uuidToUrl(cal.id)}`}>
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
      ) : (
        <p>
          <a href="javascript:;" onClick={() => loginWithRedirect()}>
            Login to create a calendar
          </a>
        </p>
      )}
    </>
  );
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    dateStyle: "medium",
    timeZone: "UTC",
  });
}
