import { Category, createRecord, Day, updateRecord } from "thin-backend";
import styles from "./CalendarDay.module.css";
import { toISODateString } from "./dateUtils";

interface Props {
  day: Day | undefined;
  date: Date;
  startDate: string;
  categories: Category[];
  calendarId: string;
}

export function CalendarDay({
  calendarId,
  day,
  date,
  startDate,
  categories,
}: Props) {
  const showMonth =
    toISODateString(date) === startDate || date.getUTCDate() === 1;

  const topCategory = categories.find((c) => c.id === day?.categoryId);

  return (
    <div
      class={styles.day}
      style={{ background: topCategory?.color }}
      onClick={() => {
        if (day) {
          updateRecord("days", day.id, { categoryId: categories[0]?.id });
        } else {
          createRecord("days", {
            calendarId,
            categoryId: categories[0]?.id,
            date: toISODateString(date),
          });
        }
      }}
    >
      {date.getUTCDate()}{" "}
      {showMonth &&
        date.toLocaleDateString(undefined, {
          month: "short",
          timeZone: "UTC",
        })}
      {/* <div class={styles.dayLabel}>{getCategories()[0]?.name}</div> */}
      {/* <Show when={getCategories().length > 1}>
              <div
                class={styles.halfDayBackground}
                style={`--color: ${getCategories()[1]?.color}`}
              />
              <div class={styles.halfDayLabel}>{getCategories()[1]?.name}</div>
            </Show> */}
    </div>
  );
}

export function FillerDay() {
  return <div class={styles.day} />;
}
