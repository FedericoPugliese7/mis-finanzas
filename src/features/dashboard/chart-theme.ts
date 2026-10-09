/**
 * Resolves theme CSS variables for the custom SVG/CSS charts. SVG presentation
 * attributes do not support `var()`, so the charts read concrete values at
 * render time and re-render when the theme store changes.
 *
 * Reads the raw tokens (`--income`, …) instead of the Tailwind exposure
 * (`--color-*`): the `@theme inline` block does not guarantee which of those
 * are emitted, while the raw variables are always defined per theme.
 */
export interface ChartTheme {
  income: string;
  expense: string;
  border: string;
  surface: string;
  content: string;
  contentMuted: string;
  contentInverse: string;
}

export function chartTheme(): ChartTheme {
  const styles = getComputedStyle(document.documentElement);
  const read = (name: string): string => styles.getPropertyValue(name).trim();
  return {
    income: read('--income'),
    expense: read('--expense'),
    border: read('--border'),
    surface: read('--surface'),
    content: read('--content'),
    contentMuted: read('--content-muted'),
    contentInverse: read('--content-inverse')
  };
}
