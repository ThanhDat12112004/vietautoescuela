import '../index.css';

import { buildOrganizationJsonLd, buildSiteDescription, fetchHomeSummaryForMeta } from '@/lib/site-metadata';
import { HOME_META_REVALIDATE_SECONDS } from '@/lib/cache-policy';
import { supportedLocales } from '@/i18n/config';
import type { Metadata } from 'next';

/** Logo lớn cho OG/Twitter; tab trình duyệt dùng favicon.ico (public/). */
const BRAND_ICON = '/brand/logo.png';
const FAVICON = '/favicon.ico';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vietautoescuela.com';

/** ISR: metadata có thể tái tạo sau N giây (đồng bộ số liệu hệ thống). */
export const revalidate = HOME_META_REVALIDATE_SECONDS;

export async function generateMetadata(): Promise<Metadata> {
  const summary = await fetchHomeSummaryForMeta();
  const description = buildSiteDescription(summary);
  const ogTitle = 'Việt Autoescuela — Ôn thi DGT cho cộng đồng người Việt';
  const baseUrl = siteUrl.replace(/\/$/, '');
  const languages: Record<string, string> = {};
  for (const locale of supportedLocales) {
    languages[locale] = `${baseUrl}/${locale}`;
  }

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: 'Việt Autoescuela',
      template: '%s | Việt Autoescuela',
    },
    description,
    keywords: [
      'DGT',
      'bằng lái Tây Ban Nha',
      'ôn thi lý thuyết',
      'Việt Autoescuela',
      'học lái xe España',
      'thi bằng lái España',
      'Spanish driving theory test',
      'examen teórico DGT',
      'permiso de conducir España',
    ],
    alternates: {
      languages,
    },
    icons: {
      icon: [{ url: FAVICON, type: 'image/x-icon', sizes: '16x16 32x32' }],
      shortcut: FAVICON,
      apple: FAVICON,
    },
    openGraph: {
      type: 'website',
      locale: 'vi_VN',
      alternateLocale: ['es_ES', 'en_US'],
      url: '/',
      siteName: 'Việt Autoescuela',
      title: ogTitle,
      description,
      images: [{ url: BRAND_ICON, alt: 'Việt Autoescuela' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: [BRAND_ICON],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const summary = await fetchHomeSummaryForMeta();
  const description = buildSiteDescription(summary);
  const baseUrl = siteUrl.replace(/\/$/, '');
  const jsonLd = buildOrganizationJsonLd({
    siteUrl: baseUrl,
    name: 'Việt Autoescuela',
    description,
  });

  return (
    <html lang="vi">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
