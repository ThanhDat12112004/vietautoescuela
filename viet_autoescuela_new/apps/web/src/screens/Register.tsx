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
import { getGoogleOAuthStartUrl, login, register } from '@/lib/api/auth';
import { isStrongPassword, isValidRegisterUsername } from '@/lib/password-policy';
import { saveAuth } from '@/lib/auth';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { useLocaleFromPath } from '@/hooks/useLocaleFromPath';
import { localePath } from '@/lib/i18n-routing';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { I18nKey } from '@viet/i18n';
import type { Language } from '@/lib/api/types';

type TkFn = (key: I18nKey) => string;

type RegisterField = 'fullName' | 'username' | 'email' | 'password' | 'passwordConfirm';

/** Lỗi API / server map về đúng ô; còn lại dùng `general` (banner trên cùng). */
const mapRegisterApiError = (
  error: unknown,
  lang: Language,
  tk: TkFn
): { field: RegisterField | 'general'; message: string } => {
  if (!(error instanceof Error) || !error.message) {
    return { field: 'general', message: tk('authForm.registerGenericError') };
  }

  const raw = error.message;
  const message = raw.toLowerCase();

  if (message.includes('email') && (message.includes('exist') || message.includes('duplicate'))) {
    return { field: 'email', message: tk('authForm.emailInUse') };
  }

  if (
    (message.includes('username') || message.includes('user name')) &&
    (message.includes('exist') || message.includes('duplicate'))
  ) {
    return { field: 'username', message: tk('authForm.usernameInUse') };
  }

  if (message.includes('password') && (message.includes('weak') || message.includes('short'))) {
    return { field: 'password', message: tk('authForm.weakPassword') };
  }

  if (message.includes('passwords do not match')) {
    return { field: 'passwordConfirm', message: tk('auth.passwordMismatch') };
  }

  if (message.includes('at least 8') || message.includes('at most 128')) {
    return { field: 'password', message: tk('auth.passwordRulesHint') };
  }

  if (message.includes('letter') && message.includes('number')) {
    return { field: 'password', message: tk('auth.passwordRulesHint') };
  }

  if (message.includes('username may only')) {
    return { field: 'username', message: tk('auth.registerUsernameHint') };
  }

  if (message.includes('username must be')) {
    return { field: 'username', message: tk('auth.registerUsernameHint') };
  }

  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
    return { field: 'general', message: tk('authForm.networkError') };
  }

  return { field: 'general', message: formatUserFacingApiError(lang, error) };
};

const fieldErrorClass = (hasError: boolean) =>
  hasError
    ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/25'
    : 'border-primary/20 focus-visible:border-primary/45 focus-visible:ring-primary/20';

const Register = () => {
  const { tk, lang } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const locale = useLocaleFromPath();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    fullName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<RegisterField, string>>>({});
  const [generalError, setGeneralError] = useState('');
  const googleOAuthConfigured = useGoogleOAuthStatus();

  const clearField = (key: RegisterField) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fullName = form.fullName.trim();
    const username = form.username.trim();
    const email = form.email.trim();
    const password = form.password;
    const passwordConfirm = form.passwordConfirm;
    setFieldErrors({});
    setGeneralError('');

    const missing: Partial<Record<RegisterField, string>> = {};
    if (!fullName) missing.fullName = tk('authForm.fillRegisterAll');
    if (!username) missing.username = tk('authForm.fillRegisterAll');
    if (!email) missing.email = tk('authForm.fillRegisterAll');
    if (!password) missing.password = tk('authForm.fillRegisterAll');
    if (!passwordConfirm) missing.passwordConfirm = tk('authForm.fillRegisterAll');
    if (Object.keys(missing).length > 0) {
      setFieldErrors(missing);
      return;
    }

    if (!isValidRegisterUsername(username)) {
      setFieldErrors({ username: tk('auth.registerUsernameHint') });
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setFieldErrors({ email: tk('authForm.invalidEmail') });
      return;
    }

    if (!isStrongPassword(password)) {
      setFieldErrors({ password: tk('auth.passwordRulesHint') });
      return;
    }

    if (password !== passwordConfirm) {
      setFieldErrors({ passwordConfirm: tk('auth.passwordMismatch') });
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        username,
        email,
        password,
        password_confirm: passwordConfirm,
        full_name: fullName || undefined,
      });
      const loginResult = await login({ email, password });
      saveAuth(loginResult.token, loginResult.user);
      window.dispatchEvent(new CustomEvent('auth-updated'));

      toast({
        title: tk('authForm.registerOkTitle'),
        description: tk('authForm.registerOkDesc'),
      });
      router.replace(localePath(locale, APP_ROUTES.HOME));
    } catch (error) {
      const mapped = mapRegisterApiError(error, lang, tk);
      if (mapped.field === 'general') {
        setGeneralError(mapped.message);
      } else {
        setFieldErrors({ [mapped.field]: mapped.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthSplitLayout>
      <div className="space-y-8">
        <header>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-primary">
            {tk('auth.registerTitle')}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {tk('auth.registerSubtitle')}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {generalError ? (
            <div className="rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive">
              {generalError}
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-foreground">
              {tk('auth.fullName')}
            </Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/50" />
              <Input
                id="fullName"
                name="name"
                autoComplete="name"
                placeholder={tk('authForm.nameExample')}
                className={`pl-10 transition-colors ${fieldErrorClass(Boolean(fieldErrors.fullName))}`}
                value={form.fullName}
                onChange={(e) => {
                  setForm({ ...form, fullName: e.target.value });
                  clearField('fullName');
                }}
                required
                aria-invalid={Boolean(fieldErrors.fullName)}
                aria-describedby={fieldErrors.fullName ? 'fullName-error' : undefined}
              />
            </div>
            {fieldErrors.fullName ? (
              <p id="fullName-error" className="text-sm font-medium text-destructive" role="alert">
                {fieldErrors.fullName}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="username" className="text-foreground">
              {tk('auth.username')}
            </Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/50" />
              <Input
                id="username"
                name="username"
                placeholder="username123"
                className={`pl-10 transition-colors ${fieldErrorClass(Boolean(fieldErrors.username))}`}
                value={form.username}
                onChange={(e) => {
                  setForm({ ...form, username: e.target.value });
                  clearField('username');
                }}
                autoComplete="username"
                required
                aria-invalid={Boolean(fieldErrors.username)}
                aria-describedby={
                  fieldErrors.username ? 'username-error' : 'username-hint'
                }
              />
            </div>
            {fieldErrors.username ? (
              <p id="username-error" className="text-sm font-medium text-destructive" role="alert">
                {fieldErrors.username}
              </p>
            ) : null}
            <p id="username-hint" className="text-xs text-muted-foreground">
              {tk('auth.registerUsernameHint')}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/50" />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                className={`pl-10 transition-colors ${fieldErrorClass(Boolean(fieldErrors.email))}`}
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  clearField('email');
                }}
                required
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              />
            </div>
            {fieldErrors.email ? (
              <p id="email-error" className="text-sm font-medium text-destructive" role="alert">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">
              {tk('auth.password')}
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/50" />
              <Input
                id="password"
                name="new-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`pl-10 pr-11 transition-colors ${fieldErrorClass(Boolean(fieldErrors.password))}`}
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  clearField('password');
                }}
                autoComplete="new-password"
                required
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={
                  fieldErrors.password ? 'password-error' : 'password-hint'
                }
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
            {fieldErrors.password ? (
              <p id="password-error" className="text-sm font-medium text-destructive" role="alert">
                {fieldErrors.password}
              </p>
            ) : null}
            <p id="password-hint" className="text-xs text-muted-foreground">
              {tk('auth.passwordRulesHint')}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="passwordConfirm" className="text-foreground">
              {tk('auth.confirmPassword')}
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/50" />
              <Input
                id="passwordConfirm"
                name="new-password-confirm"
                type={showPasswordConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                className={`pl-10 pr-11 transition-colors ${fieldErrorClass(Boolean(fieldErrors.passwordConfirm))}`}
                value={form.passwordConfirm}
                onChange={(e) => {
                  setForm({ ...form, passwordConfirm: e.target.value });
                  clearField('passwordConfirm');
                }}
                autoComplete="new-password"
                required
                aria-invalid={Boolean(fieldErrors.passwordConfirm)}
                aria-describedby={
                  fieldErrors.passwordConfirm ? 'passwordConfirm-error' : undefined
                }
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-primary/55 transition hover:bg-primary/[0.08] hover:text-primary"
                onClick={() => setShowPasswordConfirm((v) => !v)}
                aria-label={
                  showPasswordConfirm
                    ? tk('auth.hidePassword')
                    : tk('auth.showPassword')
                }
              >
                {showPasswordConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {fieldErrors.passwordConfirm ? (
              <p id="passwordConfirm-error" className="text-sm font-medium text-destructive" role="alert">
                {fieldErrors.passwordConfirm}
              </p>
            ) : null}
          </div>
          <Button
            type="submit"
            size="lg"
            className="brand-cta-primary mt-2 h-12 w-full rounded-xl font-semibold shadow-md transition hover:opacity-[0.96]"
          >
            {isSubmitting
              ? tk('auth.processing')
              : tk('auth.signUp')}
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
          {tk('auth.haveAccount')}{' '}
          <LocaleLink href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
            {tk('auth.loginTitle')}
          </LocaleLink>
        </p>
      </div>
    </AuthSplitLayout>
  );
};

export default Register;
