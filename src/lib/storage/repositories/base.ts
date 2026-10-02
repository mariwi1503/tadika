import { listCol, saveCol, uid } from '../storage';

export interface Repo<T extends { id: string }> {
  list: () => T[];
  get: (id: string) => T | undefined;
  create: (data: Omit<T, 'id'> & { id?: string }) => T;
  update: (id: string, patch: Partial<T>) => T | undefined;
  remove: (id: string) => void;
  replace: (items: T[]) => void;
}

/** Generic localStorage-backed repository — mirrors a future REST resource. */
export function makeRepo<T extends { id: string }>(key: string): Repo<T> {
  return {
    list: () => listCol<T>(key),
    get: (id) => listCol<T>(key).find((item) => item.id === id),
    create: (data) => {
      const item = { ...data, id: data.id ?? uid() } as T;
      saveCol(key, [item, ...listCol<T>(key)]);
      return item;
    },
    update: (id, patch) => {
      const items = listCol<T>(key);
      const idx = items.findIndex((item) => item.id === id);
      if (idx === -1) return undefined;
      const next = { ...items[idx], ...patch };
      items[idx] = next;
      saveCol(key, items);
      return next;
    },
    remove: (id) => {
      saveCol(
        key,
        listCol<T>(key).filter((item) => item.id !== id),
      );
    },
    replace: (items) => saveCol(key, items),
  };
}
