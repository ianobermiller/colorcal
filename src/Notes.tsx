import { Textarea } from './components/Textarea';
import { db, transactCalendar } from './db';

interface Props {
    calendarId: string;
    notes: string;
    readonly?: boolean;
}

export function Notes(props: Props) {
    return (
        <>
            <h3>Notes</h3>
            <Textarea
                onBlur={(e) => {
                    void transactCalendar(
                        props.calendarId,
                        db.tx.calendars[props.calendarId].update({ notes: e.currentTarget.value }),
                    );
                }}
                readonly={props.readonly}
                rows={5}
            >
                {props.notes}
            </Textarea>
        </>
    );
}
