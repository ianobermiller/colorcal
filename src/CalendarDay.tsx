import { useCallback } from "preact/hooks";
import { Category, createRecord, Day, updateRecord } from "thin-backend";
import styles from "./CalendarDay.module.css";
import { toISODateString } from "./dateUtils";
import { useStore } from "./Store";

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

  const onClick = useCallback(() => {
    const { selectedCategoryID } = useStore.getState();
    if (day) {
      if (day.categoryId === selectedCategoryID) {
        updateRecord("days", day.id, { categoryId: null });
      } else {
        updateRecord("days", day.id, { categoryId: selectedCategoryID });
      }
    } else {
      createRecord("days", {
        calendarId,
        categoryId: selectedCategoryID,
        date: toISODateString(date),
      });
    }
  }, [day]);

  return (
    <div
      class={styles.day}
      style={{ background: topCategory?.color }}
      onClick={onClick}
    >
      {date.getUTCDate()}
      {showMonth &&
        " " +
          date.toLocaleDateString(undefined, {
            month: "short",
            timeZone: "UTC",
          })}
      {topCategory && <div class={styles.dayLabel}>{topCategory.name}</div>}
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
