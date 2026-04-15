import type { Metadata } from 'next';
import { defaultLocale, isSupportedLocale } from '@/i18n/config';
import type { Language } from '@/lib/api/types';

const META: Record<
  'terms' | 'service' | 'faq',
  Record<Language, { title: string; description: string }>
> = {
  terms: {
    vi: {
      title: 'Điều khoản sử dụng',
      description: 'Điều khoản sử dụng dịch vụ Viet Autoescuela — ôn thi lý thuyết bằng lái Tây Ban Nha.',
    },
    es: {
      title: 'Términos del servicio',
      description: 'Términos de uso de Viet Autoescuela — preparación teórica para el permiso en España.',
    },
    en: {
      title: 'Terms of service',
      description: 'Terms of service for Viet Autoescuela — Spanish driving theory practice.',
    },
  },
  service: {
    vi: {
      title: 'Chính sách dịch vụ',
      description: 'Cam kết phạm vi dịch vụ, hỗ trợ và chất lượng nội dung ôn tập.',
    },
    es: {
      title: 'Política de servicio',
      description: 'Alcance del servicio, soporte y calidad del contenido formativo.',
    },
    en: {
      title: 'Service policy',
      description: 'Service scope, support, and quality of study content.',
    },
  },
  faq: {
    vi: {
      title: 'Câu hỏi thường gặp',
      description: 'FAQ về tài khoản, gói Premium, chế độ luyện tập và hỗ trợ.',
    },
    es: {
      title: 'Preguntas frecuentes',
      description: 'FAQ sobre cuenta, plan Premium, modos de práctica y soporte.',
    },
    en: {
      title: 'FAQ',
      description: 'Frequently asked questions about accounts, Premium, and practice modes.',
    },
  },
};

const SITE = 'Viet Autoescuela';

export function buildLegalMetadata(
  slug: keyof typeof META,
  localeParam: string | undefined
): Metadata {
  const raw = localeParam ?? defaultLocale;
  const lang = (isSupportedLocale(raw) ? raw : defaultLocale) as Language;
  const m = META[slug][lang];
  return {
    title: `${m.title} | ${SITE}`,
    description: m.description,
    openGraph: {
      title: `${m.title} | ${SITE}`,
      description: m.description,
    },
  };
}
