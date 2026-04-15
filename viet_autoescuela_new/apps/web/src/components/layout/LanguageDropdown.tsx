import { Check, ChevronDown } from '@/components/brand';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';
import type { Language } from '@/lib/api/types';
import { useCallback, useMemo, useState } from 'react';

/** Mỗi dòng menu: tên + gợi ý bằng đúng ngôn ngữ đó (không đổi theo UI). */
const LANGUAGE_MENU_ROW: Record<
  Language,
  { title: string; hint: string; flagSrc: string; flagAlt: string }
> = {
  vi: {
    title: 'Tiếng Việt',
    hint: 'Giao diện & bài thi/tài liệu bằng tiếng Việt',
    flagSrc: '/flags/vn.svg',
    flagAlt: 'Vietnam',
  },
  es: {
    title: 'Español',
    hint: 'Interfaz y contenidos en español',
    flagSrc: '/flags/es.svg',
    flagAlt: 'España',
  },
  en: {
    title: 'English',
    hint: 'Interface and content in English',
    flagSrc: '/flags/gb.svg',
    flagAlt: 'United Kingdom',
  },
};

const LANGUAGE_MENU_ORDER: Language[] = ['vi', 'es', 'en'];

export function LanguageDropdown({
  lang,
  setLang,
  align,
  compact,
  bareTrigger,
  triggerClassName,
  /** Giới hạn lựa chọn (ví dụ thi thật: chỉ ES/EN). */
  languages,
  /** Tooltip HTML cho nút trigger (ví dụ giải thích chế độ thi). */
  triggerTitle,
}: {
  lang: Language;
  setLang: (next: Language) => void;
  align: 'end' | 'start';
  compact?: boolean;
  /** Gọn cho header thi: viền slate nhẹ, không gradient như menu chính */
  bareTrigger?: boolean;
  /** Thêm class cho nút trigger (ví dụ full width trong ô lưới) */
  triggerClassName?: string;
  languages?: Language[];
  triggerTitle?: string;
}) {
  const { tk } = useLanguage();
  const [open, setOpen] = useState(false);
  const onOpenChange = useCallback((next: boolean) => {
    setOpen((prev) => (prev === next ? prev : next));
  }, []);
  const tight = Boolean(compact || bareTrigger);

  const options: { code: Language; flagSrc: string; flagAlt: string; title: string; hint: string }[] =
    useMemo(
      () => LANGUAGE_MENU_ORDER.map((code) => ({ code, ...LANGUAGE_MENU_ROW[code] })),
      []
    );

  const visibleOptions = useMemo(() => {
    if (!languages?.length) return options;
    const allow = new Set(languages);
    return options.filter((o) => allow.has(o.code));
  }, [options, languages]);
  const currentFlag =
    lang === 'vi' ? '/flags/vn.svg' : lang === 'en' ? '/flags/gb.svg' : '/flags/es.svg';

  return (
    <Popover modal={false} open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={tk('nav.chooseLanguage')}
          title={triggerTitle}
          aria-expanded={open}
          aria-haspopup="dialog"
          className={cn(
            'lang-menu-trigger inline-flex items-center rounded-full font-semibold text-[#2f171b] focus-visible:outline-none',
            bareTrigger
              ? 'gap-[clamp(0.15rem,0.75vmin,0.35rem)] border border-slate-300/70 bg-white/95 px-[clamp(0.25rem,1.05vmin,0.5rem)] py-[clamp(0.12rem,0.55vmin,0.28rem)] text-[clamp(0.5625rem,1.55vmin,0.8125rem)] shadow-sm transition-[border-color,background-color] hover:border-slate-400/65 hover:bg-slate-50/95 hover:shadow-sm focus-visible:ring-1 focus-visible:ring-primary/25 focus-visible:ring-offset-0'
              : 'border border-primary/20 bg-gradient-to-b from-white to-[#fff8f9] shadow-sm transition-[border-color,box-shadow,background-color] hover:border-primary/32 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2',
            !bareTrigger &&
              (compact
                ? 'gap-[clamp(0.15rem,0.75vmin,0.35rem)] px-[clamp(0.25rem,1.1vmin,0.55rem)] py-[clamp(0.12rem,0.65vmin,0.32rem)] text-[clamp(0.5625rem,1.55vmin,0.8125rem)]'
                : 'gap-2 px-3 py-2 text-sm'),
            triggerClassName,
          )}
        >
          <img
            src={currentFlag}
            alt=""
            aria-hidden
            className={cn(
              'rounded-[3px] object-cover shadow-sm',
              tight
                ? 'h-[clamp(0.75rem,2.05vmin,0.95rem)] w-[clamp(1rem,2.75vmin,1.3rem)]'
                : 'h-[14px] w-[20px]'
            )}
          />
          <span
            className={cn(
              'tabular-nums tracking-tight text-primary',
              tight ? 'min-w-[1.2rem] text-[clamp(0.5625rem,1.5vmin,0.75rem)]' : 'min-w-[1.75rem]',
            )}
          >
            {lang === 'vi' ? 'VI' : lang === 'en' ? 'EN' : 'ES'}
          </span>
          <ChevronDown
            className={cn(
              'lang-menu-chevron shrink-0 text-primary/75 transition-transform duration-200',
              open && 'rotate-180',
              tight
                ? 'h-[clamp(0.65rem,1.75vmin,0.875rem)] w-[clamp(0.65rem,1.75vmin,0.875rem)]'
                : 'h-4 w-4',
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        sideOffset={tight ? 6 : 8}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        className={cn(
          'max-h-[min(70dvh,22rem)] overflow-y-auto overscroll-contain border-primary/18 p-0 shadow-[0_16px_40px_rgba(58,10,20,0.12)]',
          tight
            ? 'min-w-[min(calc(100vw-1.25rem),13.5rem)] max-w-[min(calc(100vw-1rem),16rem)] p-1.5 sm:min-w-[14.5rem] sm:p-2'
            : 'min-w-[14.5rem] p-2',
        )}
      >
        <div className={cn('flex flex-col', tight ? 'gap-0.5 pt-0' : 'gap-1 pt-0')}>
          {visibleOptions.map((opt) => {
            const active = lang === opt.code;
            return (
              <button
                key={opt.code}
                type="button"
                className={cn(
                  'dd-item flex w-full cursor-pointer items-center rounded-xl text-left outline-none transition-colors hover:bg-primary/[0.08] focus-visible:bg-primary/[0.08] focus-visible:ring-2 focus-visible:ring-primary/25',
                  tight
                    ? 'gap-2 px-2 py-2 sm:gap-3 sm:px-2.5 sm:py-2.5'
                    : 'gap-3 px-2.5 py-2.5',
                  active && 'bg-primary/[0.1]',
                )}
                onClick={() => {
                  if (opt.code !== lang) setLang(opt.code);
                  setOpen((prev) => (prev ? false : prev));
                }}
              >
                <span
                  className={cn(
                    'flex shrink-0 items-center justify-center rounded-full bg-primary/[0.08] leading-none',
                    tight
                      ? 'h-[clamp(1.75rem,4.5vmin,2rem)] w-[clamp(1.75rem,4.5vmin,2rem)]'
                      : 'h-9 w-9',
                  )}
                >
                  <img
                    src={opt.flagSrc}
                    alt={opt.flagAlt}
                    className={cn(
                      'rounded-[3px] object-cover shadow-sm',
                      tight
                        ? 'h-[clamp(0.8125rem,2.2vmin,1.05rem)] w-[clamp(1.1rem,3vmin,1.5rem)]'
                        : 'h-[15px] w-[22px]'
                    )}
                  />
                </span>
                <div className="min-w-0 flex-1 text-left">
                  <div
                    className={cn(
                      'font-bold text-[#2f171b]',
                      tight ? 'text-[clamp(0.6875rem,1.65vmin,0.875rem)]' : 'text-sm',
                    )}
                  >
                    {opt.title}
                  </div>
                  <div
                    className={cn(
                      'font-medium leading-tight text-muted-foreground',
                      tight ? 'text-[clamp(0.5625rem,1.45vmin,0.6875rem)]' : 'text-[11px]',
                    )}
                  >
                    {opt.hint}
                  </div>
                </div>
                {active ? (
                  <Check
                    className={cn(
                      'shrink-0 text-primary',
                      tight ? 'h-[clamp(0.75rem,2vmin,1rem)] w-[clamp(0.75rem,2vmin,1rem)]' : 'h-4 w-4',
                    )}
                    aria-hidden
                  />
                ) : (
                  <span
                    className={cn('shrink-0', tight ? 'h-3.5 w-3.5 sm:h-4 sm:w-4' : 'h-4 w-4')}
                    aria-hidden
                  />
                )}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
