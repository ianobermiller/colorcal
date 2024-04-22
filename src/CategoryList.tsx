import clsx from 'clsx';
import { useCallback } from 'preact/hooks';
import { FiMoreVertical, FiPlus, FiRefreshCw } from 'react-icons/fi';
import { Button, IconButton } from './Button';
import { useStore } from './Store';
import { Category, id, transact, tx, useAuth } from './data';

interface Props {
  categories: Category[];
  calendarId: string;
  countByCategory: Record<string, number | undefined>;
  onCopy: (category: Category) => void;
  onCopyAll: () => void;
}

export function CategoryList({ calendarId, categories, countByCategory, onCopy, onCopyAll }: Props) {
  const { user } = useAuth();
  const ownerId = user?.id ?? '';

  const selectCategory = useStore((store) => store.selectCategory);

  const addCategory = useCallback(() => {
    const categoryId = id();
    transact(
      tx.categories[categoryId].create({
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        name: '',
        ownerId,
      }),
      tx.calendars[calendarId].link({ categories: categoryId }),
    );
    selectCategory(categoryId);
  }, [calendarId, ownerId, selectCategory]);

  const autoColor = useCallback(() => {
    categories.forEach((cat, i) => {
      transact(tx.categories[cat.id].update({ color: COLORS[wrap(COLORS.length, i)] }));
    });
  }, [categories]);

  return (
    <div class="flex w-72 flex-col gap-3">
      <h3>Categories</h3>

      <ul>
        {categories.map((category) => (
          <CategoryRow category={category} count={countByCategory[category.id] ?? 0} onCopy={onCopy} />
        ))}
      </ul>

      <div class="flex flex-wrap gap-2">
        <Button onClick={addCategory}>
          <FiPlus size={24} />
          Add
        </Button>
        <Button onClick={autoColor}>Auto-color</Button>
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
      transact(tx.categories[category.id].update({ name: e.currentTarget.value }));
    },
    [category.id],
  );

  const onColorClick = useCallback(() => {
    if (selectedCategoryID === category.id) {
      const color = COLORS[wrap(COLORS.length, COLORS.indexOf(category.color) + 1)];
      transact(tx.categories[category.id].update({ color }));
    } else {
      selectCategory(category.id);
    }
  }, [category.color, category.id, selectCategory, selectedCategoryID]);

  return (
    <div class="relative mb-2 flex items-center gap-2">
      <button
        class={clsx(
          'relative inline-flex size-8 items-center justify-center rounded-full border-2 border-solid border-transparent font-bold text-white',
          selectedCategoryID === category.id && 'group border-slate-900',
        )}
        onClick={onColorClick}
        style={{ background: category.color }}
      >
        <div class="drop-shadow-[0_1px_1px_black] group-hover:opacity-0">{count}</div>
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

        <div class="group absolute right-0 z-10 hidden flex-col whitespace-nowrap rounded bg-white shadow-md group-focus-within:flex group-focus:flex">
          <button
            class="rounded px-4 py-2 text-left hover:bg-slate-100"
            onClick={(e) => {
              e.currentTarget.blur();
              onCopy(category);
            }}
          >
            Copy HTML
          </button>
          <button
            class="rounded px-4 py-2 text-left hover:bg-slate-100"
            onClick={() => {
              transact(tx.categories[category.id].delete());
            }}
          >
            Delete
          </button>
        </div>
      </IconButton>
    </div>
  );
}

// https://colorbrewer2.org/#type=qualitative&scheme=Set2&n=6
export const COLORS = ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f'];

function wrap(length: number, index: number): number {
  return index % length;
}
