/** Minimum refresh interval for the official rate (1 hour). Leaf module: no dependencies, safe for the entry bundle. */
export const RATE_TTL_MS = 60 * 60 * 1000;

/**
 * First refresh is deferred past the initial LCP/TBT window (fetch + zod
 * validation are not needed to paint the app).
 */
export const RATE_REFRESH_DELAY_MS = 3000;
