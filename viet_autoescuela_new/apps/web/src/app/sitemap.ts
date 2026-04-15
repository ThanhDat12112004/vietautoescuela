import type { MetadataRoute } from 'next';
import { supportedLocales } from '@viet/i18n';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://vietautoescuela.com').replace(/\/$/, '');

/** Route tĩnh công khai (không gồm /quiz/:id). Luôn có prefix locale. */
const PATHS: { path: string; changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency']; priority: number }[] = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/login', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/register', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/materials', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/quizzes', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/leaderboard', changeFrequency: 'daily', priority: 0.7 },
  { path: '/profile', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.35 },
  { path: '/service-policy', changeFrequency: 'yearly', priority: 0.35 },
  { path: '/faq', changeFrequency: 'monthly', priority: 0.45 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of supportedLocales) {
    for (const { path, changeFrequency, priority } of PATHS) {
      const suffix = path === '/' ? `/${locale}` : `/${locale}${path}`;
      entries.push({
        url: `${siteUrl}${suffix}`,
        lastModified: now,
        changeFrequency,
        priority,
      });
    }
  }
  return entries;
}
