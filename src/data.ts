import { init } from './typedInstant';

export type { User } from '@instantdb/react';
export { id } from '@instantdb/core';

type UUID = string;

export interface Calendar {
  id: UUID;
  ownerId: UUID;
  title: string;
  startDate: string;
  endDate: string;
  isPubliclyVisible: boolean;
  notes: string;
}

export interface Category {
  id: UUID;
  ownerId: UUID;
  color: string;
  name: string;
}

export interface Day {
  id: UUID;
  ownerId: UUID;
  categoryId: UUID | null;
  halfCategoryId: UUID | null;
  date: string;
}

interface Schema {
  calendars: Calendar;
  categories: Category;
  days: Day;
}

export const { auth, transact, tx, useAuth, useQuery, useQuerySingle } = init<Schema>({
  appId: 'ade8f44c-d755-45dd-b985-15ee77d3eb87',
});
