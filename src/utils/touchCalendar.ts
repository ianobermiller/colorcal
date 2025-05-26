import { db } from '../db';

export function touchCalendar(calendarId: string) {
    return db.tx.calendars[calendarId].update({ updatedAt: new Date().toISOString() });
}
