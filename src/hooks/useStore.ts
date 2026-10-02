import { useEffect, useState } from 'react';
import { subscribe } from '@/lib/storage/storage';

/**
 * Subscribes the component to localStorage "database" changes.
 * Call `useStore()` then read repositories during render — every
 * repository mutation calls commit() which bumps this version.
 */
export function useStore(): number {
  const [version, setVersion] = useState(0);
  useEffect(() => subscribe(() => setVersion((v) => v + 1)), []);
  return version;
}
