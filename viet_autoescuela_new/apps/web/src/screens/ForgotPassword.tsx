'use client';

import { AuthSplitLayout } from '@/components/layout';
import { LocaleLink } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { useLocaleFromPath } from '@/hooks/useLocaleFromPath';
import { forgotPassword } from '@/lib/api/auth';
import { Mail } from 'lucide-react';
import { useState } from 'react';

function apiLocale(l: string): 'vi' | 'es' | 'en' {
  if (l === 'es' || l === 'en') return l;
  return 'vi';
}

const ForgotPassword = () => {
  const { tk } = useLanguage();
  const { toast } = useToast();
  const locale = useLocaleFromPath();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      await forgotPassword({ email: trimmed, locale: apiLocale(locale) });
      setDone(true);
      toast({
        title: tk('auth.forgotPasswordDone'),
        description: tk('auth.forgotPasswordCheckEmail'),
      });
    } catch (err) {
      const raw = err instanceof Error ? err.message.toLowerCase() : '';
      if (raw.includes('network') || raw.includes('fetch') || raw.includes('timeout')) {
        toast({
          variant: 'destructive',
          title: tk('authForm.networkError'),
        });
        return;
      }
      setDone(true);
      toast({
        title: tk('auth.forgotPasswordDone'),
        description: tk('auth.forgotPasswordCheckEmail'),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthSplitLayout>
      <div className="space-y-8">
        <header>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-primary">
            {tk('auth.forgotPasswordTitle')}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{tk('auth.forgotPasswordHint')}</p>
        </header>

        {done ? (
          <p className="rounded-xl border border-primary/15 bg-primary/[0.04] px-4 py-3 text-sm text-foreground">
            {tk('auth.forgotPasswordCheckEmail')}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email" className="text-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/50" />
                <Input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@example.com"
                  className="border-primary/20 pl-10 transition-colors focus-visible:border-primary/45 focus-visible:ring-primary/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="brand-cta-primary h-12 w-full rounded-xl font-semibold shadow-md transition hover:opacity-[0.96]"
            >
              {submitting ? tk('auth.processing') : tk('auth.forgotPasswordSubmit')}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground">
          <LocaleLink href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
            ← {tk('auth.loginTitle')}
          </LocaleLink>
        </p>
      </div>
    </AuthSplitLayout>
  );
};

export default ForgotPassword;
