// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from '@instantdb/core';

const ownerRules = {
    isOwner: 'auth.id == data.ownerId',
    isOwnerCreate: 'auth.id == newData.ownerId',
};

const rules = {
    // Don't allow attributes that aren't in the schema
    attrs: { allow: { $default: 'false' } },
    calendars: {
        allow: {
            create: 'isOwnerCreate',
            delete: 'isOwner',
            update: 'isOwner && (data.isReadOnly != true || newData.isReadOnly != true)',
            view: 'isOwner || isPubliclyVisible',
        },
        bind: objectToRules({
            ...ownerRules,
            isPubliclyVisible: 'data.isPubliclyVisible && data.id == ruleParams.knownCalendarId',
        }),
    },
    categories: {
        allow: {
            create: 'isOwnerCreate && isEditable',
            delete: 'isOwner && isEditable',
            update: 'isOwner && isEditable',
            view: 'isOwner || isPubliclyVisible',
        },
        bind: objectToRules({
            ...ownerRules,
            isEditable: '!(true in data.ref("calendar.isReadOnly"))',
            isPubliclyVisible:
                'true in data.ref("calendar.isPubliclyVisible") && ruleParams.knownCalendarId in data.ref("calendar.id")',
        }),
    },
    days: {
        allow: {
            create: 'isOwnerCreate && isEditable',
            delete: 'isOwner && isEditable',
            update: 'isOwner && isEditable',
            view: 'isOwner || isPubliclyVisible',
        },
        bind: objectToRules({
            ...ownerRules,
            isEditable: '!(true in data.ref("calendar.isReadOnly"))',
            isPubliclyVisible:
                'true in data.ref("calendar.isPubliclyVisible") && ruleParams.knownCalendarId in data.ref("calendar.id")',
        }),
    },
} satisfies InstantRules;

export default rules;

function objectToRules(obj: Record<string, string>) {
    return Object.entries(obj).flat();
}
