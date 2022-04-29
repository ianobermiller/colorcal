import { useRef } from "preact/hooks";
import {
  Category,
  createRecord,
  deleteRecord,
  updateRecord,
} from "thin-backend";
import { useStore } from "./Store";
import styles from "./CategoryList.module.css";
import clsx from "clsx";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { Button, IconButton } from "./Button";

interface Props {
  categories: Category[];
  calendarId: string;
}

export function CategoryList({ calendarId, categories }: Props) {
  const selectCategory = useStore((store) => store.selectCategory);
  return (
    <div>
      <h2>Categories</h2>
      <ul class={styles.categories}>
        {categories.map((category) => (
          <CategoryRow category={category} />
        ))}
      </ul>
      <Button
        onClick={() => {
          const startDate = new Date();
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 7);

          createRecord("categories", {
            calendarId: calendarId,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            name: "",
          }).then((category) => selectCategory(category.id));
        }}
      >
        <FiPlus size={24} />
        Add
      </Button>
    </div>
  );
}

export default function CategoryRow({ category }: { category: Category }) {
  const selectedCategoryID = useStore((store) => store.selectedCategoryID);
  const selectCategory = useStore((store) => store.selectCategory);
  const count = () => "";
  // Object.values(store.categoryIDByDate).reduce(
  //   (acc, id) =>
  //     acc + (id === category.id || id?.endsWith(category.id) ? 1 : 0),
  //   0
  // );

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
            const color =
              COLORS[wrap(COLORS.length, COLORS.indexOf(category.color) + 1)];
            updateRecord("categories", category.id, { color });
          } else {
            selectCategory(category.id);
          }
        }}
      >
        {count()}
      </button>

      <input
        class={styles.categoryName}
        type="text"
        value={category.name}
        onChange={(e) => {
          updateRecord("categories", category.id, {
            name: e.currentTarget.value,
          });
        }}
      />
      <IconButton
        onClick={() => {
          deleteRecord("categories", category.id);
        }}
      >
        <FiTrash2 size={20} />
      </IconButton>
    </div>
  );
}

// https://colorbrewer2.org/#type=qualitative&scheme=Set2&n=6
export const COLORS = [
  "#66c2a5",
  "#fc8d62",
  "#8da0cb",
  "#e78ac3",
  "#a6d854",
  "#ffd92f",
];

function wrap(length: number, index: number): number {
  if (index < 0) {
    return length - 1;
  }

  if (index >= length) {
    return 0;
  }

  return index;
}
