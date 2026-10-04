import '@testing-library/dom';

/**
 * Minimal `matchMedia` polyfill for jsdom:
 * - `min-width: Npx` queries match against `window.innerWidth` (1024 by default),
 *   so the desktop shell renders in tests.
 * - Everything else (color scheme, reduced motion…) does not match.
 */
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = (query: string): MediaQueryList => {
    const widthMatch = /min-width:\s*(\d+)px/.exec(query);
    const matches =
      widthMatch === null ? false : window.innerWidth >= Number(widthMatch[1]);
    return {
      matches,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false
    } as unknown as MediaQueryList;
  };
}
