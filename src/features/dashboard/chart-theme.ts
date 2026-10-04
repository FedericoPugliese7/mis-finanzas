/**
 * Resolves theme CSS variables for Recharts. SVG presentation attributes do
 * not support `var()`, so the charts read concrete values at render time and
 * re-render when the theme store changes.
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
    income: read('--color-income'),
    expense: read('--color-expense'),
    border: read('--color-border'),
    surface: read('--color-surface'),
    content: read('--color-content'),
    contentMuted: read('--color-content-muted'),
    contentInverse: read('--color-content-inverse')
  };
}
