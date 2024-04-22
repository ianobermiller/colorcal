import { COLORS } from './CategoryList';
import { Calendar, Category, Day, transact, tx } from './data';
import { dateRangeAlignWeek, toISODateString } from './dateUtils';
import { indexArray } from './indexArray';
import { wrap } from './wrap';

/**
 * Automatically color edges using a greedy algorithm, falling back to index-based so it never fails.
 */
export function autoColor(days: Day[], calendar: Calendar, categories: Category[]) {
  const dayByDate = indexArray(days, (day) => day.date);
  const range = dateRangeAlignWeek(new Date(calendar.startDate), new Date(calendar.endDate)).map((date) => ({
    date,
    day: date && dayByDate[toISODateString(date)],
  }));

  const adjacentCategoriesById = new Map<string, Set<string>>();
  range.forEach(({ day }, i) => {
    if (!day) return;

    const prevDay = range[i - 1]?.day;
    const nextDay = range[i + 1]?.day;

    if (day.categoryId) {
      let set = adjacentCategoriesById.get(day.categoryId);
      if (!set) {
        set = new Set();
        adjacentCategoriesById.set(day.categoryId, set);
      }

      if (day.halfCategoryId) {
        set.add(day.halfCategoryId);
      }

      if (prevDay?.halfCategoryId) {
        set.add(prevDay.halfCategoryId);
      } else if (prevDay?.categoryId) {
        set.add(prevDay.categoryId);
      }

      if (!day.halfCategoryId && nextDay?.categoryId) {
        set.add(nextDay.categoryId);
      }
    }

    if (day.halfCategoryId) {
      let set = adjacentCategoriesById.get(day.halfCategoryId);
      if (!set) {
        set = new Set();
        adjacentCategoriesById.set(day.halfCategoryId, set);
      }

      if (day.categoryId) {
        set.add(day.categoryId);
      }

      if (nextDay?.categoryId) {
        set.add(nextDay.categoryId);
      }
    }
  });

  // greedy coloring algo
  const colorByCategoryId = new Map<string, string>();
  transact(
    ...categories.map(({ id }, i) => {
      const adjacentColors = Array.from(adjacentCategoriesById.get(id) ?? [], (id) => colorByCategoryId.get(id));
      const availableColors = COLORS.filter((color) => !adjacentColors.includes(color));
      const color = availableColors[wrap(availableColors.length, i)] ?? COLORS[wrap(COLORS.length, i)];
      colorByCategoryId.set(id, color);
      return tx.categories[id].update({ color });
    }),
  );
}
