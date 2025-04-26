import type { InstaQLEntity } from '@instantdb/react';

import type schema from '../instant.schema';

export type { User } from '@instantdb/react';
export type Calendar = InstaQLEntity<typeof schema, 'calendars'>;
export type Category = InstaQLEntity<typeof schema, 'categories'>;
export type Day = InstaQLEntity<typeof schema, 'days'>;
