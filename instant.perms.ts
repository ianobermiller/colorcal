// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from '@instantdb/react';

const rules = {
  calendars: {
    allow: { create: 'isOwnerCreate', delete: 'isOwner', update: 'isOwner', view: 'isOwner' },
    bind: ['isOwner', 'auth.id == data.ownerId', 'isOwnerCreate', 'auth.id == newData.ownerId'],
  },
  categories: {
    allow: { create: 'isOwnerCreate', delete: 'isOwner', update: 'isOwner', view: 'isOwner' },
    bind: ['isOwner', 'auth.id == data.ownerId', 'isOwnerCreate', 'auth.id == newData.ownerId'],
  },
  days: {
    allow: { create: 'isOwnerCreate', delete: 'isOwner', update: 'isOwner', view: 'isOwner' },
    bind: ['isOwner', 'auth.id == data.ownerId', 'isOwnerCreate', 'auth.id == newData.ownerId'],
  },
} satisfies InstantRules;

export default rules;
