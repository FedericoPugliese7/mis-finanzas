import { useCallback, useEffect, useRef, useState } from 'react';

function readStorage<T>(key: string, initialValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? initialValue : (JSON.parse(raw) as T);
  } catch {
    return initialValue;
  }
}

/**
 * Reactive `localStorage` state (JSON-serialized).
 * Syncs across tabs via the `storage` event.
 */
export function usePersistentStorage<T>(
  key: string,
  initialValue: T
): [T, (next: T | ((previous: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => readStorage(key, initialValue));
  const valueRef = useRef(value);
  const initialRef = useRef(initialValue);

  const set = useCallback(
    (next: T | ((previous: T) => T)) => {
      const resolved =
        typeof next === 'function'
          ? (next as (previous: T) => T)(valueRef.current)
          : next;
      valueRef.current = resolved;
      setValue(resolved);
      try {
        localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        /* storage unavailable: keep working in memory */
      }
    },
    [key]
  );

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== key) return;
      valueRef.current = readStorage(key, initialRef.current);
      setValue(valueRef.current);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key]);

  return [value, set];
}
