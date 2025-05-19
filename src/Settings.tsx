import type { Accessor } from 'solid-js';

import { useNavigate } from '@solidjs/router';
import TrashIcon from '~icons/feather/trash-2';
import XIcon from '~icons/feather/x';

import type { Calendar } from './types';

import { Button, IconButton } from './Button';
import { db } from './db';
import { Input } from './Input';

interface Props {
  calendar: Accessor<Calendar>;
  onClose(): void;
}

export function Settings(props: Props) {
  const navigate = useNavigate();

  const handleScrimClick = (e: MouseEvent) => {
    if (e.target instanceof HTMLElement && e.target.closest('.modal')) {
      return;
    }

    props.onClose();
  };

  const handleVisibilityChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    void db.transact(db.tx.calendars[props.calendar().id].update({ isPubliclyVisible: target.checked }));
  };

  return (
    <div class="fixed inset-0 flex items-start justify-center bg-black/50 px-4 pt-12" onClick={handleScrimClick}>
      <div class="flex w-full flex-col gap-4 rounded border-slate-300 bg-white px-6 py-2 shadow-lg md:max-w-lg dark:bg-slate-800">
        <header class="flex items-center justify-between border-b border-slate-400 py-3">
          <h2 class="text-lg font-bold">Calendar Settings</h2>
          <IconButton onClick={props.onClose}>
            <XIcon height="16" width="16" />
          </IconButton>
        </header>
        <div class="flex flex-col gap-3 pb-4">
          <h3 class="font-bold">Visibility</h3>

          <label class="flex items-center gap-2">
            <Input checked={props.calendar().isPubliclyVisible} onChange={handleVisibilityChange} type="checkbox" />{' '}
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
      </div>
    </div>
  );
}
