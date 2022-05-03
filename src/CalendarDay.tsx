import clsx from "clsx";
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
  const isTopSelected = useStore(
    (state) => day?.categoryId && state.selectedCategoryID === day?.categoryId
  );
  const isHalfSelected = useStore(
    (state) =>
      day?.halfCategoryId && state.selectedCategoryID === day?.halfCategoryId
  );
  const showMonth =
    toISODateString(date) === startDate || date.getUTCDate() === 1;

  const topCategory = categories.find((c) => c.id === day?.categoryId);
  const halfCategory = categories.find((c) => c.id === day?.halfCategoryId);

  const onClick = useCallback(() => {
    const { selectedCategoryID } = useStore.getState();
    if (!day) {
      return createRecord("days", {
        calendarId,
        categoryId: selectedCategoryID,
        date: toISODateString(date),
      });
    }

    const top = !day.categoryId
      ? "empty"
      : day.categoryId === selectedCategoryID
      ? "same"
      : "different";
    const half = !day.halfCategoryId
      ? "empty"
      : day.halfCategoryId === selectedCategoryID
      ? "same"
      : "different";

    if (
      (top === "same" && half === "same") ||
      (top === "same" && half === "empty") ||
      (top === "empty" && half === "same")
    ) {
      return updateRecord("days", day.id, {
        categoryId: null,
        halfCategoryId: null,
      });
    }

    if (
      (top === "empty" && half === "empty") ||
      (top === "empty" && half === "different")
    ) {
      return updateRecord("days", day.id, { categoryId: selectedCategoryID });
    }

    if (top === "same" && half === "different") {
      return updateRecord("days", day.id, { halfCategoryId: null });
    }

    if (top === "different" && half === "same") {
      return updateRecord("days", day.id, {
        categoryId: selectedCategoryID,
        halfCategoryId: null,
      });
    }

    if (
      (top === "different" && half === "empty") ||
      (top === "different" && half === "different")
    ) {
      return updateRecord("days", day.id, {
        halfCategoryId: selectedCategoryID,
      });
    }
  }, [day]);

  return (
    <div
      class={styles.day}
      style={{ background: topCategory?.color }}
      onClick={onClick}
    >
      <span
        class={clsx({ [styles.selected]: isTopSelected || isHalfSelected })}
      >
        {date.getUTCDate()}
        {showMonth &&
          " " +
            date.toLocaleDateString(undefined, {
              month: "short",
              timeZone: "UTC",
            })}
      </span>
      {topCategory && (
        <div
          class={clsx(styles.dayLabel, { [styles.selected]: isTopSelected })}
        >
          {topCategory.name}
        </div>
      )}
      {halfCategory && (
        <>
          <div
            class={styles.halfDayBackground}
            style={`--color: ${halfCategory.color}`}
          />
          <div
            class={clsx(styles.halfDayLabel, {
              [styles.selected]: isHalfSelected,
            })}
          >
            {halfCategory.name}
          </div>
        </>
      )}
    </div>
  );
}

export function FillerDay() {
  return <div class={styles.day} />;
}
