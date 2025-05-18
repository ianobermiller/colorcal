import { route } from 'preact-router';
import { useCallback, useRef } from 'preact/hooks';
import { uuidToUrl } from 'uuid-url';

import { Button } from './Button';
import { toISODateString } from './dateUtils';
import { db, id } from './db';
import { Input } from './Input';

interface Props {
  /** for preact-router */
  path: string;
}

export function CalendarList(_: Props) {
  const { user } = db.useAuth();
  const ownerId = user?.id ?? '';

  const { data } = db.useQuery({ calendars: { $: { where: { ownerId } } } });
  const calendars = (data?.calendars ?? []).sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1));
  const calendarName = useRef<HTMLInputElement>(null);

  const onCreate = useCallback(() => {
    const title = calendarName.current?.value ?? 'Untitled Calendar';
    void createCalendar(ownerId, title);
  }, [ownerId]);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="mb-2 text-xl">Your Calendars</h2>
      {user && (
        <div className="flex gap-2">
          <Input
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
      )}

      {user && calendars.length && (
        <>
          <div className="">
            <div className="hidden w-full border-b font-medium text-gray-500 lg:grid lg:grid-cols-[2fr_repeat(3,_1fr)] dark:border-gray-600 dark:text-gray-200">
              <div className="p-4 pt-0 pb-3 pl-8 text-left">Name</div>
              <div className="p-4 pt-0 pb-3 pl-8 text-right">Start Date</div>
              <div className="p-4 pt-0 pb-3 pl-8 text-right">End Date</div>
              <div className="p-4 pt-0 pb-3 pl-8 text-right">Last Modified</div>
            </div>

            {calendars.map((cal) => (
              <a
                className="block border-b border-gray-100 bg-white p-4 text-gray-600 lg:grid lg:grid-cols-[2fr_repeat(3,_1fr)] lg:p-0 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                href={`/${uuidToUrl(cal.id)}`}
                key={cal.id}
              >
                <h3 className="text-gray-900 lg:p-4 lg:pl-8 lg:text-left dark:text-gray-200">{cal.title}</h3>

                <div className="inline text-sm after:content-['_-_'] lg:block lg:p-4 lg:pl-8 lg:text-right lg:text-base lg:after:content-['']">
                  {formatDate(cal.startDate)}
                </div>

                <div className="inline text-sm lg:block lg:p-4 lg:pl-8 lg:text-right lg:text-base">
                  {formatDate(cal.endDate)}
                </div>

                <div className="hidden lg:block lg:p-4 lg:pl-8 lg:text-right">
                  {formatDate(new Date(cal.updatedAt))}
                </div>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
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
      updatedAt: Date.now(),
    }),
  );
  route(`/${uuidToUrl(calendarId)}`);
}

function formatDate(date: Date | string): string {
  return (typeof date === 'string' ? new Date(date) : date).toLocaleDateString(undefined, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  });
}
