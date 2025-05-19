import MoreVerticalIcon from '~icons/feather/more-vertical';
import PlusIcon from '~icons/feather/plus';
import clsx from 'clsx';
import { For } from "solid-js";

import type { CategoryWithColor } from './types';

import { Button, IconButton } from './Button';
import { getColorForMode } from './colors';
import { db, id } from './db';
import { Input } from './Input';
import { useAuth } from './instantdb-solid';
import { selectedCategoryID, setSelectedCategoryID } from './Store';

interface Props {
  calendarId: string;
  categories: CategoryWithColor[];
  countByCategory: Record<string, number | undefined>;
  onCopy: (category: CategoryWithColor) => void;
  onCopyAll: () => void;
}

export function CategoryList(props: Props) {
  const { user } = useAuth();
  const ownerId = () => user()?.id ?? '';

  const addCategory = async () => {
    const categoryId = id();
    await db.transact([
      db.tx.categories[categoryId].update({
        name: '',
        ownerId: ownerId(),
      }),
      db.tx.calendars[props.calendarId].link({ categories: categoryId }),
    ]);
    setSelectedCategoryID(categoryId);
  };

  return (
    <div class="flex w-72 flex-col gap-3">
      <h3>Categories</h3>

      <ul class="flex flex-col gap-2">
        <For each={props.categories}>{(category) => (
          <CategoryRow category={category} count={props.countByCategory[category.id] ?? 0} onCopy={props.onCopy} />
        )}</For>
      </ul>

      <div class="flex flex-wrap gap-2">
        <Button onClick={addCategory}>
          <PlusIcon height="24" width="24" />
          Add
        </Button>
        <Button onClick={props.onCopyAll}>Copy all</Button>
      </div>
    </div>
  );
}

function CategoryRow(props: {
  category: CategoryWithColor;
  count: number;
  onCopy: (category: CategoryWithColor) => void;
}) {
  const onNameChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    void db.transact(db.tx.categories[props.category.id].update({ name: target.value }));
  };

  const onColorClick = () => setSelectedCategoryID(props.category.id);

  return (
    <div class="flex items-center gap-2">
      <button
        class={clsx(
          'inline-flex size-8 items-center justify-center rounded-full border-2 border-solid font-bold text-white',
          selectedCategoryID() === props.category.id ? 'group border-slate-900 dark:border-white' : 'border-transparent',
        )}
        onClick={onColorClick}
        style={{ background: getColorForMode(props.category.color) }}
      >
        <span class="drop-shadow-[0_1px_1px_black]">{props.count}</span>
      </button>

      <Input
        onBlur={onNameChange}
        onFocus={onColorClick}
        onKeyDown={(e) => e.key === 'Enter' && onNameChange(e)}
        type="text"
        value={props.category.name}
      />

      <IconButton class="group relative">
        <MoreVerticalIcon height="20" width="20" />

        <div class="absolute right-0 z-10 hidden flex-col rounded bg-white whitespace-nowrap shadow-md group-focus-within:flex group-focus:flex dark:bg-slate-700 dark:text-slate-100">
          <button
            class="rounded px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-600"
            onClick={(e) => {
              e.currentTarget.blur();
              props.onCopy(props.category);
            }}
          >
            Copy HTML
          </button>
          <button
            class="rounded px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-600"
            onClick={() => {
              void db.transact(db.tx.categories[props.category.id].delete());
            }}
          >
            Delete
          </button>
        </div>
      </IconButton>
    </div>
  );
}
