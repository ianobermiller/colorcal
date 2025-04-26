import { db } from './db';
import { Textarea } from './Textarea';

interface Props {
  calendarId: string;
  notes: string;
}

export function Notes({ calendarId, notes }: Props) {
  return (
    <>
      <h3>Notes</h3>
      <Textarea
        onBlur={(e) => {
          void db.transact(db.tx.calendars[calendarId].update({ notes: e.currentTarget.value }));
        }}
        rows={5}
      >
        {notes}
      </Textarea>
    </>
  );
}
