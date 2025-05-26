import type { Accessor } from 'solid-js';

import { useNavigate } from '@solidjs/router';
import TrashIcon from '~icons/feather/trash-2';

import type { Calendar } from './types';

import { Button } from './components/Button';
import { Input } from './components/Input';
import { Modal } from './components/Modal';
import { db, transactCalendar } from './db';

interface Props {
    calendar: Accessor<Calendar>;
    onClose(): void;
}

export function Settings(props: Props) {
    const navigate = useNavigate();

    const handleVisibilityChange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        void transactCalendar(
            props.calendar().id,
            db.tx.calendars[props.calendar().id].update({ isPubliclyVisible: target.checked }),
        );
    };

    const updateTitle = (e: { currentTarget: { value: string } }) => {
        void transactCalendar(
            props.calendar().id,
            db.tx.calendars[props.calendar().id].update({ title: e.currentTarget.value }),
        );
    };

    return (
        <Modal onClose={props.onClose} title="Calendar Settings">
            <div class="flex flex-col gap-3 pb-4">
                <h3 class="font-bold">Calendar Name</h3>
                <Input
                    class="w-full"
                    onBlur={updateTitle}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            updateTitle(e);
                        }
                    }}
                    type="text"
                    value={props.calendar().title}
                />

                <h3 class="font-bold">Visibility</h3>
                <label class="flex items-center gap-2">
                    <Input
                        checked={props.calendar().isPubliclyVisible}
                        onChange={handleVisibilityChange}
                        type="checkbox"
                    />{' '}
                    Anyone with the link can view
                </label>

                <h3 class="font-bold">Delete</h3>
                <Button
                    class="self-start"
                    onClick={() => {
                        if (confirm(`Delete calendar "${props.calendar().title}"?`)) {
                            void db.transact(db.tx.calendars[props.calendar().id].delete()).then(() => navigate('/'));
                        }
                    }}
                >
                    <TrashIcon height="16" width="16" />
                    Delete Calendar
                </Button>
            </div>
        </Modal>
    );
}
