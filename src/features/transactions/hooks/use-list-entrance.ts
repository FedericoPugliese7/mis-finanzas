import { useEffect, useState } from 'react';
import { durationsMs } from '@/shared/motion';

/**
 * Session-level flag: once the first entrance window has elapsed, transaction
 * lists never re-stagger during the session.
 */
let sessionListEntranceDone = false;

/**
 * List entrance flag (SPEC 7.7): the stagger animation runs only on the first
 * mount of a list; subsequent filter/month changes render without re-animating
 * every row. Disabled under `prefers-reduced-motion`.
 */
export function useListEntrance(): boolean {
  const [enabled, setEnabled] = useState(
    () =>
      !sessionListEntranceDone &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    if (!enabled) return;
    const timer = window.setTimeout(() => {
      sessionListEntranceDone = true;
      setEnabled(false);
    }, durationsMs.chart);
    return () => window.clearTimeout(timer);
  }, [enabled]);
  return enabled;
}
