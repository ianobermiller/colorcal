import type { InstaQLOptions, User } from '@instantdb/core';
import type { Accessor } from 'solid-js';

import { type InstaQLParams, type InstaQLResponse, type InstaQLSubscriptionState } from '@instantdb/core';
import { createEffect, createSignal, onCleanup } from 'solid-js';

import type { Schema } from './db';

import { db } from './db';

/**
 * SolidJS hook to access InstantDB authentication
 */
export function useAuth() {
  const [user, setUser] = createSignal<undefined | User>();
  const [loading, setLoading] = createSignal(true);

  createEffect(() => {
    const unsubscribe = db.subscribeAuth((auth) => {
      setUser(auth.user);
      setLoading(!auth.user);
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
        // @ts-expect-error Conflict between InstantDB an d SolidJS types
        setData(result.data);
        setError(result.error);
        setLoading(false);
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
