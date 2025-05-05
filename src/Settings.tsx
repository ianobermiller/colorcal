import type { JSX } from 'preact';

import { route } from 'preact-router';
import { useCallback } from 'preact/hooks';
import { FiTrash2, FiX } from 'react-icons/fi';

import type { Calendar } from './types';

import { Button, IconButton } from './Button';
import { db } from './db';
import { Input } from './Input';

interface Props {
  calendar: Calendar;
  onClose(): void;
}

export function Settings({ calendar, onClose }: Props) {
  const handleScrimClick = useCallback(
    (e: MouseEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest('.modal')) {
        return;
      }

      onClose();
    },
    [onClose],
  );

  const handleVisibilityChange = useCallback(
    (e: JSX.TargetedEvent<HTMLInputElement>) => {
      void db.transact(db.tx.calendars[calendar.id].update({ isPubliclyVisible: e.currentTarget.checked }));
    },
    [calendar.id],
  );

  return (
    <div className="fixed inset-0 flex items-start justify-center bg-black/50 px-4 pt-12" onClick={handleScrimClick}>
      <div className="flex w-full flex-col gap-4 rounded border-slate-300 bg-white px-6 py-2 shadow-lg md:max-w-lg dark:bg-slate-800">
        <header className="flex items-center justify-between border-b border-slate-400 py-3">
          <h2 className="text-lg font-bold">Calendar Settings</h2>
          <IconButton onClick={onClose}>
            <FiX />
          </IconButton>
        </header>
        <div className="flex flex-col gap-3 pb-4">
          <h3 className="font-bold">Visibility</h3>

          <label className="flex items-center gap-2">
            <Input checked={calendar.isPubliclyVisible} onChange={handleVisibilityChange} type="checkbox" /> Anyone with
            the link can view
          </label>

          <h3 className="font-bold">Delete</h3>

          <Button
            className="self-start"
            onClick={async () => {
              if (confirm(`Delete calendar "${calendar.title}"?`)) {
                await db.transact(db.tx.calendars[calendar.id].delete());
                route('/');
              }
            }}
          >
            <FiTrash2 />
            Delete Calendar
          </Button>
        </div>
      </div>
    </div>
  );
}
