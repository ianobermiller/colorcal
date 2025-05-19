import { id, init } from '@instantdb/core';

import schema from '../instant.schema';

const APP_ID = 'ade8f44c-d755-45dd-b985-15ee77d3eb87';

export { id };
export const db = init({ appId: APP_ID, schema });
export type Schema = typeof schema;
