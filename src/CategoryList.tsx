import { useRef } from "preact/hooks";
import { Category, createRecord } from "thin-backend";

interface Props {
  categories: Category[];
  calendarId: string;
}

export function CategoryList({ calendarId, categories }: Props) {
  const categoryName = useRef<HTMLInputElement>(null);
  return (
    <div>
      <h2>Categories</h2>
      <ul>
        {categories.map((category) => (
          <li style={{ background: category.color }}>{category.name}</li>
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
            color: "red",
            name: categoryName.current?.value || "",
          });
        }}
      >
        Add
      </button>
    </div>
  );
}
