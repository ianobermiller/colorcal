import { useRef } from "preact/hooks";
import {
  Category,
  createRecord,
  deleteRecord,
  updateRecord,
} from "thin-backend";
import { useStore } from "./Store";

interface Props {
  categories: Category[];
  calendarId: string;
}

export function CategoryList({ calendarId, categories }: Props) {
  const selectedCategoryID = useStore((store) => store.selectedCategoryID);
  const selectCategory = useStore((store) => store.selectCategory);
  const categoryName = useRef<HTMLInputElement>(null);
  return (
    <div>
      <h2>Categories</h2>
      <ul>
        {categories.map((category) => (
          <li
            style={{
              background: category.color,
              border: `solid 1px ${
                selectedCategoryID === category.id ? "black" : "white"
              }`,
            }}
          >
            <button onClick={() => selectCategory(category.id)}>
              {category.name}
            </button>
            <button
              onClick={() => {
                const color =
                  COLORS[
                    wrap(COLORS.length, COLORS.indexOf(category.color) + 1)
                  ];
                updateRecord("categories", category.id, { color });
              }}
            >
              Rotate Color
            </button>
            <button
              onClick={() => {
                deleteRecord("categories", category.id);
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>{" "}
      <input type="text" ref={categoryName} />
      <button
        onClick={() => {
          const startDate = new Date();
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 7);

          createRecord("categories", {
            calendarId: calendarId,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            name: categoryName.current?.value || "",
          });
        }}
      >
        Add
      </button>
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
