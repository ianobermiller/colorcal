import { JSX } from 'preact';
import { route } from 'preact-router';
import { useCallback } from 'preact/hooks';
import { FiTrash2, FiX } from 'react-icons/fi';
import { Calendar, deleteRecord, updateRecord } from 'thin-backend';
import { Button, IconButton } from './Button';
import styles from './Settings.module.css';

interface Props {
  calendar: Calendar;
  onClose(): void;
}

export function Settings({ calendar, onClose }: Props) {
  const handleScrimClick = useCallback(
    (e: MouseEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest(`.${styles.modal}`)) {
        return;
      }

      onClose();
    },
    [onClose],
  );

  const handleVisibilityChange = useCallback(
    (e: JSX.TargetedEvent<HTMLInputElement>) => {
      updateRecord('calendars', calendar.id, {
        isPubliclyVisible: e.currentTarget.checked,
      });
    },
    [calendar.id],
  );

  return (
    <div class={styles.scrim} onClick={handleScrimClick}>
      <div class={styles.modal}>
        <h2>Calendar Settings</h2>
        <IconButton class={styles.closeButton} onClick={onClose}>
          <FiX />
        </IconButton>

        <label>
          <input type="checkbox" checked={calendar.isPubliclyVisible} onChange={handleVisibilityChange} /> Anyone with
          the link can view
        </label>

        <Button
          onClick={() => {
            // eslint-disable-next-line no-restricted-globals
            if (confirm(`Delete calendar "${calendar.title}"?`)) {
              // TODO: soft delete
              deleteRecord('calendars', calendar.id);
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
