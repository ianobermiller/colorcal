import { route } from 'preact-router';
import { useCallback, useEffect, useRef } from 'preact/hooks';
import { createRecord, query } from 'thin-backend';
import { useCurrentUser, useQuery } from 'thin-backend-react';
import { uuidToUrl } from 'uuid-url';
import { Button } from './Button';
import styles from './CalendarList.module.css';
import { toISODateString } from './dateUtils';

interface Props {
  /** for preact-router */
  path: string;
}

export function CalendarList(_: Props) {
  useEffect(() => {
    if (window.location.search.includes('dump')) {
      dumpData();
    }
  }, []);

  const user = useCurrentUser();
  const calendars = useQuery(
    query('calendars')
      .where('userId', user?.id ?? '')
      .orderByDesc('updatedAt'),
  );
  const calendarName = useRef<HTMLInputElement>(null);

  const createCalendar = useCallback(() => {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    createRecord('calendars', {
      endDate: toISODateString(endDate),
      startDate: toISODateString(startDate),
      title: calendarName.current?.value,
    }).then((calendar) => {
      route(`/${uuidToUrl(calendar.id)}`);
    });
  }, []);

  return (
    <>
      <h2>Your Calendars</h2>
      {user && (
        <>
          <ul class={styles.list}>
            {calendars?.map((cal) => (
              <li class={styles.calendar}>
                <a href={`/${uuidToUrl(cal.id)}`}>
                  <h3>{cal.title}</h3>
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
                if (e.key === 'Enter') {
                  createCalendar();
                  e.currentTarget.value = '';
                }
              }}
              placeholder="Calendar Name"
              ref={calendarName}
              type="text"
            />

            <Button onClick={createCalendar}>Create a Calendar</Button>
          </div>
        </>
      )}
    </>
  );
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  });
}

async function dumpData() {
  const entries = await Promise.all(
    (['users', 'calendars', 'categories', 'days'] as const).map((table) =>
      query(table)
        .fetch()
        .then((items) => [table, items] as const),
    ),
  );
  const result = Object.fromEntries(entries);
  console.log({ result });
}
