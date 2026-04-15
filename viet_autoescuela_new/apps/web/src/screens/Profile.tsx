'use client';

import { BRAND_LOGO_IMAGE_SRC, Camera, Medal, Pencil } from '@/components/brand';
import { Footer, Navbar } from '@/components/layout';
import { LocaleLink } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { formatUserFacingApiError } from '@/lib/api/format-api-error';
import { updateMyAvatar, updateMyProfile } from '@/lib/api/auth';
import { getLeaderboard, getMyDashboard } from '@/lib/api/quiz';
import { resolveMediaUrl, uploadAvatarImage } from '@/lib/api/upload';
import type { DashboardResponse, LeaderboardUser } from '@/lib/api/types';
import { getStoredAuth, updateStoredAuthUser } from '@/lib/auth';
import { formatPremiumUntilNav, premiumVipLearnerBox, usePremiumToolbarState } from '@/features/premium';
import { isStrongPassword } from '@/lib/password-policy';
import {
  buildRankMotivation,
  ProfileQuizHistory,
  toStoredMediaPath,
  toUpdateErrorMessage,
} from '@/features/profile';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

const Profile = () => {
  const { tk, tkFill, lang } = useLanguage();
  const premiumToolbar = usePremiumToolbarState();
  const { toast } = useToast();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nameSaving, setNameSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        const [dashboardData, leaderboardData] = await Promise.all([
          getMyDashboard(lang),
          getLeaderboard(10),
        ]);
        if (!active) return;
        setDashboard(dashboardData);
        setLeaderboard(leaderboardData);
        updateStoredAuthUser({ full_name: dashboardData?.stats?.full_name || null });
        setDisplayName(dashboardData?.stats?.full_name || '');
        setError('');
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error ? formatUserFacingApiError(lang, err) : tk('profile.loadError')
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [lang, tk]);

  const rank = useMemo(() => {
    if (!dashboard?.stats?.id) return null;
    const idx = leaderboard.findIndex((row) => row.id === dashboard.stats.id);
    return idx >= 0 ? idx + 1 : null;
  }, [dashboard, leaderboard]);

  const rankMotivation = useMemo(() => {
    return buildRankMotivation(rank, lang);
  }, [rank, lang]);

  if (loading) {
    return (
      <div className="app-page flex min-h-screen flex-col bg-white">
        <Navbar />
        <div className="flex w-full flex-1 flex-col py-0">
          <div className="w-full flex-1 px-0">
            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
              <div className="h-32 animate-pulse bg-primary/10" />
              <div className="grid grid-cols-3 gap-3">
                <div className="h-14 animate-pulse bg-muted/80" />
                <div className="h-14 animate-pulse bg-muted/80" />
                <div className="h-14 animate-pulse bg-muted/80" />
              </div>
              <div className="h-40 animate-pulse bg-muted/60" />
            </div>
          </div>
        </div>
        <Footer className="mt-0" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="app-page flex min-h-screen flex-col bg-white">
        <Navbar />
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
          <div className="section-panel max-w-md text-center">
            <p className="text-sm font-medium text-destructive">
              {error || tk('profile.noData')}
            </p>
          </div>
        </div>
        <Footer className="mt-0" />
      </div>
    );
  }

  const stats = dashboard.stats;
  const storedEmail = getStoredAuth()?.user?.email || '-';
  const totalQuizzes = Number(stats.total_quizzes || 0);
  const totalQuestions = Number(stats.total_questions || 0);
  const hasLearningActivity = totalQuizzes > 0 || Number(stats.total_score || 0) > 0;
  const noAccuracyDataYet = totalQuizzes === 0 && totalQuestions === 0;

  const startEditName = () => {
    setIsEditingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setIsEditingName(true);
  };

  const cancelEditName = () => {
    setDisplayName(stats.full_name || '');
    setError('');
    setIsEditingName(false);
  };

  const startEditPassword = () => {
    setIsEditingName(false);
    setDisplayName(stats.full_name || '');
    setError('');
    setIsEditingPassword(true);
  };

  const cancelEditPassword = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setIsEditingPassword(false);
  };

  const handleAvatarFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      if (!file.type.startsWith('image/')) {
        throw new Error(tk('profile.pickImage'));
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error(tk('profile.imageMax5mb'));
      }

      setAvatarUploading(true);
      setError('');

      const uploaded = await uploadAvatarImage(file);
      const storedAvatarPath = toStoredMediaPath(uploaded);
      const updated = await updateMyAvatar(storedAvatarPath);
      const nextAvatarUrl = updated.user?.avatar_url || storedAvatarPath;

      setDashboard((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          stats: {
            ...prev.stats,
            avatar_url: nextAvatarUrl,
          },
        };
      });

      updateStoredAuthUser({ avatar_url: nextAvatarUrl });
    } catch (err) {
      setError(
        err instanceof Error ? formatUserFacingApiError(lang, err) : tk('profile.avatarUpdateFail')
      );
    } finally {
      setAvatarUploading(false);
      event.target.value = '';
    }
  };

  const handleNameUpdate = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isEditingName || nameSaving) {
      return;
    }

    const trimmedName = displayName.trim();

    if (!trimmedName) {
      setError(tk('profile.nameEmpty'));
      return;
    }

    try {
      setNameSaving(true);
      setError('');

      const result = await updateMyProfile({ full_name: trimmedName });

      const nextFullName = result.user?.full_name || trimmedName;

      setDashboard((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          stats: {
            ...prev.stats,
            full_name: nextFullName,
          },
        };
      });

      updateStoredAuthUser({ full_name: nextFullName });
      setDisplayName(nextFullName);
      setIsEditingName(false);

      toast({
        title: tk('profile.updatedTitle'),
        description: tk('profile.nameUpdated'),
      });
    } catch (err) {
      const message = toUpdateErrorMessage(err, tk('profile.updateFailed'), lang);
      setError(message);
      toast({
        title: tk('profile.cannotUpdate'),
        description: message,
        variant: 'destructive',
      });
    } finally {
      setNameSaving(false);
    }
  };

  const handlePasswordUpdate = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isEditingPassword || passwordSaving) {
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(tk('profile.fillPasswords'));
      return;
    }

    if (!isStrongPassword(newPassword)) {
      setError(tk('auth.passwordRulesHint'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(tk('profile.pwMismatch'));
      return;
    }

    try {
      setPasswordSaving(true);
      setError('');

      await updateMyProfile({
        current_password: currentPassword,
        new_password: newPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsEditingPassword(false);

      toast({
        title: tk('profile.updatedTitle'),
        description: tk('profile.pwChanged'),
      });
    } catch (err) {
      const message = toUpdateErrorMessage(err, tk('profile.updateFailed'), lang);
      setError(message);
      toast({
        title: tk('profile.cannotUpdate'),
        description: message,
        variant: 'destructive',
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="app-page flex min-h-screen flex-col bg-white">
      <Navbar />

      <div className="relative w-full overflow-hidden border-b-2 border-primary/15 bg-white">
        <div className="relative px-4 pb-8 pt-6 sm:px-6 md:px-10 md:pb-10 md:pt-8 lg:px-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
              <div
                className={`mx-auto h-[7.25rem] w-[7.25rem] shrink-0 rounded-full bg-gradient-to-br from-[#E3C565]/85 to-[#E3C565]/35 p-[3px] shadow-sm sm:mx-0 md:h-[8rem] md:w-[8rem] ${
                  rank != null && rank <= 3
                    ? 'ring-2 ring-[#E3C565]/80 shadow-[0_0_32px_rgba(227,197,101,0.38)]'
                    : ''
                }`}
              >
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-muted/50">
                  <img
                    src={stats.avatar_url ? resolveMediaUrl(stats.avatar_url) : BRAND_LOGO_IMAGE_SRC}
                    alt={stats.full_name || stats.username}
                    className={`h-full w-full ${stats.avatar_url ? 'object-cover' : 'object-contain bg-white p-4 md:p-5'}`}
                    onError={(event) => {
                      const target = event.currentTarget;
                      if (target.src !== BRAND_LOGO_IMAGE_SRC) {
                        target.src = BRAND_LOGO_IMAGE_SRC;
                        target.className = 'h-full w-full object-contain bg-white p-4 md:p-5';
                      }
                    }}
                  />
                </div>
              </div>

              <div className="min-w-0 flex-1 text-center sm:text-left">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary/55">
                  {tk('profile.learnerProfile')}
                </p>

                {isEditingName ? (
                  <form
                    className="mt-2 flex w-full max-w-lg flex-col gap-3 sm:flex-row sm:items-end"
                    onSubmit={handleNameUpdate}
                  >
                    <div className="min-w-0 flex-1 space-y-1.5 text-left">
                      <Label htmlFor="hero-display-name" className="sr-only">
                        {tk('profile.displayName')}
                      </Label>
                      <Input
                        id="hero-display-name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder={tk('profile.namePlaceholder')}
                        maxLength={100}
                        disabled={nameSaving || passwordSaving}
                        required
                        className="max-w-md"
                      />
                    </div>
                    <div className="flex shrink-0 justify-center gap-2 sm:justify-start">
                      <Button
                        type="submit"
                        size="sm"
                        className="brand-cta-primary"
                        disabled={nameSaving || passwordSaving}
                      >
                        {nameSaving ? tk('profile.saving') : tk('profile.save')}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={cancelEditName}
                        disabled={nameSaving}
                      >
                        {tk('profile.cancel')}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-1 flex items-center justify-center gap-1 sm:justify-start">
                    <h1 className="font-display min-w-0 max-w-[min(100%,28rem)] truncate text-2xl font-extrabold tracking-tight text-primary md:text-3xl">
                      {displayName || stats.full_name || stats.username}
                    </h1>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 text-primary hover:bg-primary/[0.08]"
                      onClick={startEditName}
                      disabled={nameSaving || passwordSaving || avatarUploading}
                      aria-label={tk('profile.editNameAria')}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <p className="mt-0.5 text-sm text-muted-foreground">@{stats.username}</p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <span className="rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1 text-xs font-semibold tabular-nums text-primary">
                    {rank
                      ? `${tk('profile.rankPrefix')} #${rank}`
                      : tk('profile.notRanked')}
                  </span>
                  {premiumToolbar.kind === 'learner' ? (
                    <span
                      className={`inline-flex max-w-full items-center gap-1.5 px-3 py-1.5 text-left text-[11px] font-bold tabular-nums leading-snug sm:text-xs ${premiumVipLearnerBox}`}
                      title={formatPremiumUntilNav(premiumToolbar.untilIso, lang)}
                    >
                      <Medal className="h-3.5 w-3.5 shrink-0 text-[#8a6a0a]" aria-hidden />
                      <span className="text-pretty">
                        {formatPremiumUntilNav(premiumToolbar.untilIso, lang)}
                      </span>
                    </span>
                  ) : null}
                  <label htmlFor="profile-avatar-upload">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5 border-primary/20 text-xs text-primary hover:bg-primary/[0.04]"
                      disabled={avatarUploading}
                      asChild
                    >
                      <span>
                        <Camera className="h-3.5 w-3.5 shrink-0 opacity-80" />
                        {avatarUploading
                          ? tk('profile.uploadingAvatar')
                          : tk('profile.changeAvatar')}
                      </span>
                    </Button>
                  </label>
                  <input
                    id="profile-avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarFileChange}
                    disabled={avatarUploading}
                  />
                </div>
              </div>
            </div>

            <div className="grid w-full grid-cols-3 gap-4 border-t border-dashed border-primary/20 pt-6 sm:gap-6 lg:ml-auto lg:max-w-md lg:border-l-2 lg:border-t-0 lg:border-solid lg:border-primary/15 lg:pl-8 lg:pt-0">
              {[
                {
                  value: Number(stats.total_score || 0).toFixed(1),
                  label: tk('profile.points'),
                },
                {
                  value: String(stats.total_quizzes || 0),
                  label: tk('profile.quizzes'),
                },
                {
                  value: `${Number(stats.average_percentage || 0).toFixed(1)}%`,
                  label: tk('profile.correctLabel'),
                },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="font-display text-lg font-black tabular-nums text-primary sm:text-xl">{s.value}</div>
                  <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-[11px]">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <div className="flex flex-col gap-3 rounded-2xl border-2 border-primary/25 bg-white/85 px-4 py-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex min-w-0 gap-3">
                <p className="text-sm leading-snug text-foreground/90">{rankMotivation}</p>
              </div>
              {!hasLearningActivity && (
                <Button
                  asChild
                  className="w-full shrink-0 brand-cta-primary sm:w-auto"
                >
                  <LocaleLink href="/quizzes">{tk('profile.takeQuizNow')}</LocaleLink>
                </Button>
              )}
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border-2 border-primary/22 bg-white/75 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-4">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-primary/80">
                  {tk('profile.todayFocus')}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {hasLearningActivity
                    ? tk('profile.todayMoreQuizzes')
                    : tk('profile.todayStart')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-1 flex-col bg-white pb-0 pt-0">
        <div className="w-full max-w-none">
          {error && (
            <div className="mb-4 px-4 sm:px-6 lg:px-8">
              <div className="border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                {error}
              </div>
            </div>
          )}

          <div className="w-full px-4 pb-10 pt-4 sm:px-6 sm:pb-12 sm:pt-5 lg:px-8">
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="mb-6 grid h-auto w-full grid-cols-3 gap-1 rounded-2xl border border-primary/15 bg-gradient-to-b from-primary/[0.06] to-primary/[0.02] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] sm:inline-flex sm:w-auto">
                <TabsTrigger
                  value="info"
                  className="rounded-xl border border-transparent bg-transparent py-2.5 text-[11px] font-semibold text-muted-foreground shadow-none transition-colors transition-shadow data-[state=active]:border-primary/25 data-[state=active]:bg-white/95 data-[state=active]:text-primary data-[state=active]:shadow-sm dark:data-[state=active]:bg-card/95 sm:px-5 sm:text-xs"
                >
                  {tk('profile.tabInfo')}
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="rounded-xl border border-transparent bg-transparent py-2.5 text-[11px] font-semibold text-muted-foreground shadow-none transition-colors transition-shadow data-[state=active]:border-primary/25 data-[state=active]:bg-white/95 data-[state=active]:text-primary data-[state=active]:shadow-sm dark:data-[state=active]:bg-card/95 sm:px-5 sm:text-xs"
                >
                  {tk('profile.tabHistory')}
                </TabsTrigger>
                <TabsTrigger
                  value="ranking"
                  className="rounded-xl border border-transparent bg-transparent py-2.5 text-[11px] font-semibold text-muted-foreground shadow-none transition-colors transition-shadow data-[state=active]:border-primary/25 data-[state=active]:bg-white/95 data-[state=active]:text-primary data-[state=active]:shadow-sm dark:data-[state=active]:bg-card/95 sm:px-5 sm:text-xs"
                >
                  {tk('profile.tabRanking')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="mt-0 outline-none">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="grid gap-10 rounded-2xl border-2 border-primary/18 bg-white/70 p-4 sm:p-5 lg:grid-cols-2 lg:gap-12 lg:p-6">
                    <div className="space-y-8">
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-muted-foreground">Username</span>{' '}
                          <span className="font-medium text-foreground">{stats.username}</span>
                        </p>
                        <p className="break-all">
                          <span className="text-muted-foreground">Email</span>{' '}
                          <span className="font-medium text-foreground">{storedEmail}</span>
                        </p>
                      </div>

                      <section className="border-t-2 border-primary/12 pt-8">
                        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                          <h3 className="font-display text-sm font-bold text-primary md:text-base">
                            {tk('profile.loginPassword')}
                          </h3>
                          {!isEditingPassword ? (
                            <Button
                              type="button"
                              size="sm"
                              className="brand-cta-primary h-9 shrink-0 px-4 font-semibold text-white"
                              onClick={startEditPassword}
                              disabled={nameSaving || passwordSaving}
                            >
                              {tk('profile.changePassword')}
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="shrink-0"
                              onClick={cancelEditPassword}
                              disabled={passwordSaving}
                            >
                              {tk('profile.cancel')}
                            </Button>
                          )}
                        </div>
                        {!isEditingPassword ? (
                          <p className="text-sm text-muted-foreground">
                            {tk('profile.passwordStoredHint')}
                          </p>
                        ) : (
                          <form className="space-y-3" onSubmit={handlePasswordUpdate}>
                            <div className="space-y-1.5">
                              <Label htmlFor="current-password">
                                {tk('profile.currentPassword')}
                              </Label>
                              <Input
                                id="current-password"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                                disabled={passwordSaving}
                                autoComplete="current-password"
                              />
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="space-y-1.5">
                                <Label htmlFor="new-password">
                                  {tk('profile.newPassword')}
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                  {tk('auth.passwordRulesHint')}
                                </p>
                                <Input
                                  id="new-password"
                                  type="password"
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  placeholder="••••••••"
                                  disabled={passwordSaving}
                                  autoComplete="new-password"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor="confirm-password">
                                  {tk('profile.confirmPassword')}
                                </Label>
                                <Input
                                  id="confirm-password"
                                  type="password"
                                  value={confirmPassword}
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  placeholder="••••••••"
                                  disabled={passwordSaving}
                                  autoComplete="new-password"
                                />
                              </div>
                            </div>
                            <Button
                              type="submit"
                              className="brand-cta-primary max-w-md rounded-xl font-semibold"
                              disabled={nameSaving || passwordSaving}
                            >
                              {passwordSaving
                                ? tk('profile.saving')
                                : tk('profile.saveNewPassword')}
                            </Button>
                          </form>
                        )}
                      </section>
                    </div>

                    <section className="border-t border-dashed border-primary/18 pt-8 lg:border-l-2 lg:border-t-0 lg:border-solid lg:border-primary/12 lg:pl-8 lg:pt-0">
                      <h3 className="mb-4 font-display text-sm font-bold text-primary md:text-base">
                        {tk('profile.studyStats')}
                      </h3>
                      {!hasLearningActivity && (
                        <div className="mb-4 rounded-xl border border-primary/15 bg-primary/[0.04] px-4 py-3 text-sm text-muted-foreground">
                          <p className="font-medium text-foreground/90">
                            {tk('profile.noAttemptsYet')}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed">
                            {tk('profile.noAttemptsHint')}
                          </p>
                          <Button asChild className="mt-3 brand-cta-primary" size="sm">
                            <LocaleLink href="/quizzes">
                              {tk('profile.takeQuizNow')}
                            </LocaleLink>
                          </Button>
                        </div>
                      )}
                      <div className="mb-4 grid grid-cols-2 gap-4">
                        {[
                          {
                            label: tk('profile.totalScore'),
                            value: Number(stats.total_score || 0).toFixed(1),
                          },
                          {
                            label: tk('profile.quizzes'),
                            value: stats.total_quizzes,
                          },
                          {
                            label: tk('profile.correctAnswers'),
                            value: `${stats.total_correct}/${stats.total_questions}`,
                          },
                          {
                            label: tk('profile.rankHash'),
                            value: rank ? `#${rank}` : '—',
                          },
                        ].map((item, i) => (
                          <div key={i} className="min-w-0">
                            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                              {item.label}
                            </div>
                            <div className="font-display text-lg font-bold tabular-nums text-primary">
                              {item.value}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-primary/15 pt-4">
                        <div className="mb-2 flex justify-between text-xs">
                          <span className="font-medium text-muted-foreground">
                            {tk('profile.accuracy')}
                          </span>
                          <span className="font-display font-bold text-primary">
                            {Number(stats.average_percentage || 0).toFixed(1)}%
                          </span>
                        </div>
                        {noAccuracyDataYet ? (
                          <p className="mb-2 text-[11px] leading-relaxed text-muted-foreground">
                            {tk('profile.noAccuracyHint')}
                          </p>
                        ) : null}
                        <Progress
                          value={Number(stats.average_percentage || 0)}
                          className="h-2.5 bg-primary/10"
                        />
                      </div>
                    </section>
                  </div>
                </motion.div>
              </TabsContent>

            <TabsContent value="history" className="mt-0 outline-none">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <ProfileQuizHistory
                  quizSummaries={dashboard.quiz_summaries}
                  fallbackHistory={dashboard.history || []}
                  lang={lang}
                  tk={tk}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="ranking" className="mt-0 outline-none">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="border-t border-primary/15 pt-6">
                  <h3 className="font-display text-sm font-bold text-primary md:text-base">
                    {tk('profile.yourPosition')}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {rank
                      ? `${tk('profile.rankHash')} #${rank}`
                      : tk('profile.noRankYet')}
                  </p>
                  <p className="mt-2 max-w-xl text-[11px] leading-relaxed text-muted-foreground">
                    {tk('profile.leaderboardHint')}
                  </p>
                  {!hasLearningActivity && leaderboard.length > 0 && (
                    <Button asChild variant="outline" size="sm" className="mt-3 border-primary/25">
                      <LocaleLink href="/quizzes">{tk('profile.takeQuizForBoard')}</LocaleLink>
                    </Button>
                  )}
                  <div className="mt-4 divide-y divide-primary/10">
                    {leaderboard.map((user, i) => {
                      const isMe = user.id === stats.id;
                      return (
                        <div
                          key={user.id}
                          className={`flex items-center gap-3 py-3.5 transition-colors first:pt-0 ${
                            isMe ? 'border-l-[3px] border-l-primary bg-primary/[0.04] pl-3' : ''
                          } ${i < 3 ? 'bg-primary/[0.02]' : ''}`}
                        >
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-xs font-bold tabular-nums ${
                              i === 0
                                ? 'border-2 border-[#E3C565]/80 bg-[#fff9e6] text-[#6b4a00]'
                                : i === 1
                                  ? 'border-2 border-primary/25 bg-primary/[0.08] text-primary'
                                  : i === 2
                                    ? 'border-2 border-amber-700/25 bg-amber-50 text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-100'
                                    : 'border border-primary/15 bg-muted/80 text-muted-foreground'
                            }`}
                          >
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-xs truncate">
                              {user.full_name}
                              {isMe && (
                                <span className="ml-1.5 rounded-md bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                                  {tk('profile.you')}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {user.total_quizzes} {tk('profile.quizUnit')}
                            </div>
                          </div>
                          <div className="font-display font-bold text-sm text-primary">
                            {Number(user.total_score || 0).toFixed(1)}
                          </div>
                        </div>
                      );
                    })}
                    {leaderboard.length === 0 && (
                      <div className="py-5 text-xs text-muted-foreground">
                        {tk('profile.noLeaderboard')}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <Footer className="mt-0" />
    </div>
  );
};

export default Profile;
