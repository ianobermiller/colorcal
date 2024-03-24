import clsx from 'clsx';
import { useCallback } from 'preact/hooks';
import { FiPlus, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import { Button, IconButton } from './Button';
import styles from './CategoryList.module.css';
import { useStore } from './Store';
import { Category, id, transact, tx, useAuth } from './data';

interface Props {
  categories: Category[];
  calendarId: string;
  countByCategory: Record<string, number | undefined>;
}

export function CategoryList({ calendarId, categories, countByCategory }: Props) {
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
    <div>
      <h3>Categories</h3>

      <ul class={styles.categories}>
        {categories.map((category) => (
          <CategoryRow category={category} count={countByCategory[category.id] ?? 0} />
        ))}
      </ul>

      <div class={styles.buttons}>
        <Button onClick={addCategory}>
          <FiPlus size={24} />
          Add
        </Button>
        <Button onClick={autoColor}>Auto-color</Button>
      </div>
    </div>
  );
}

function CategoryRow({ category, count }: { category: Category; count: number }) {
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
    <div class={styles.category}>
      <button
        class={clsx({
          [styles.categoryColor]: true,
          [styles.currentCategoryColor]: selectedCategoryID === category.id,
        })}
        onClick={onColorClick}
        style={{ background: category.color }}
      >
        {count}
        {/* @ts-expect-error class isn't typed, but does work */}
        <FiRefreshCw class={styles.refresh} size={24} />
      </button>

      <input
        onBlur={onNameChange}
        onKeyDown={(e) => e.key === 'Enter' && onNameChange(e)}
        type="text"
        value={category.name}
      />

      <IconButton
        class={styles.delete}
        onClick={() => {
          transact(tx.categories[category.id].delete());
        }}
      >
        <FiTrash2 size={20} />
      </IconButton>
    </div>
  );
}

// https://colorbrewer2.org/#type=qualitative&scheme=Set2&n=6
export const COLORS = ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f'];

function wrap(length: number, index: number): number {
  return index % length;
}
