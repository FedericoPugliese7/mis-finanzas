import { useEffect, useRef } from 'react';

/**
 * Measures the referenced header element and exposes its current height as a
 * CSS custom property on the document root. Useful for sticky sub-header bars
 * that must sit just below the global header.
 *
 * Usage:
 *   const headerRef = useHeaderHeight();
 *   <header ref={headerRef}>...</header>
 */
export function useHeaderHeight(cssVar = '--app-header-height') {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function update() {
      const height = headerRef.current?.getBoundingClientRect().height ?? 64;
      document.documentElement.style.setProperty(cssVar, `${height}px`);
    }

    update();

    const header = headerRef.current;
    const observer =
      typeof ResizeObserver !== 'undefined' && header ? new ResizeObserver(update) : null;
    if (header) observer?.observe(header);
    window.addEventListener('resize', update);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [cssVar]);

  return headerRef;
}
