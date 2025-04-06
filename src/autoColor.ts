import { dateRangeAlignWeek, toISODateString } from './dateUtils';
import { indexArray } from './indexArray';
import { Calendar, Category, Day } from './types';
import { wrap } from './wrap';

// https://colorbrewer2.org/#type=qualitative&scheme=Set2&n=6
export const COLORS = ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f'];

export function autoColor(calendar: Calendar, days: Day[], categories: Category[], shiftKey: boolean) {
  if (shiftKey) {
    return greedy(calendar, days, categories);
  }
  return simple(categories);
}

/**
 * Automatically color edges using a greedy algorithm, falling back to index-based so it never fails.
 */
function greedy(calendar: Calendar, days: Day[], categories: Category[]) {
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
  let j = 0;
  return categories.map(({ id }) => {
    const adjacentColors = Array.from(adjacentCategoriesById.get(id) ?? [], (id) => colorByCategoryId.get(id));
    const availableColors = COLORS.filter((color) => !adjacentColors.includes(color));
    const color = availableColors.length ? wrapAt(availableColors, ++j) : wrapAt(COLORS, ++j);
    colorByCategoryId.set(id, color);
    return color;
  });
}

function simple(categories: Category[]) {
  return categories.map((_cat, i) => wrapAt(COLORS, i));
}

function wrapAt<T>(arr: T[], index: number): T {
  return arr[wrap(arr.length, index)];
}
