'use client';

import { LocaleLink } from '@/components/navigation';
import { APP_ROUTES } from '@/config/routes';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';
import { tKey } from '@viet/i18n';
import { BookOpen, FileText, Home, Medal, Trophy, User } from 'lucide-react';

const linkBase =
  'flex items-center gap-2.5 rounded-md border border-transparent px-2 py-2 text-sm font-medium text-foreground transition-colors hover:border-border hover:bg-muted/60';

export function MaterialStudySystemAside({ className }: { className?: string }) {
  const { lang } = useLanguage();

  const links: { href: string; label: string; icon: typeof Home }[] = [
    { href: APP_ROUTES.HOME, label: tKey(lang, 'nav.home'), icon: Home },
    { href: APP_ROUTES.MATERIALS, label: tKey(lang, 'nav.materials'), icon: FileText },
    { href: APP_ROUTES.QUIZZES, label: tKey(lang, 'nav.quizzes'), icon: BookOpen },
    { href: APP_ROUTES.LEADERBOARD, label: tKey(lang, 'nav.leaderboard'), icon: Trophy },
    { href: APP_ROUTES.PREMIUM, label: tKey(lang, 'nav.premium'), icon: Medal },
    { href: APP_ROUTES.PROFILE, label: tKey(lang, 'nav.profile'), icon: User },
  ];

  return (
    <nav
      className={cn(
        'rounded-sm border border-border bg-card p-4 shadow-sm',
        className
      )}
      aria-label={tKey(lang, 'materialsPage.postSidebar_systemTitle')}
    >
      <h2 className="mb-3 border-b border-border pb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {tKey(lang, 'materialsPage.postSidebar_systemTitle')}
      </h2>
      <ul className="space-y-0.5">
        {links.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <LocaleLink href={href} className={linkBase}>
              <Icon className="h-4 w-4 shrink-0 text-primary/80" aria-hidden />
              <span className="leading-snug">{label}</span>
            </LocaleLink>
          </li>
        ))}
      </ul>
      <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
        {tKey(lang, 'materialsPage.postSidebar_hint')}
      </p>
    </nav>
  );
}
