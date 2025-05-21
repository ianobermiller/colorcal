import TrashIcon from '~icons/feather/trash-2';
import clsx from 'clsx';
import { For } from 'solid-js';
import { Portal } from 'solid-js/web';

import type { Day } from './types';

import { IconButton } from './components/Button';
import { Modal } from './components/Modal';
import { Textarea } from './components/Textarea';
import { db } from './db';

const ICONS = ['✈️', '🚆', '🚙', '🚍'];

export function DayEditor(props: { day: Day; onClose(): void }) {
    return (
        <Portal>
            <Modal onClose={props.onClose} title="Edit Day">
                <div class="flex flex-col gap-3 pb-4">
                    <div class="flex flex-wrap gap-2">
                        <For each={ICONS}>
                            {(icon) => (
                                <div
                                    class={clsx(
                                        'flex size-10 cursor-pointer items-center justify-center rounded-full text-xl hover:font-bold',
                                        props.day.icon === icon && 'bg-slate-200',
                                    )}
                                    onClick={() => {
                                        const id = props.day.id;
                                        if (id) void db.transact(db.tx.days[id].update({ icon }));
                                    }}
                                >
                                    {icon}
                                </div>
                            )}
                        </For>
                        <IconButton
                            onClick={() => {
                                const id = props.day.id;
                                if (id) void db.transact(db.tx.days[id].update({ icon: null }));
                            }}
                        >
                            <TrashIcon />
                        </IconButton>
                    </div>
                    <Textarea
                        onBlur={(e) => {
                            const id = props.day.id;
                            if (id) void db.transact(db.tx.days[id].update({ note: e.target.value }));
                        }}
                        placeholder="Note"
                        value={props.day.note}
                    />
                </div>
            </Modal>
        </Portal>
    );
}
