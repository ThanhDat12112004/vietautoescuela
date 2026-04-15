import { cache } from 'react';
import { HOME_META_REVALIDATE_SECONDS } from '@/lib/cache-policy';

export type HomeSummaryMeta = {
  total_questions: number;
  total_students: number;
  pass_rate: number;
  total_attempts: number;
};

function getApiOrigin(): string {
  return (
    process.env.INTERNAL_API_BASE_URL ||
    process.env.API_ORIGIN ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    ''
  ).replace(/\/$/, '');
}

/**
 * Gọi stats-service (cùng nguồn với trang chủ). Dùng cache() để generateMetadata + layout chỉ 1 request/render.
 */
export const fetchHomeSummaryForMeta = cache(async (): Promise<HomeSummaryMeta | null> => {
  const origin = getApiOrigin();
  if (!origin) return null;
  try {
    const res = await fetch(`${origin}/stats/summary`, {
      next: { revalidate: HOME_META_REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    return {
      total_questions: Number(data.total_questions ?? 0),
      total_students: Number(data.total_students ?? 0),
      pass_rate: Number(data.pass_rate ?? 0),
      total_attempts: Number(data.total_attempts ?? 0),
    };
  } catch {
    return null;
  }
});

const DESCRIPTION_FALLBACK =
  'Hệ thống học và luyện thi bằng lái xe Tây Ban Nha. Luyện đề sát DGT, chấm điểm tức thì, giải thích rõ ràng; giao diện đa ngôn ngữ.';

export function buildSiteDescription(summary: HomeSummaryMeta | null): string {
  if (
    !summary ||
    (summary.total_questions === 0 &&
      summary.total_students === 0 &&
      summary.total_attempts === 0)
  ) {
    return DESCRIPTION_FALLBACK;
  }

  const base =
    'Hệ thống ôn thi DGT bằng lái xe Tây Ban Nha — luyện đề, chấm điểm tức thì, nội dung sát chuẩn DGT; giao diện đa ngôn ngữ.';
  const q = summary.total_questions.toLocaleString('vi-VN');
  const s = summary.total_students.toLocaleString('vi-VN');
  const a = summary.total_attempts.toLocaleString('vi-VN');
  const p = summary.pass_rate;
  return `${base} Ngân hàng ${q} câu hỏi; ${s} học viên đăng ký; ${a} lượt làm bài hoàn thành; tỷ lệ đậu ${p}%.`;
}

export function buildOrganizationJsonLd(params: {
  siteUrl: string;
  name: string;
  description: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: params.name,
    url: params.siteUrl,
    description: params.description,
    logo: `${params.siteUrl.replace(/\/$/, '')}/brand/logo.png`,
  };
}
