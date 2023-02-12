import clsx from 'clsx';
import { useCallback } from 'preact/hooks';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { Category, createRecord, deleteRecord, updateRecord } from 'thin-backend';
import { Button, IconButton } from './Button';
import styles from './CategoryList.module.css';
import { useStore } from './Store';

interface Props {
  categories: Category[];
  calendarId: string;
  countByCategory: Record<string, number | undefined>;
}

export function CategoryList({ calendarId, categories, countByCategory }: Props) {
  const selectCategory = useStore((store) => store.selectCategory);
  return (
    <div>
      <h3>Categories</h3>
      <ul class={styles.categories}>
        {categories.map((category) => (
          <CategoryRow category={category} count={countByCategory[category.id] || 0} />
        ))}
      </ul>

      <div class={styles.buttons}>
        <Button
          onClick={() => {
            const startDate = new Date();
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 7);

            createRecord('categories', {
              calendarId: calendarId,
              color: COLORS[Math.floor(Math.random() * COLORS.length)],
              name: '',
            }).then((category) => selectCategory(category.id));
          }}
        >
          <FiPlus size={24} />
          Add
        </Button>
        <Button
          onClick={() => {
            categories.forEach((cat, i) =>
              updateRecord('categories', cat.id, {
                color: COLORS[wrap(COLORS.length, i)],
              }),
            );
          }}
        >
          Auto-color
        </Button>
      </div>
    </div>
  );
}

export default function CategoryRow({ count, category }: { category: Category; count: number }) {
  const selectedCategoryID = useStore((store) => store.selectedCategoryID);
  const selectCategory = useStore((store) => store.selectCategory);

  const onNameChange = useCallback(
    (e: JSX.TargetedEvent<HTMLInputElement>) => {
      updateRecord('categories', category.id, { name: e.currentTarget.value });
    },
    [category.id],
  );

  return (
    <div class={styles.category}>
      <button
        class={clsx({
          [styles.categoryColor]: true,
          [styles.currentCategoryColor]: selectedCategoryID === category.id,
        })}
        style={{ background: category.color }}
        onClick={() => {
          if (selectedCategoryID === category.id) {
            const color = COLORS[wrap(COLORS.length, COLORS.indexOf(category.color) + 1)];
            updateRecord('categories', category.id, { color });
          } else {
            selectCategory(category.id);
          }
        }}
      >
        {count}
      </button>

      <input
        type="text"
        value={category.name}
        onBlur={onNameChange}
        onKeyDown={(e) => e.key === 'Enter' && onNameChange(e)}
      />

      <IconButton
        onClick={() => {
          deleteRecord('categories', category.id);
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
