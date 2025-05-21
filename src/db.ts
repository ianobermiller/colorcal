import type { InstaQLOptions, User } from '@instantdb/core';
import type { Accessor } from 'solid-js';

import { id, init } from '@instantdb/core';
import { type InstaQLParams, type InstaQLResponse, type InstaQLSubscriptionState } from '@instantdb/core';
import { batch, createEffect, createSignal, onCleanup } from 'solid-js';

import schema from '../instant.schema';
type Schema = typeof schema;

const APP_ID = 'ade8f44c-d755-45dd-b985-15ee77d3eb87';

export { id };
export const db = init({ appId: APP_ID, schema });

/**
 * SolidJS hook to access InstantDB authentication
 */
export function useAuth() {
    const [user, setUser] = createSignal<undefined | User>();
    const [loading, setLoading] = createSignal(true);

    createEffect(() => {
        const unsubscribe = db.subscribeAuth((auth) => {
            batch(() => {
                setUser(auth.user);
                setLoading(!auth.user);
            });
        });

        onCleanup(() => {
            unsubscribe();
        });
    });

    return {
        loading,
        user,
    };
}

/**
 * SolidJS hook to query InstantDB data
 */
export function useQuery<Q extends InstaQLParams<Schema>>(
    query: Accessor<Q>,
    opts?: Accessor<InstaQLOptions>,
): {
    data: Accessor<InstaQLResponse<Schema, Q> | undefined>;
    error: Accessor<{ message: string } | undefined>;
    loading: Accessor<boolean>;
} {
    const [data, setData] = createSignal<InstaQLResponse<Schema, Q> | undefined>();
    const [error, setError] = createSignal<{ message: string } | undefined>();
    const [loading, setLoading] = createSignal(true);

    createEffect(() => {
        const unsubscribe = db.subscribeQuery(
            query(),
            (result: InstaQLSubscriptionState<Schema, Q>) => {
                batch(() => {
                    // @ts-expect-error Conflict between InstantDB and SolidJS types
                    setData(result.data);
                    setError(result.error);
                    setLoading(false);
                });
            },
            opts?.(),
        );

        onCleanup(() => {
            unsubscribe();
        });
    });

    return {
        data,
        error,
        loading,
    };
}
