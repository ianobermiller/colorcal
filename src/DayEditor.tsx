import TrashIcon from '~icons/feather/trash-2';
import { For } from 'solid-js';

import type { Day } from './types';

import { IconButton } from './components/Button';
import { Modal } from './components/Modal';
import { Textarea } from './components/Textarea';
import { db, transactCalendar } from './db';

const ICONS = ['✈️', '🚆', '🚙', '🚍'];

export function DayEditor(props: { calendarId: string; day: Day; onClose(): void }) {
    return (
        <Modal onClose={props.onClose} title="Edit Day">
            <div class="flex flex-col gap-3 pb-4">
                <div class="flex flex-wrap gap-2">
                    <For each={ICONS}>
                        {(icon) => (
                            <div
                                classList={{
                                    'bg-slate-200': props.day.icon === icon,
                                    'flex size-10 cursor-pointer items-center justify-center rounded-full text-xl hover:font-bold':
                                        true,
                                }}
                                onClick={() => {
                                    const id = props.day.id;
                                    if (id) void transactCalendar(props.calendarId, db.tx.days[id].update({ icon }));
                                }}
                            >
                                {icon}
                            </div>
                        )}
                    </For>
                    <IconButton
                        onClick={() => {
                            const id = props.day.id;
                            if (id) void transactCalendar(props.calendarId, db.tx.days[id].update({ icon: null }));
                        }}
                    >
                        <TrashIcon />
                    </IconButton>
                </div>

                <Textarea
                    onBlur={(e) => {
                        const id = props.day.id;
                        if (id)
                            void transactCalendar(props.calendarId, db.tx.days[id].update({ note: e.target.value }));
                    }}
                    placeholder="Note"
                    value={props.day.note}
                />
            </div>
        </Modal>
    );
}
