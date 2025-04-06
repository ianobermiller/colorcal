import { route } from 'preact-router';
import { useCallback, useRef } from 'preact/hooks';
import { uuidToUrl } from 'uuid-url';

import { Button } from './Button';
import { toISODateString } from './dateUtils';
import { db, id } from './db';

interface Props {
  /** for preact-router */
  path: string;
}

export function CalendarList(_: Props) {
  const { user } = db.useAuth();
  const ownerId = user?.id ?? '';

  const { data } = db.useQuery({ calendars: { $: { where: { ownerId } } } });
  const calendars = (data?.calendars ?? []).sort((a, b) => (a.startDate > b.startDate ? -1 : 1));
  const calendarName = useRef<HTMLInputElement>(null);

  const onCreate = useCallback(() => {
    const title = calendarName.current?.value ?? 'Untitled Calendar';
    void createCalendar(ownerId, title);
  }, [ownerId]);

  return (
    <>
      <h2 className="mb-2 text-xl">Your Calendars</h2>
      {user && (
        <>
          <ul className="mb-3 flex flex-col gap-3 lg:flex-row lg:flex-wrap">
            {calendars.map((cal) => (
              <li
                className="flex flex-col gap-3 rounded border-2 border-solid border-slate-200 px-4 py-3 hover:bg-slate-100"
                key={cal.id}
              >
                <a href={`/${uuidToUrl(cal.id)}`}>
                  <h3>{cal.title}</h3>
                  <p>
                    {formatDate(cal.startDate)} to {formatDate(cal.endDate)}
                  </p>
                </a>
              </li>
            ))}
          </ul>

          <div className="flex gap-2">
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

async function createCalendar(ownerId: string, title: string) {
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);

  const calendarId = id();
  await db.transact(
    db.tx.calendars[calendarId].update({
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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, { dateStyle: 'medium', timeZone: 'UTC' });
}
