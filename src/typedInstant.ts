import type { Config, TransactionChunk as TransactionChunkInternal } from '@instantdb/core';
import { init as initInternal } from '@instantdb/react';

export function init<Schema>(config: Config) {
  const db = initInternal<Schema>(config);

  function useQuery<Q extends Query<Schema>>(query: Exactly<Query<Schema>, Q>): QueryState<Q, Schema> {
    return db.useQuery(query) as QueryState<Q, Schema>;
  }

  return {
    auth: db.auth,
    transact(...chunks: TransactionChunk<never, Schema>[]) {
      return db.transact(chunks as unknown as TransactionChunkInternal[]);
    },
    tx: emptyChunk<Schema>(),
    useAuth: db.useAuth,
    useQuery,
    useQuerySingle<Q extends ExactlyOne<Query<Schema>>>(query: Exactly<Query<Schema>, Q>) {
      const result = useQuery(query);
      const data = result.data?.[Object.keys(query)[0] as keyof Q][0] as
        | (MapToType<keyof Q, Schema> & ResponseOf<{ [K in keyof Q]: Remove$<Q[K]> }[keyof Q], Schema>)
        | undefined;
      return { ...result, data };
    },
  };
}

function emptyChunk<Schema>(): EmptyChunk<Schema> {
  return new Proxy(
    {},
    {
      get(_target, ns) {
        return new Proxy(
          {},
          {
            get(_target, id: Id) {
              return transactionChunk(ns as never, id, []);
            },
          },
        );
      },
    },
  ) as EmptyChunk<Schema>;
}

function transactionChunk<Schema, T extends keyof Schema>(
  etype: keyof Schema,
  id: Id,
  prevOps: Op<unknown, Schema>[],
): TransactionChunk<MapToType<T, Schema>, Schema> {
  return new Proxy(
    {},
    {
      get<Schema>(_target: unknown, cmd: keyof TransactionChunk<MapToType<T, Schema>, Schema>) {
        if (cmd === '__ops') return prevOps;
        if (cmd === 'create') cmd = 'update';
        return (args: MapToType<T, Schema>) => {
          return transactionChunk(etype, id, [...prevOps, [cmd, etype, id, args]] as Op<unknown, unknown>[]);
        };
      },
    },
  ) as TransactionChunk<MapToType<T, Schema>, Schema>;
}

//
// useQuery Types
//

type QueryState<Q, Schema> =
  | { data: QueryResponse<Q, Schema>; error: undefined; isLoading: false }
  | { data: undefined; error: { message: string }; isLoading: false }
  | { data: undefined; error: undefined; isLoading: true };

type WhereClause = Record<string, boolean | number | string>;

interface $Option {
  $?: { where: WhereClause };
}

type Subquery<Schema> = {
  [namespace in keyof Schema]?: NamespaceVal<Schema>;
};

type NamespaceVal<Schema> = $Option | ($Option & Subquery<Schema>);

type Query<Schema> = {
  [namespace in keyof Schema | '$']?: NamespaceVal<Schema>;
};

interface InstantObject {
  id: string;
}

type IsEmptyObject<T> = T extends Record<string, never> ? true : false;

type MapToType<K, Schema> = K extends keyof Schema ? Schema[K] : InstantObject;

type ResponseOf<Q, Schema> = {
  [K in keyof Q]: IsEmptyObject<Q[K]> extends true
    ? MapToType<K, Schema>[]
    : (MapToType<K, Schema> & ResponseOf<Q[K], Schema>)[];
};

type Remove$<T> = T extends object ? { [K in keyof T as Exclude<K, '$'>]: Remove$<T[K]> } : T;

type QueryResponse<T, Schema> = ResponseOf<{ [K in keyof T]: Remove$<T[K]> }, Schema>;

type Exactly<Parent, Child extends Parent> = Parent & {
  [K in keyof Child]: K extends keyof Parent ? Child[K] : never;
};

type Explode<T> = keyof T extends infer K
  ? K extends unknown
    ? { [I in keyof T]: I extends K ? T[I] : never }
    : never
  : never;
type AtMostOne<T> = Explode<Partial<T>>;
type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];
type ExactlyOne<T> = AtLeastOne<T> & AtMostOne<T>;

//
// tx types
//

type Action = 'delete' | 'link' | 'unlink' | 'update';
type Id = string;
type Op<Args, Schema> = [Action, keyof Schema, Id, Args];

interface TransactionChunk<Fields, Schema> {
  __ops: Op<object, Schema>[];
  /**
   * Create objects:
   *
   * @example
   *  const goalId = id();
   *  tx.goals[goalId].create({title: "Get fit", difficulty: 5})
   */
  create: (args: Omit<Fields, 'id'>) => TransactionChunk<Fields, Schema>;
  /**
   * Delete an object, alongside all of its links.
   *
   * @example
   *   tx.goals[goalId].delete()
   */
  delete: () => TransactionChunk<Fields, Schema>;
  /**
   * Link two objects together
   *
   * @example
   * const goalId = id();
   * const todoId = id();
   * transact([
   *   tx.goals[goalId].update({title: "Get fit"}),
   *   tx.todos[todoId].update({title: "Go on a run"}),
   *   tx.goals[goalId].link({todos: todoId}),
   * ])
   *
   * // Now, if you query:
   * useQuery({ goals: { todos: {} } })
   * // You'll get back:
   *
   * // { goals: [{ title: "Get fit", todos: [{ title: "Go on a run" }]}
   */
  link: (args: { [attribute in keyof Schema]?: string }) => TransactionChunk<Fields, Schema>;
  /**
   * Unlink two objects
   * @example
   *  // to "unlink" a todo from a goal:
   *  tx.goals[goalId].unlink({todos: todoId})
   */
  unlink: (args: { [attribute in keyof Schema]?: string }) => TransactionChunk<Fields, Schema>;
  /**
   * Update objects:
   *
   * @example
   *  const goalId = id();
   *  tx.goals[goalId].update({title: "Get fit", difficulty: 5})
   */
  update: (args: Omit<Partial<Fields>, 'id' | 'ownerId'>) => TransactionChunk<Fields, Schema>;
}

type ETypeChunk<Fields, Schema> = Record<Id, TransactionChunk<Fields, Schema>>;

type EmptyChunk<Schema> = {
  [etype in keyof Schema]: ETypeChunk<MapToType<etype, Schema>, Schema>;
};
