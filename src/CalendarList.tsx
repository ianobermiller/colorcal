import { route } from 'preact-router';
import { useCallback, useRef } from 'preact/hooks';
import { uuidToUrl } from 'uuid-url';
import { Button } from './Button';
import styles from './CalendarList.module.css';
import { id, transact, tx, useAuth, useQuery } from './data';
import { toISODateString } from './dateUtils';

interface Props {
  /** for preact-router */
  path: string;
}

export function CalendarList(_: Props) {
  const { user } = useAuth();
  const ownerId = user?.id ?? '';

  const { data } = useQuery({
    calendars: { $: { where: { ownerId } } },
  });
  const calendars = (data?.calendars ?? []).sort((a, b) => (a.startDate > b.startDate ? -1 : 1));
  const calendarName = useRef<HTMLInputElement>(null);

  const onCreate = useCallback(() => {
    const title = calendarName.current?.value ?? 'Untitled Calendar';
    createCalendar(ownerId, title);
  }, [ownerId]);

  return (
    <>
      <h2>Your Calendars</h2>
      {user && (
        <>
          <ul class={styles.list}>
            {calendars.map((cal) => (
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
                  onCreate();
                  e.currentTarget.value = '';
                }
              }}
              placeholder="Calendar Name"
              ref={calendarName}
              type="text"
            />

            <Button onClick={onCreate}>Create a Calendar</Button>
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

function createCalendar(ownerId: string, title: string) {
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);

  const calendarId = id();
  transact(
    tx.calendars[calendarId].create({
      endDate: toISODateString(endDate),
      isPubliclyVisible: false,
      notes: '',
      ownerId,
      startDate: toISODateString(startDate),
      title,
    }),
  );
  route(`/${uuidToUrl(calendarId)}`);
}
