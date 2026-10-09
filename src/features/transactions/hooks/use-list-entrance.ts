import { useEffect, useState } from 'react';
import { durationsMs } from '@/shared/motion';

/**
 * List entrance flag (SPEC 7.7): the stagger animation runs only on the first
 * mount of a list; subsequent filter/month changes render without re-animating
 * every row. Disabled under `prefers-reduced-motion`.
 */
export function useListEntrance(): boolean {
  const [enabled, setEnabled] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    if (!enabled) return;
    const timer = window.setTimeout(() => setEnabled(false), durationsMs.chart);
    return () => window.clearTimeout(timer);
  }, [enabled]);
  return enabled;
}
