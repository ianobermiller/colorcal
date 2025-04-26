import clsx from 'clsx';
import { useCallback } from 'preact/hooks';
import { FiMoreVertical, FiPlus, FiRefreshCw } from 'react-icons/fi';

import type { Category } from './types';

import { COLORS } from './autoColor';
import { Button, IconButton } from './Button';
import { db, id } from './db';
import { useStore } from './Store';
import { wrap } from './wrap';

interface Props {
  calendarId: string;
  categories: Category[];
  countByCategory: Record<string, number | undefined>;
  onAutoColor: (e: MouseEvent) => void;
  onCopy: (category: Category) => void;
  onCopyAll: () => void;
}

export function CategoryList({ calendarId, categories, countByCategory, onAutoColor, onCopy, onCopyAll }: Props) {
  const { user } = db.useAuth();
  const ownerId = user?.id ?? '';

  const selectCategory = useStore((store) => store.selectCategory);

  const addCategory = useCallback(async () => {
    const categoryId = id();
    await db.transact([
      db.tx.categories[categoryId].update({
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
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

      <ul>
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
        <Button onClick={onAutoColor}>Auto-color</Button>
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
  category: Category;
  count: number;
  onCopy: (category: Category) => void;
}) {
  const selectedCategoryID = useStore((store) => store.selectedCategoryID);
  const selectCategory = useStore((store) => store.selectCategory);

  const onNameChange = useCallback(
    (e: JSX.TargetedEvent<HTMLInputElement>) => {
      void db.transact(db.tx.categories[category.id].update({ name: e.currentTarget.value }));
    },
    [category.id],
  );

  const onColorClick = useCallback(() => {
    if (selectedCategoryID === category.id) {
      const color = COLORS[wrap(COLORS.length, COLORS.indexOf(category.color) + 1)];
      void db.transact(db.tx.categories[category.id].update({ color }));
    } else {
      selectCategory(category.id);
    }
  }, [category.color, category.id, selectCategory, selectedCategoryID]);

  return (
    <div className="relative mb-2 flex items-center gap-2">
      <button
        className={clsx(
          'relative inline-flex size-8 items-center justify-center rounded-full border-2 border-solid font-bold text-white',
          selectedCategoryID === category.id ? 'group border-slate-900' : 'border-transparent',
        )}
        onClick={onColorClick}
        style={{ background: category.color }}
      >
        <div className="drop-shadow-[0_1px_1px_black] group-hover:opacity-0">{count}</div>
        {/* @ts-expect-error class isn't typed, but does work */}
        <FiRefreshCw class="absolute opacity-0 drop-shadow-[0_1px_1px_black] group-hover:opacity-100" size={20} />
      </button>

      <input
        onBlur={onNameChange}
        onKeyDown={(e) => e.key === 'Enter' && onNameChange(e)}
        type="text"
        value={category.name}
      />

      <IconButton class="group relative -ml-2">
        <FiMoreVertical size={20} />

        <div className="group absolute right-0 z-10 hidden flex-col rounded bg-white whitespace-nowrap shadow-md group-focus-within:flex group-focus:flex">
          <button
            className="rounded px-4 py-2 text-left hover:bg-slate-100"
            onClick={(e) => {
              e.currentTarget.blur();
              onCopy(category);
            }}
          >
            Copy HTML
          </button>
          <button
            className="rounded px-4 py-2 text-left hover:bg-slate-100"
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
