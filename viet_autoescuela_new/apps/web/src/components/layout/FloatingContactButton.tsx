import { useLanguage } from '@/hooks/useLanguage';
import { getContactEmail } from '@/lib/premium-inbox';
import { cn } from '@/lib/utils';
import { Mail, MessageCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/** Mặc định — ghi đè bằng NEXT_PUBLIC_WHATSAPP_URL / NEXT_PUBLIC_ZALO_URL trong .env */
const DEFAULT_WHATSAPP_URL = 'https://wa.me/34642087268';
const DEFAULT_ZALO_URL = 'https://zalo.me/0377858814';

function getWhatsAppUrl() {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_WHATSAPP_URL) {
    return process.env.NEXT_PUBLIC_WHATSAPP_URL;
  }
  return DEFAULT_WHATSAPP_URL;
}

function getZaloUrl() {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_ZALO_URL) {
    return process.env.NEXT_PUBLIC_ZALO_URL;
  }
  return DEFAULT_ZALO_URL;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const FloatingContactButton = () => {
  const { tk } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const whatsappUrl = getWhatsAppUrl();
  const zaloUrl = getZaloUrl();
  const gmailMailto = `mailto:${getContactEmail()}`;

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onEsc);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  return (
    <div
      ref={menuRef}
      className="fixed z-[90] flex flex-col items-end gap-2"
      style={{
        bottom: 'max(1rem, env(safe-area-inset-bottom))',
        right: 'max(1rem, env(safe-area-inset-right))',
      }}
    >
      {isOpen && (
        <div
          className={cn(
            'origin-bottom-right animate-in fade-in slide-in-from-bottom-2 duration-200',
            'w-[min(300px,calc(100vw-2rem))] overflow-hidden rounded-xl lg:w-[min(380px,calc(100vw-2rem))] lg:rounded-2xl',
            'border border-slate-200 bg-white shadow-xl',
            'dark:border-slate-600 dark:bg-slate-900'
          )}
          role="menu"
          aria-label={tk('contact.menuAria')}
        >
          <div className="brand-cta-primary border-b border-white/20 px-4 py-3 lg:px-5 lg:py-4">
            <p className="text-sm font-semibold tracking-tight text-brand-onCta lg:text-base">
              {tk('contact.title')}
            </p>
            <p className="mt-1 text-xs font-normal leading-snug text-white/85 lg:mt-1.5 lg:text-sm">
              {tk('contact.channelsSubtitle')}
            </p>
          </div>

          <nav className="divide-y divide-slate-100 bg-white p-1.5 dark:divide-slate-700 dark:bg-slate-900 lg:p-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50 lg:gap-3.5 lg:px-4 lg:py-3.5 dark:hover:bg-slate-800/80"
              title="WhatsApp"
              aria-label="WhatsApp"
              role="menuitem"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-white lg:h-11 lg:w-11 lg:rounded-[14px]"
                aria-hidden
              >
                <WhatsAppIcon className="h-5 w-5 lg:h-6 lg:w-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold leading-tight text-foreground lg:text-base">
                  WhatsApp
                </span>
                <span className="mt-0.5 block text-xs leading-snug text-muted-foreground lg:text-sm">
                  {tk('contact.directMessage')}
                </span>
              </span>
            </a>

            <a
              href={zaloUrl}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50 lg:gap-3.5 lg:px-4 lg:py-3.5 dark:hover:bg-slate-800/80"
              title="Zalo"
              aria-label="Zalo"
              role="menuitem"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0068FF] text-base font-black leading-none text-white lg:h-11 lg:w-11 lg:rounded-[14px] lg:text-xl"
                aria-hidden
              >
                Z
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold leading-tight text-foreground lg:text-base">
                  Zalo
                </span>
                <span className="mt-0.5 block text-xs leading-snug text-muted-foreground lg:text-sm">
                  {tk('contact.zaloChat')}
                </span>
              </span>
            </a>

            <a
              href={gmailMailto}
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50 lg:gap-3.5 lg:px-4 lg:py-3.5 dark:hover:bg-slate-800/80"
              title="Gmail"
              aria-label={tk('contact.gmailEmail')}
              role="menuitem"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EA4335] text-white lg:h-11 lg:w-11 lg:rounded-[14px]"
                aria-hidden
              >
                <Mail className="h-5 w-5 lg:h-6 lg:w-6" strokeWidth={2} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold leading-tight text-foreground lg:text-base">
                  {tk('contact.gmailEmail')}
                </span>
                <span className="mt-0.5 block truncate text-xs leading-snug text-muted-foreground lg:text-sm">
                  {tk('contact.gmailHint')} · {getContactEmail()}
                </span>
              </span>
            </a>
          </nav>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e2c2cb]/80 bg-[linear-gradient(135deg,#a63458_0%,#8f223d_52%,#7a2038_100%)] p-0 text-white',
          'shadow-[0_10px_24px_rgba(143,34,61,0.32)] ring-1 ring-white/35',
          'transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c85a78]/70 focus-visible:ring-offset-2'
        )}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={tk('contact.openMenuAria')}
        title={tk('contact.title')}
      >
        <MessageCircle className="h-5 w-5 shrink-0 opacity-95" strokeWidth={2} aria-hidden />
      </button>
    </div>
  );
};

export default FloatingContactButton;
