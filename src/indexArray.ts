export function indexArray<T, K extends string>(arr: T[], getKey: (t: T) => K): Record<K, T | undefined> {
  const result = {} as Record<K, T | undefined>;
  for (const item of arr) {
    result[getKey(item)] = item;
  }
  return result;
}
