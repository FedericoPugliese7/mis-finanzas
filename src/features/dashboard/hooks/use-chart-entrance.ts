import { useEffect, useState } from 'react';
import { durationsMs } from '@/shared/motion';

/**
 * Recharts entrance flag (SPEC 7.7): charts animate only on the first mount
 * (600-800 ms). After that window any data change renders without animation.
 */
export function useChartEntrance(): boolean {
  const [enabled, setEnabled] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setEnabled(false), durationsMs.chart);
    return () => window.clearTimeout(timer);
  }, []);
  return enabled;
}
