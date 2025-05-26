import type { InstaQLEntity } from '@instantdb/core';

import type schema from '../instant.schema';

export type { User } from '@instantdb/core';
export type Calendar = InstaQLEntity<typeof schema, 'calendars'>;
export type Category = InstaQLEntity<typeof schema, 'categories'>;
export interface CategoryWithColor extends Category {
    color: string;
}

export type Day = InstaQLEntity<typeof schema, 'days'>;
