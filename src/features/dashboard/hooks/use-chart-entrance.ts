import { useEffect, useState } from 'react';
import { chartPhaseDelay, durationsMs } from '@/shared/motion';

/**
 * Session-level flag: once the first entrance window has elapsed, charts never
 * animate again during the session (SPEC 7.7). Month/filter changes re-render
 * without re-triggering the growth animation.
 */
let sessionEntranceDone = false;

/**
 * Chart entrance flag (SPEC 7.7): charts animate only on the first mount
 * (delay de fase + 600-800 ms). After that window any data change renders
 * without animation. With `prefers-reduced-motion` the charts never animate
 * (SPEC 7.9).
 */
export function useChartEntrance(): boolean {
  const [enabled, setEnabled] = useState(
    () =>
      !sessionEntranceDone &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    if (!enabled) return;
    const timer = window.setTimeout(() => {
      sessionEntranceDone = true;
      setEnabled(false);
    }, durationsMs.chart + chartPhaseDelay * 1000);
    return () => window.clearTimeout(timer);
  }, [enabled]);
  return enabled;
}
