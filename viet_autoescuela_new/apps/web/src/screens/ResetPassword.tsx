'use client';

import { AuthSplitLayout } from '@/components/layout';
import { LocaleLink } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { useLocaleFromPath } from '@/hooks/useLocaleFromPath';
import { APP_ROUTES } from '@/config/routes';
import { formatUserFacingApiError } from '@/lib/api/format-api-error';
import { resetPassword } from '@/lib/api/auth';
import { isStrongPassword } from '@/lib/password-policy';
import { localePath } from '@/lib/i18n-routing';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

function ResetPasswordForm() {
  const { tk, lang } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const locale = useLocaleFromPath();
  const searchParams = useSearchParams();
  const token = searchParams.get('token')?.trim() || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!token) {
      setFormError(tk('authForm.genericError'));
      return;
    }

    if (!isStrongPassword(password)) {
      setFormError(tk('auth.passwordRulesHint'));
      return;
    }

    if (password !== confirm) {
      setFormError(tk('auth.passwordMismatch'));
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword({ token, new_password: password });
      toast({
        title: tk('auth.resetPasswordSuccess'),
      });
      router.replace(localePath(locale, APP_ROUTES.LOGIN));
    } catch (err) {
      setFormError(
        err instanceof Error ? formatUserFacingApiError(lang, err) : tk('authForm.genericError')
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">{tk('authForm.genericError')}</p>
        <LocaleLink href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
          ← {tk('auth.loginTitle')}
        </LocaleLink>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <div className="rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive">
          {formError}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="new-pass" className="text-foreground">
          {tk('auth.password')}
        </Label>
        <p className="text-xs text-muted-foreground">{tk('auth.passwordRulesHint')}</p>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/50" />
          <Input
            id="new-pass"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            className="border-primary/20 pl-10 pr-11 transition-colors focus-visible:border-primary/45 focus-visible:ring-primary/20"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-primary/55 transition hover:bg-primary/[0.08] hover:text-primary"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? tk('auth.hidePassword') : tk('auth.showPassword')}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-pass" className="text-foreground">
          {tk('auth.confirmPassword')}
        </Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/50" />
          <Input
            id="confirm-pass"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            className="border-primary/20 pl-10 transition-colors focus-visible:border-primary/45 focus-visible:ring-primary/20"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="brand-cta-primary h-12 w-full rounded-xl font-semibold shadow-md transition hover:opacity-[0.96]"
      >
        {submitting ? tk('auth.processing') : tk('auth.resetPasswordSubmit')}
      </Button>
    </form>
  );
}

const ResetPassword = () => {
  const { tk } = useLanguage();

  return (
    <AuthSplitLayout>
      <div className="space-y-8">
        <header>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-primary">
            {tk('auth.resetPasswordTitle')}
          </h1>
        </header>
        <ResetPasswordForm />
        <p className="text-center text-sm text-muted-foreground">
          <LocaleLink href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
            ← {tk('auth.loginTitle')}
          </LocaleLink>
        </p>
      </div>
    </AuthSplitLayout>
  );
};

export default ResetPassword;
