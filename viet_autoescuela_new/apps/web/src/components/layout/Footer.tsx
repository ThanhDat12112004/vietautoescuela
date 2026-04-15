import { BrandLogo } from '@/components/brand';
import { useLanguage } from '@/hooks/useLanguage';
import { getStoredAuth } from '@/lib/auth';
import { getContactEmail } from '@/lib/premium-inbox';
import { cn } from '@/lib/utils';
import { ArrowUpRight, Mail, MessageCircle, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LocaleLink } from '@/components/navigation';
import { APP_ROUTES } from '@/config/routes';

type FooterProps = {
  className?: string;
};

const Footer = ({ className }: FooterProps) => {
  const { tk } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const syncAuth = () => {
      const auth = getStoredAuth();
      setIsAdmin((auth?.user?.role || '').toLowerCase() === 'admin');
    };

    syncAuth();
    window.addEventListener('storage', syncAuth);
    window.addEventListener('focus', syncAuth);

    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('focus', syncAuth);
    };
  }, []);

  const socialClass =
    'flex h-10 w-10 items-center justify-center rounded-lg border border-white/25 bg-white/10 text-[#fff5f6] transition-colors hover:border-[#E3C565]/55 hover:bg-white/15';

  return (
    <footer
      className={cn(
        'mt-auto w-full border-t border-black/20 bg-gradient-to-b from-[#8B1E2D] to-[#6B0F1A] text-[#fff5f6] shadow-[0_-4px_24px_rgba(58,10,20,0.12)]',
        className
      )}
    >
      <div className="w-full max-w-none px-3 py-8 sm:px-4 sm:py-10 md:px-5 lg:px-6">
        {/* Lưới 10 phần (lg+): logo 4 | mỗi nhóm link 2 (chia đều 6 phần còn lại) */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-start lg:grid-cols-10 lg:gap-x-6 lg:gap-y-0 xl:gap-x-8">
          <div className="flex w-full min-w-0 flex-col gap-3 border-b border-white/10 pb-8 md:border-b-0 md:pb-0 lg:col-span-4 lg:pr-2">
            <LocaleLink
              href="/"
              className="group flex w-fit max-w-full flex-col gap-3 no-underline sm:flex-row sm:items-center sm:gap-3"
              aria-label={tk('nav.backHome')}
            >
              <BrandLogo className="shrink-0" imageClassName="h-24 w-auto sm:h-28" />
              <div className="min-w-0 text-left">
                <div className="text-lg font-extrabold leading-tight tracking-tight text-white sm:text-xl">
                  Việt <span className="text-[#E3C565]">Autoescuela</span>
                </div>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/65 sm:text-[11px]">
                  {tk('footer.dgtTagline')}
                </p>
              </div>
            </LocaleLink>
            <p className="w-full min-w-0 text-xs leading-relaxed text-white/75 sm:text-sm">
              {tk('footer.description')}
            </p>
            <div className="flex gap-2 pt-1">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={socialClass}
                aria-label="Facebook"
              >
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="https://zalo.me/0377858814"
                target="_blank"
                rel="noopener noreferrer"
                className={socialClass}
                aria-label="Zalo"
              >
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={socialClass}
                aria-label="YouTube"
              >
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 md:col-span-2 lg:col-span-4 lg:contents">
            <div className="lg:col-span-2">
              <h4 className="mb-4 text-sm font-semibold text-white">
                {tk('footer.learning')}
              </h4>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <LocaleLink
                    href="/quizzes"
                    className="group inline-flex items-center gap-1 text-sm text-white/75 transition-colors hover:text-[#E3C565]"
                  >
                    {tk('nav.quizzes')}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </LocaleLink>
                </li>
                <li>
                  <LocaleLink
                    href="/materials"
                    className="group inline-flex items-center gap-1 text-sm text-white/75 transition-colors hover:text-[#E3C565]"
                  >
                    {tk('nav.materials')}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </LocaleLink>
                </li>
                <li>
                  <LocaleLink
                    href="/leaderboard"
                    className="group inline-flex items-center gap-1 text-sm text-white/75 transition-colors hover:text-[#E3C565]"
                  >
                    {tk('nav.leaderboard')}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </LocaleLink>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h4 className="mb-4 text-sm font-semibold text-white">
                {tk('footer.account')}
              </h4>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <LocaleLink
                    href="/login"
                    className="group inline-flex items-center gap-1 text-sm text-white/75 transition-colors hover:text-[#E3C565]"
                  >
                    {tk('nav.login')}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </LocaleLink>
                </li>
                <li>
                  <LocaleLink
                    href="/register"
                    className="group inline-flex items-center gap-1 text-sm text-white/75 transition-colors hover:text-[#E3C565]"
                  >
                    {tk('nav.register')}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </LocaleLink>
                </li>
                <li>
                  <LocaleLink
                    href="/profile"
                    className="group inline-flex items-center gap-1 text-sm text-white/75 transition-colors hover:text-[#E3C565]"
                  >
                    {tk('nav.profile')}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </LocaleLink>
                </li>
                {isAdmin && (
                  <li>
                    <LocaleLink
                      href="/admin"
                      className="group inline-flex items-center gap-1 text-sm text-white/75 transition-colors hover:text-[#E3C565]"
                    >
                      {tk('nav.admin')}
                      <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                    </LocaleLink>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="mb-4 text-sm font-semibold text-white">
              {tk('footer.contact')}
            </h4>
            <ul className="flex flex-col gap-3 text-sm text-white/75">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/20 bg-white/10 text-[#E3C565]">
                  <Mail className="h-3.5 w-3.5" />
                </span>
                <a
                  className="hover:text-[#E3C565] hover:underline"
                  href={`mailto:${getContactEmail()}`}
                >
                  {getContactEmail()}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/20 bg-white/10 text-[#E3C565]">
                  <Phone className="h-3.5 w-3.5" />
                </span>
                <a className="hover:text-[#E3C565] hover:underline" href="https://wa.me/34642087268" target="_blank" rel="noopener noreferrer">
                  WhatsApp: 642087268
                </a>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/20 bg-white/10 text-[#E3C565]">
                  <MessageCircle className="h-3.5 w-3.5" />
                </span>
                <a className="hover:text-[#E3C565] hover:underline" href="https://zalo.me/0377858814" target="_blank" rel="noopener noreferrer">
                  Zalo: 0377858814
                </a>
              </li>
            </ul>
          </div>
        </div>

        <nav
          className="mt-10 border-t border-white/15 pt-8"
          aria-label={tk('footer.legalNavAria')}
        >
          <ul className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 text-center text-xs text-white/70 sm:gap-x-2 sm:text-sm">
            <li>
              <LocaleLink href={APP_ROUTES.TERMS} className="px-1.5 hover:text-[#E3C565] hover:underline">
                {tk('footer.linkTerms')}
              </LocaleLink>
            </li>
            <li className="text-white/35" aria-hidden>
              ·
            </li>
            <li>
              <LocaleLink
                href={APP_ROUTES.SERVICE_POLICY}
                className="px-1.5 hover:text-[#E3C565] hover:underline"
              >
                {tk('footer.linkService')}
              </LocaleLink>
            </li>
            <li className="text-white/35" aria-hidden>
              ·
            </li>
            <li>
              <LocaleLink href={APP_ROUTES.FAQ} className="px-1.5 hover:text-[#E3C565] hover:underline">
                {tk('footer.linkFaq')}
              </LocaleLink>
            </li>
          </ul>
        </nav>

        <div className="mt-6 border-t border-white/15 pt-6 text-center">
          <p className="text-xs text-white/65 sm:text-sm">
            © 2026 <span className="font-medium text-[#E3C565]">Viet Autoescuela</span>.{' '}
            {tk('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
