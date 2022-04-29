import { useCurrentUser, useQuery } from "thin-backend/react";
import { createRecord, query } from "thin-backend";
import { useRef } from "preact/hooks";
import { toISODateString } from "./dateUtils";
import { Button } from "./Button";

interface Props {
  path: string;
}

export function CalendarList({}: Props) {
  const user = useCurrentUser();
  const calendars = useQuery(query("calendars").orderByDesc("updatedAt"));
  const calendarName = useRef<HTMLInputElement>(null);
  return (
    <>
      <p>Hello {user?.email}!</p>
      <h3>Calendars</h3>
      <ul>
        {calendars?.map((cal) => (
          <li>
            <a href={`/${cal.id}`}>{cal.title}</a>
          </li>
        ))}
      </ul>
      <div>
        <input type="text" ref={calendarName} />
        <Button
          onClick={() => {
            const startDate = new Date();
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 7);

            createRecord("calendars", {
              endDate: toISODateString(endDate),
              startDate: toISODateString(startDate),
              title: calendarName.current?.value,
            });
          }}
        >
          Add
        </Button>
      </div>
    </>
  );
}
