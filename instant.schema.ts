// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from '@instantdb/react';

export const schema = i.schema({
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
    }),
    categories: i.entity({ ownerId: i.string(), color: i.string(), name: i.string() }),
    days: i.entity({
      ownerId: i.string(),
      categoryId: i.string().optional(),
      halfCategoryId: i.string().optional(),
      date: i.string(),
    }),
  },
  links: {
    calendarCategories: {
      forward: { has: 'many', label: 'categories', on: 'calendars' },
      reverse: { has: 'one', label: 'calendars', on: 'categories', onDelete: 'cascade' },
    },
    calendarDays: {
      forward: { has: 'many', label: 'days', on: 'calendars' },
      reverse: { has: 'one', label: 'calendars', on: 'days', onDelete: 'cascade' },
    },
  },
  rooms: {},
});

// This helps Typescript display nicer intellisense
export type AppSchema = typeof schema;
