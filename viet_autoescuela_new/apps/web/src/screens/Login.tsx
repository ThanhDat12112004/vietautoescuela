'use client';

import { AuthSplitLayout } from '@/components/layout';
import { GoogleIcon } from '@/components/GoogleIcon';
import { LocaleLink } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { APP_ROUTES } from '@/config/routes';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { formatUserFacingApiError } from '@/lib/api/format-api-error';
import { useGoogleOAuthStatus } from '@/hooks/useGoogleOAuthStatus';
import { getGoogleOAuthStartUrl, login } from '@/lib/api/auth';
import { saveAuth } from '@/lib/auth';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { useLocaleFromPath } from '@/hooks/useLocaleFromPath';
import { localePath, stripLocalePrefix } from '@/lib/i18n-routing';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import type { I18nKey } from '@viet/i18n';
import type { Language } from '@/lib/api/types';

type TkFn = (key: I18nKey) => string;

const getLoginErrorMessage = (error: unknown, lang: Language, tk: TkFn) => {
  if (!(error instanceof Error) || !error.message) {
    return tk('authForm.genericError');
  }

  const raw = error.message;
  const message = raw.toLowerCase();

  if (message.includes('google sign-in')) {
    return tk('auth.useGoogleInstead');
  }

  if (
    message.includes('invalid') ||
    message.includes('unauthorized') ||
    message.includes('incorrect') ||
    message.includes('password')
  ) {
    return tk('authForm.badCredentials');
  }

  if (message.includes('already logged in on another device')) {
    return tk('authForm.otherDevice');
  }

  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
    return tk('authForm.networkError');
  }

  return formatUserFacingApiError(lang, error);
};

const Login = () => {
  const { tk, lang } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocaleFromPath();
  const fromParam = searchParams.get('from');
  const redirectTo =
    typeof fromParam === 'string' &&
    fromParam.startsWith('/') &&
    !fromParam.startsWith('//')
      ? fromParam
      : null;
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const googleOAuthConfigured = useGoogleOAuthStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const idValue = loginId.trim();
    const passwordValue = password.trim();
    setFormError('');

    if (!idValue || !passwordValue) {
      setFormError(tk('auth.fillLoginFields'));
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login({ email: idValue, password: passwordValue });
      saveAuth(result.token, result.user);
      window.dispatchEvent(new CustomEvent('auth-updated'));
      toast({
        title: tk('authForm.signedInTitle'),
        description: tk('authForm.welcomeBack'),
      });
      const safeTarget =
        redirectTo &&
        stripLocalePrefix(redirectTo) !== APP_ROUTES.LOGIN &&
        redirectTo.startsWith('/') &&
        !redirectTo.startsWith('//')
          ? redirectTo
          : localePath(locale, APP_ROUTES.HOME);
      router.replace(safeTarget);
    } catch (error) {
      setFormError(getLoginErrorMessage(error, lang, tk));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthSplitLayout>
      <div className="space-y-8">
        <header>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-primary">
            {tk('auth.loginTitle')}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {tk('auth.loginSubtitle')}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && (
            <div className="rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive">
              {formError}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="login-id" className="text-foreground">
              {tk('auth.loginIdentifierLabel')}
            </Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/50" />
              <Input
                id="login-id"
                type="text"
                autoComplete="username"
                placeholder={tk('auth.loginIdentifierPlaceholder')}
                className="border-primary/20 pl-10 transition-colors focus-visible:border-primary/45 focus-visible:ring-primary/20"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">
              {tk('auth.password')}
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/50" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className="border-primary/20 pl-10 pr-11 transition-colors focus-visible:border-primary/45 focus-visible:ring-primary/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-primary/55 transition hover:bg-primary/[0.08] hover:text-primary"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={
                  showPassword
                    ? tk('auth.hidePassword')
                    : tk('auth.showPassword')
                }
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <LocaleLink
              href={APP_ROUTES.FORGOT_PASSWORD}
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              {tk('auth.forgotPasswordLink')}
            </LocaleLink>
          </div>
          <Button
            type="submit"
            size="lg"
            className="brand-cta-primary h-12 w-full rounded-xl font-semibold shadow-md transition hover:opacity-[0.96]"
          >
            {isSubmitting
              ? tk('auth.processing')
              : tk('auth.loginTitle')}
          </Button>
        </form>

        {googleOAuthConfigured === true ? (
          <>
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Google</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-12 w-full rounded-xl border-primary/25 font-semibold"
              onClick={() => {
                window.location.href = getGoogleOAuthStartUrl(locale);
              }}
            >
              <GoogleIcon className="mr-2 h-5 w-5" />
              {tk('auth.continueWithGoogle')}
            </Button>
          </>
        ) : googleOAuthConfigured === false ? (
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            {tk('auth.googleSignInSetupHint')}
          </p>
        ) : null}

        <p className="text-center text-sm text-muted-foreground">
          {tk('auth.noAccount')}{' '}
          <LocaleLink href="/register" className="font-semibold text-primary underline-offset-4 hover:underline">
            {tk('auth.registerNow')}
          </LocaleLink>
        </p>
      </div>
    </AuthSplitLayout>
  );
};

export default Login;
