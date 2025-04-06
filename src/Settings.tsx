import { JSX } from 'preact';
import { route } from 'preact-router';
import { useCallback } from 'preact/hooks';
import { FiTrash2, FiX } from 'react-icons/fi';

import { Button, IconButton } from './Button';
import { db } from './db';
import { Calendar } from './types';

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
    <div className="fixed inset-0 flex items-start justify-center bg-black/50 pt-12" onClick={handleScrimClick}>
      <div className="modal relative rounded border-slate-300 bg-white p-6">
        <h2>Calendar Settings</h2>
        <IconButton class="absolute top-5 right-3" onClick={onClose}>
          <FiX />
        </IconButton>

        <label className="my-6 block">
          <input checked={calendar.isPubliclyVisible} onChange={handleVisibilityChange} type="checkbox" /> Anyone with
          the link can view
        </label>

        <Button
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
  );
}
