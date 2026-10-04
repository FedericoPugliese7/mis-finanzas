import { useEffect, useState } from 'react';

/** Desktop breakpoint from the design spec: fixed sidebar at ≥ 1024 px. */
const DESKTOP_QUERY = '(min-width: 1024px)';

/** Reactive `min-width: 1024px` match. Tab bar is shown below that width. */
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window === 'undefined' ? true : window.matchMedia(DESKTOP_QUERY).matches
  );

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);
    const onChange = (event: MediaQueryListEvent) => setIsDesktop(event.matches);
    setIsDesktop(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return isDesktop;
}
