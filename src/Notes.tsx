import { updateRecord } from 'thin-backend';

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
          updateRecord('calendars', calendarId, { notes: e.currentTarget.value });
        }}
        rows={5}
      >
        {notes}
      </textarea>
    </>
  );
}
