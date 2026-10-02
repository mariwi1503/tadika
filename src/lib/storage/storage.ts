import { seedDemoData } from './seed';
import { KEYS } from './keys';

export function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function remove(key: string): void {
  localStorage.removeItem(key);
}

const listeners = new Set<() => void>();

/** Notify every mounted screen that the "database" changed. */
export function commit(): void {
  for (const listener of Array.from(listeners)) listener();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function uid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function listCol<T>(key: string): T[] {
  return read<T[]>(key, []);
}

export function saveCol<T>(key: string, items: T[]): void {
  write(key, items);
  commit();
}

export function nowISO(): string {
  return new Date().toISOString();
}

/** Ensure the demo "database" exists. Safe to call repeatedly. */
export function ensureSeed(): void {
  if (read<string>(KEYS.seeded, '') !== 'v1') seedDemoData();
}

/** Wipe every collection and reseed — used by "Reset Data Demo". */
export function resetDemoData(): void {
  Object.values(KEYS).forEach((key) => {
    if (key !== KEYS.session) localStorage.removeItem(key);
  });
  seedDemoData({ force: true });
}
