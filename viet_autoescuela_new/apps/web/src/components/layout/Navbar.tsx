import {
  BookOpen,
  BRAND_LOGO_IMAGE_SRC,
  BrandLogo,
  FileText,
  Home,
  LogOut,
  Menu,
  Medal,
  ShieldCheck,
  Trophy,
  User,
  X,
} from '@/components/brand';
import { LanguageDropdown } from './LanguageDropdown';
import './Navbar.css';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { logout } from '@/lib/api/auth';
import { resolveMediaUrl } from '@/lib/api/upload';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';
import { clearAuth, getStoredAuth, type AuthUser } from '@/lib/auth';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { PremiumNavbarBadge } from './PremiumNavbarBadge';
import { LocaleLink } from '@/components/navigation';
import { APP_ROUTES } from '@/config/routes';
import { useLocaleAwareSetLang } from '@/hooks/useLocaleAwareSetLang';
import { isRouteActive } from '@/lib/i18n-routing';
import { usePathname } from 'next/navigation';

function subscribeMediaLg(onChange: () => void) {
  if (typeof window === 'undefined') return () => {};
  const mq = window.matchMedia('(min-width: 1024px)');
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

function getMediaLgSnapshot() {
  return typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;
}

function getMediaLgServerSnapshot() {
  return false;
}

function useIsLg() {
  return useSyncExternalStore(subscribeMediaLg, getMediaLgSnapshot, getMediaLgServerSnapshot);
}

const Navbar = () => {
  const isLg = useIsLg();
  const { lang, tk } = useLanguage();
  const pathname = usePathname();
  const setLang = useLocaleAwareSetLang();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const syncAuth = useCallback(() => {
    const auth = getStoredAuth();
    setIsAuthenticated(Boolean(auth?.token));
    setAuthUser(auth?.user || null);
  }, []);

  useEffect(() => {
    const onStorageChange = () => syncAuth();
    const onAuthUpdated = () => syncAuth();
    window.addEventListener('storage', onStorageChange);
    window.addEventListener('auth-updated', onAuthUpdated);
    return () => {
      window.removeEventListener('storage', onStorageChange);
      window.removeEventListener('auth-updated', onAuthUpdated);
    };
  }, [syncAuth]);

  useEffect(() => {
    syncAuth();
    setAccountMenuOpen((open) => (open ? false : open));
  }, [pathname, syncAuth]);

  const onAccountOpenChange = useCallback((next: boolean) => {
    setAccountMenuOpen((prev) => (prev === next ? prev : next));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 170);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Ignore to keep logout UX resilient.
    } finally {
      clearAuth();
      setIsAuthenticated(false);
      setAuthUser(null);
      setMobileOpen(false);
      setAccountMenuOpen((open) => (open ? false : open));
    }
  };

  const userDisplayName = authUser?.full_name || authUser?.username || 'User';
  const userAvatarUrl = authUser?.avatar_url
    ? resolveMediaUrl(authUser.avatar_url)
    : BRAND_LOGO_IMAGE_SRC;
  const isAdmin = (authUser?.role || '').toLowerCase() === 'admin';

  const navItems = [
    { path: '/', label: tk('nav.home'), icon: Home },
    { path: '/quizzes', label: tk('nav.quizzes'), icon: BookOpen },
    { path: APP_ROUTES.MATERIALS, label: tk('nav.materials'), icon: FileText },
    { path: APP_ROUTES.PREMIUM, label: tk('nav.premium'), icon: Medal },
    { path: '/leaderboard', label: tk('nav.leaderboard'), icon: Trophy },
    ...(isAdmin ? [{ path: '/admin', label: tk('nav.admin'), icon: ShieldCheck }] : []),
  ];

  const desktopNavItems = [
    { path: '/', label: tk('nav.home'), icon: Home },
    { path: '/quizzes', label: tk('nav.quizzes'), icon: BookOpen },
    { path: APP_ROUTES.MATERIALS, label: tk('nav.materials'), icon: FileText },
    { path: APP_ROUTES.PREMIUM, label: tk('nav.premium'), icon: Medal },
    { path: '/leaderboard', label: tk('nav.leaderboard'), icon: Trophy },
  ];

  const renderDesktopMenuStrip = (compact = false) => (
    <div
      style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: `repeat(${desktopNavItems.length}, minmax(0, 1fr))`,
      }}
    >
      {desktopNavItems.map((item) => {
        const active = isRouteActive(pathname, item.path);

        return (
          <LocaleLink
            key={`${item.path}-${compact ? 'compact' : 'base'}`}
            href={item.path}
            className={`desktop-nav-tile${active ? ' active' : ''}`}
          >
            <span className="desktop-nav-tile-badge">
              <item.icon className="desktop-nav-tile-icon" />
            </span>
            <span className="desktop-nav-tile-label">{item.label}</span>
          </LocaleLink>
        );
      })}
    </div>
  );

  return (
    <>
      <nav
        className="navbar-root relative z-50"
        style={
          {
            background: scrolled ? 'rgba(255,250,250,0.96)' : 'rgba(255,252,252,0.88)',
            backdropFilter: 'blur(14px)',
            borderBottom: scrolled
              ? '1px solid rgba(107,15,26,0.2)'
              : '1px solid rgba(107,15,26,0.08)',
            transition: 'background 0.3s, border-color 0.3s, box-shadow 0.3s',
            boxShadow: scrolled ? '0 10px 28px rgba(107,15,26,0.14)' : 'none',
            '--nav-accent': '#8B1E2D',
          } as React.CSSProperties
        }
      >
        <div
          style={{
            width: '100%',
            padding: '0 clamp(12px, 2.8vw, 32px)',
            minHeight: 58,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <LocaleLink
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              textDecoration: 'none',
            }}
          >
            <span className="sm:hidden">
              <BrandLogo
                imageClassName="h-10"
                withText
                textClassName="text-[1rem] font-black tracking-tight"
              />
            </span>
            <span className="hidden sm:inline-flex">
              <BrandLogo
                imageClassName="h-12"
                withText
                textClassName="text-[1.45rem] font-black tracking-tight"
              />
            </span>
          </LocaleLink>

          <div className="hidden lg:block" />

          <div
            className="flex items-center gap-3 lg:gap-[10px]"
            style={{ marginLeft: 'auto', alignItems: 'center' }}
          >
            <LanguageDropdown
              lang={lang}
              setLang={setLang}
              align="end"
              compact={!isLg}
              bareTrigger
            />

            {isAuthenticated ? <PremiumNavbarBadge /> : null}

            <div className="hidden lg:flex" style={{ alignItems: 'center', gap: 10 }}>
            {isAuthenticated ? (
              <Popover modal={false} open={accountMenuOpen} onOpenChange={onAccountOpenChange}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label={tk('nav.account')}
                    aria-expanded={accountMenuOpen}
                    aria-haspopup="dialog"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 5,
                      padding: '4px 7px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, opacity 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.88';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    <div
                      className="avatar-ring"
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        padding: 2,
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          background: '#fff5f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img
                          src={userAvatarUrl}
                          alt={userDisplayName}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: authUser?.avatar_url ? 'cover' : 'contain',
                            padding: authUser?.avatar_url ? 0 : 3,
                            borderRadius: '50%',
                          }}
                        />
                      </div>
                    </div>
                    <span
                      style={{
                        maxWidth: 126,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#2f171b',
                        lineHeight: 1.1,
                      }}
                    >
                      {userDisplayName}
                    </span>
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  align="end"
                  sideOffset={8}
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  onCloseAutoFocus={(e) => e.preventDefault()}
                  className="w-[176px] border border-[rgba(107,15,26,0.2)] bg-[rgba(255,252,252,0.98)] p-1.5 shadow-[0_16px_48px_rgba(83,24,32,0.16)]"
                >
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: '#8B1E2D',
                      padding: '6px 10px 4px',
                    }}
                  >
                    {tk('nav.account')}
                  </p>
                  <div
                    className="dd-item-sep"
                    style={{ background: 'rgba(107,15,26,0.12)', margin: '4px 0', height: 1 }}
                  />
                  {isAdmin && (
                    <LocaleLink
                      href="/admin"
                      className="dd-item outline-none"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 10px',
                        borderRadius: 8,
                        fontSize: 13.5,
                        color: '#3f262b',
                        textDecoration: 'none',
                        cursor: 'pointer',
                      }}
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      <ShieldCheck style={{ width: 14, height: 14, color: '#8B1E2D' }} />
                      {tk('nav.admin')}
                    </LocaleLink>
                  )}
                  <LocaleLink
                    href="/profile"
                    className="dd-item outline-none"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 10px',
                      borderRadius: 8,
                      fontSize: 13.5,
                      color: '#3f262b',
                      textDecoration: 'none',
                      cursor: 'pointer',
                    }}
                    onClick={() => setAccountMenuOpen(false)}
                  >
                    <User style={{ width: 14, height: 14, color: '#8B1E2D' }} />
                    {tk('nav.profile')}
                  </LocaleLink>
                  <div
                    className="dd-item-sep"
                    style={{ background: 'rgba(107,15,26,0.12)', margin: '4px 0', height: 1 }}
                  />
                  <button
                    type="button"
                    className="dd-item w-full border-0 bg-transparent text-left font-inherit outline-none"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 10px',
                      borderRadius: 8,
                      fontSize: 13.5,
                      color: '#8B1E2D',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setAccountMenuOpen(false);
                      void handleLogout();
                    }}
                  >
                    <LogOut style={{ width: 14, height: 14 }} />
                    {tk('nav.logout')}
                  </button>
                </PopoverContent>
              </Popover>
            ) : (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <LocaleLink href="/login" style={{ textDecoration: 'none' }}>
                  <button
                    style={{
                      padding: '10px 18px',
                      borderRadius: 9,
                      border: '1px solid rgba(107,15,26,0.35)',
                      background: 'transparent',
                      color: '#6d434a',
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#8B1E2D';
                      e.currentTarget.style.color = '#8B1E2D';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(107,15,26,0.35)';
                      e.currentTarget.style.color = '#6d434a';
                    }}
                  >
                    {tk('nav.login')}
                  </button>
                </LocaleLink>
                <LocaleLink href="/register" style={{ textDecoration: 'none' }}>
                  <button
                    style={{
                      padding: '10px 18px',
                      borderRadius: 9,
                      border: '1px solid #8B1E2D',
                      background: 'linear-gradient(135deg, #8B1E2D 0%, #9B1B30 100%)',
                      color: '#fff6f7',
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontFamily: 'inherit',
                      letterSpacing: '0.01em',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.88';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    {tk('nav.register')}
                  </button>
                </LocaleLink>
              </div>
            )}
            </div>

            <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                border: '1px solid rgba(107,15,26,0.28)',
                background: 'rgba(107,15,26,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#71444b',
              }}
            >
              {mobileOpen ? (
                <X style={{ width: 18, height: 18 }} />
              ) : (
                <Menu style={{ width: 18, height: 18 }} />
              )}
            </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                overflow: 'hidden',
                borderTop: '1px solid rgba(107,15,26,0.14)',
                background: 'rgba(255,252,252,0.98)',
              }}
              className="lg:hidden"
            >
              <div style={{ padding: '12px 20px 20px' }}>
                {isAuthenticated && (
                  <LocaleLink
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1px solid rgba(107,15,26,0.2)',
                      background: 'rgba(107,15,26,0.05)',
                      textDecoration: 'none',
                      marginBottom: 12,
                    }}
                  >
                    <div
                      className="avatar-ring"
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        padding: 2,
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          background: '#fff5f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img
                          src={userAvatarUrl}
                          alt={userDisplayName}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: authUser?.avatar_url ? 'cover' : 'contain',
                            padding: authUser?.avatar_url ? 0 : 3,
                            borderRadius: '50%',
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 600, color: '#2f171b', margin: 0 }}>
                        {userDisplayName}
                      </p>
                      <p style={{ fontSize: 13.5, color: '#8B1E2D', margin: 0, marginTop: 1 }}>
                        {tk('nav.viewProfile')}
                      </p>
                    </div>
                  </LocaleLink>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {navItems.map((item) => {
                    const active = isRouteActive(pathname, item.path);
                    return (
                      <LocaleLink
                        key={item.path}
                        href={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={`mobile-nav-item${active ? ' active' : ''}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '9px 12px',
                          borderRadius: 10,
                          borderLeft: active ? '3px solid #8B1E2D' : '3px solid transparent',
                          background: active ? 'rgba(107,15,26,0.1)' : 'transparent',
                          color: active ? '#8B1E2D' : '#6f4a50',
                          textDecoration: 'none',
                          fontSize: 14,
                          fontWeight: active ? 600 : 500,
                        }}
                      >
                        <item.icon style={{ width: 15, height: 15, flexShrink: 0 }} />
                        {item.label}
                      </LocaleLink>
                    );
                  })}
                </div>

                <div
                  style={{
                    marginTop: 14,
                    paddingTop: 14,
                    borderTop: '1px solid rgba(107,15,26,0.14)',
                    display: 'flex',
                    gap: 10,
                  }}
                >
                  {isAuthenticated ? (
                    <button
                      onClick={handleLogout}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: 10,
                        border: '1px solid rgba(107,15,26,0.28)',
                        background: 'rgba(107,15,26,0.08)',
                        color: '#8B1E2D',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 7,
                        fontFamily: 'inherit',
                      }}
                    >
                      <LogOut style={{ width: 15, height: 15 }} />
                      {tk('nav.logout')}
                    </button>
                  ) : (
                    <>
                      <LocaleLink
                        href="/login"
                        style={{ flex: 1, textDecoration: 'none' }}
                        onClick={() => setMobileOpen(false)}
                      >
                        <button
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: 10,
                            border: '1px solid rgba(107,15,26,0.3)',
                            background: 'transparent',
                            color: '#6b434a',
                            fontSize: 15,
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                          }}
                        >
                          {tk('nav.login')}
                        </button>
                      </LocaleLink>
                      <LocaleLink
                        href="/register"
                        style={{ flex: 1, textDecoration: 'none' }}
                        onClick={() => setMobileOpen(false)}
                      >
                        <button
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: 10,
                            border: 'none',
                            background: 'linear-gradient(135deg, #8B1E2D 0%, #9B1B30 100%)',
                            color: '#fff6f7',
                            fontSize: 15,
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                          }}
                        >
                          {tk('nav.register')}
                        </button>
                      </LocaleLink>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <div className="desktop-nav-strip desktop-nav-strip--base w-full min-w-0">
        {renderDesktopMenuStrip(false)}
      </div>

      <div
        className={`desktop-nav-strip desktop-nav-strip--sticky compact w-full min-w-0${scrolled ? ' visible' : ''}`}
      >
        {renderDesktopMenuStrip(true)}
      </div>
    </>
  );
};

export default Navbar;
