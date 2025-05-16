// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from '@instantdb/react';

const schema = i.schema({
  entities: {
    $files: i.entity({ path: i.string().unique().indexed(), url: i.any() }),
    $users: i.entity({ email: i.string().unique().indexed() }),
    calendars: i.entity({
      endDate: i.string(),
      isPubliclyVisible: i.boolean(),
      notes: i.string(),
      ownerId: i.string(),
      startDate: i.string(),
      title: i.string(),
      updatedAt: i.date(),
    }),
    categories: i.entity({ color: i.string(), name: i.string(), ownerId: i.string() }),
    days: i.entity({
      categoryId: i.string().optional(),
      date: i.string(),
      halfCategoryId: i.string().optional(),
      ownerId: i.string(),
    }),
  },
  links: {
    calendarCategories: {
      forward: { has: 'many', label: 'categories', on: 'calendars' },
      reverse: { has: 'one', label: 'calendar', on: 'categories', onDelete: 'cascade' },
    },
    calendarDays: {
      forward: { has: 'many', label: 'days', on: 'calendars' },
      reverse: { has: 'one', label: 'calendar', on: 'days', onDelete: 'cascade' },
    },
  },
  rooms: {},
});

export default schema;

// This helps Typescript display nicer intellisense
export type AppSchema = typeof schema;
