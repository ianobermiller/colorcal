import { db } from './db';

interface Props {
  calendarId: string;
  notes: string;
}

export function Notes({ calendarId, notes }: Props) {
  return (
    <>
      <h3>Notes</h3>
      <textarea
        onBlur={(e) => {
          db.transact(db.tx.calendars[calendarId].update({ notes: e.currentTarget.value }));
        }}
        rows={5}
      >
        {notes}
      </textarea>
    </>
  );
}
