export const HOME_META_REVALIDATE_SECONDS = 300;

export const PUBLIC_RESOURCE_REVALIDATE_SECONDS = {
  quizzes: 60,
  categories: 60,
  types: 60,
  leaderboard: 15,
  summary: 30,
} as const;

export type PublicCachedResource = keyof typeof PUBLIC_RESOURCE_REVALIDATE_SECONDS;

export function getPublicCacheControl(ttlSeconds: number): string {
  const safeTtl = Math.max(1, Math.floor(ttlSeconds));
  return `public, max-age=${safeTtl}, s-maxage=${safeTtl}, stale-while-revalidate=${Math.max(
    safeTtl * 4,
    60
  )}`;
}
