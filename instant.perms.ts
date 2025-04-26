// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from '@instantdb/react';

const ownerRules = Object.entries({
  isOwner: 'auth.id == data.ownerId',
  isOwnerCreate: 'auth.id == newData.ownerId',
}).flat();

const rules = {
  // Don't allow attributes that aren't in the schema
  attrs: { allow: { $default: 'false' } },
  calendars: {
    allow: { create: 'isOwnerCreate', delete: 'isOwner', update: 'isOwner', view: 'isOwner || isPubliclyVisible' },
    bind: [...ownerRules, 'isPubliclyVisible', 'data.isPubliclyVisible'],
  },
  categories: {
    allow: { create: 'isOwnerCreate', delete: 'isOwner', update: 'isOwner', view: 'isOwner || isPubliclyVisible' },
    bind: [...ownerRules, 'isPubliclyVisible', "true in data.ref('calendars.isPubliclyVisible')"],
  },
  days: {
    allow: { create: 'isOwnerCreate', delete: 'isOwner', update: 'isOwner', view: 'isOwner || isPubliclyVisible' },
    bind: [...ownerRules, 'isPubliclyVisible', "true in data.ref('calendars.isPubliclyVisible')"],
  },
} satisfies InstantRules;

export default rules;
