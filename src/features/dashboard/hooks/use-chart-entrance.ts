import { useEffect, useState } from 'react';
import { durationsMs } from '@/shared/motion';

/**
 * Recharts entrance flag (SPEC 7.7): charts animate only on the first mount
 * (600-800 ms). After that window any data change renders without animation.
 * With `prefers-reduced-motion` the charts never animate (SPEC 7.9).
 */
export function useChartEntrance(): boolean {
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
