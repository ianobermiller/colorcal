import clsx from 'clsx';
import { useCallback } from 'preact/hooks';
import { FiMoreVertical, FiPlus } from 'react-icons/fi';

import type { CategoryWithColor } from './types';

import { Button, IconButton } from './Button';
import { getColorForMode } from './colors';
import { db, id } from './db';
import { Input } from './Input';
import { useStore } from './Store';

interface Props {
  calendarId: string;
  categories: CategoryWithColor[];
  countByCategory: Record<string, number | undefined>;
  onCopy: (category: CategoryWithColor) => void;
  onCopyAll: () => void;
}

export function CategoryList({ calendarId, categories, countByCategory, onCopy, onCopyAll }: Props) {
  const { user } = db.useAuth();
  const ownerId = user?.id ?? '';

  const selectCategory = useStore((store) => store.selectCategory);

  const addCategory = useCallback(async () => {
    const categoryId = id();
    await db.transact([
      db.tx.categories[categoryId].update({
        name: '',
        ownerId,
      }),
      db.tx.calendars[calendarId].link({ categories: categoryId }),
    ]);
    selectCategory(categoryId);
  }, [calendarId, ownerId, selectCategory]);

  return (
    <div className="flex w-72 flex-col gap-3">
      <h3>Categories</h3>

      <ul className="flex flex-col gap-2">
        {categories.map((category) => (
          <CategoryRow
            category={category}
            count={countByCategory[category.id] ?? 0}
            key={category.id}
            onCopy={onCopy}
          />
        ))}
      </ul>

      <div className="flex flex-wrap gap-2">
        <Button onClick={addCategory}>
          <FiPlus size={24} />
          Add
        </Button>
        <Button onClick={onCopyAll}>Copy all</Button>
      </div>
    </div>
  );
}

function CategoryRow({
  category,
  count,
  onCopy,
}: {
  category: CategoryWithColor;
  count: number;
  onCopy: (category: CategoryWithColor) => void;
}) {
  const selectedCategoryID = useStore((store) => store.selectedCategoryID);
  const selectCategory = useStore((store) => store.selectCategory);

  const onNameChange = useCallback(
    (e: JSX.TargetedEvent<HTMLInputElement>) => {
      void db.transact(db.tx.categories[category.id].update({ name: e.currentTarget.value }));
    },
    [category.id],
  );

  const onColorClick = useCallback(() => selectCategory(category.id), [category.id, selectCategory]);

  return (
    <div className="flex items-center gap-2">
      <button
        className={clsx(
          'inline-flex size-8 items-center justify-center rounded-full border-2 border-solid font-bold text-white',
          selectedCategoryID === category.id ? 'group border-slate-900 dark:border-white' : 'border-transparent',
        )}
        onClick={onColorClick}
        style={{ background: getColorForMode(category.color) }}
      >
        <span className="drop-shadow-[0_1px_1px_black]">{count}</span>
      </button>

      <Input
        onBlur={onNameChange}
        onFocus={onColorClick}
        onKeyDown={(e) => e.key === 'Enter' && onNameChange(e)}
        type="text"
        value={category.name}
      />

      <IconButton className="group relative">
        <FiMoreVertical size={20} />

        <div className="absolute right-0 z-10 hidden flex-col rounded bg-white whitespace-nowrap shadow-md group-focus-within:flex group-focus:flex dark:bg-slate-700 dark:text-slate-100">
          <button
            className="rounded px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-600"
            onClick={(e) => {
              e.currentTarget.blur();
              onCopy(category);
            }}
          >
            Copy HTML
          </button>
          <button
            className="rounded px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-600"
            onClick={() => {
              void db.transact(db.tx.categories[category.id].delete());
            }}
          >
            Delete
          </button>
        </div>
      </IconButton>
    </div>
  );
}
