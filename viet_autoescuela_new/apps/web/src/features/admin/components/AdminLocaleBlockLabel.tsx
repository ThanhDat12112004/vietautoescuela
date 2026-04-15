'use client';

import type { Language } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import type { I18nKey } from '@viet/i18n';
import { tKey } from '@viet/i18n';

const FLAG_SRC: Record<'vi' | 'en' | 'es', string> = {
  vi: '/flags/vi.svg',
  en: '/flags/gb.svg',
  es: '/flags/es.svg',
};

const LABEL_KEY: Record<'vi' | 'en' | 'es', I18nKey> = {
  vi: 'adminUi.vietnamese',
  en: 'adminUi.english',
  es: 'adminUi.spanish',
};

export type AdminLocaleBlock = 'vi' | 'en' | 'es';

type Props = {
  lang: Language;
  block: AdminLocaleBlock;
  className?: string;
};

/** Nhãn ngôn ngữ (VI / EN / ES) kèm cờ SVG — tránh emoji cờ lỗi font/hệ thống. */
export function AdminLocaleBlockLabel({ lang, block, className }: Props) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <img
        src={FLAG_SRC[block]}
        alt=""
        width={20}
        height={14}
        className="h-3.5 w-5 shrink-0 rounded-[2px] object-cover shadow-sm ring-1 ring-black/10"
        decoding="async"
        aria-hidden
      />
      <span>{tKey(lang, LABEL_KEY[block])}</span>
    </span>
  );
}
