import { Textarea } from './components/Textarea';
import { db } from './db';
import { touchCalendar } from './utils/touchCalendar';

interface Props {
    calendarId: string;
    notes: string;
}

export function Notes(props: Props) {
    return (
        <>
            <h3>Notes</h3>
            <Textarea
                onBlur={(e) => {
                    void db.transact([
                        db.tx.calendars[props.calendarId].update({ notes: e.currentTarget.value }),
                        touchCalendar(props.calendarId),
                    ]);
                }}
                rows={5}
            >
                {props.notes}
            </Textarea>
        </>
    );
}
