'use client';

import { ArrowRight, Target } from '@/components/brand';
import { Footer, Navbar } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  fadeUp,
  heroPrimaryCtaButtonClass,
  heroSecondaryGlassCtaButtonClass,
  indexCardOpenChipClass,
  indexFeaturedQuizImageFrameClass,
  indexFeaturedQuizImageVignetteClass,
  indexMaterialsOpenButtonClass,
  indexPaleImageFrameClass,
  indexViewAllButtonClass,
  useIndexScreenModel,
} from '@/features/index';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { FileText, Play } from 'lucide-react';
import { LocaleLink } from '@/components/navigation';
import { APP_ROUTES } from '@/config/routes';
import { getStoredAuth, userHasPremium } from '@/lib/auth';
import { isPremiumContentFlag } from '@/lib/premium-content-flag';
import { useEffect, useMemo, useState } from 'react';

const Home = () => {
  const { tk, tkFill, lang } = useLanguage();
  const {
    quizzes,
    subjects,
    quizTypeCatalog,
    homeSummary,
    isLoadingHome,
    homeDataFetchFailed,
    homeDataRefetchBusy,
    refetchHomeData,
    subjectsLoading,
    materialCountsQuery,
    homeMaterialFilesTotal,
    isAuthenticated,
    statsScrollRef,
    quizTypes,
    primaryQuizType,
    formatCount,
    formatQuizType,
    getTopicDescriptionByType,
    primaryTypeQuizzes,
    primaryTypeDescription,
    primaryTypeQuestionTotal,
    quickStats,
  } = useIndexScreenModel(lang, tk);

  const [premiumOk, setPremiumOk] = useState(() =>
    userHasPremium(getStoredAuth()?.user)
  );
  useEffect(() => {
    const sync = () =>
      setPremiumOk(userHasPremium(getStoredAuth()?.user));
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    window.addEventListener('auth-updated', sync as EventListener);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
      window.removeEventListener('auth-updated', sync as EventListener);
    };
  }, []);

  const materialCountBySubjectId = useMemo(() => {
    const rows = materialCountsQuery.data;
    if (rows === undefined) return null;
    return new Map(rows.map((r) => [r.subject_id, Number(r.total ?? 0)]));
  }, [materialCountsQuery.data]);

  return (
    <div className="app-page min-h-screen flex flex-col bg-background">
      <Navbar />

      {!isLoadingHome && homeDataFetchFailed && (
        <div
          className="relative z-20 border-b border-primary/20 bg-[linear-gradient(180deg,rgba(255,250,251,0.98)_0%,rgba(252,236,241,0.92)_100%)] px-4 py-3 shadow-[0_4px_18px_rgba(107,15,26,0.08)] sm:px-6"
          role="alert"
        >
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:gap-4">
            <p className="text-sm font-semibold leading-snug text-[#5a1428] sm:flex-1 sm:text-left sm:text-[0.9375rem]">
              {tk('home.fetchError')}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 border-primary/35 text-primary hover:bg-primary/[0.06]"
              disabled={homeDataRefetchBusy}
              onClick={refetchHomeData}
            >
              {homeDataRefetchBusy
                ? tk('home.loadingEllipsis')
                : tk('common.retry')}
            </Button>
          </div>
        </div>
      )}

      {/* Hero Section - Professional & Trustworthy */}
      <section
        className="relative overflow-visible pt-2 sm:pt-4 md:pt-5 lg:pt-8 pb-8 sm:pb-9 md:pb-10 lg:pb-11 xl:pb-12"
        style={{
          backgroundImage: "url('/brand/hero.png')",
          backgroundColor: '#2f050b',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.34)_0%,rgba(0,0,0,0.26)_58%,rgba(0,0,0,0.3)_100%)]"
        />

        <div
          className={cn(
            'relative z-10 mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-10',
            lang === 'vi' ? 'max-w-6xl' : 'max-w-[min(100%,92rem)]'
          )}
        >
          <div
            className={cn(
              'mx-auto w-full',
              lang === 'vi' ? 'max-w-5xl' : 'max-w-full'
            )}
          >
            {/* Hero content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <p
                className={cn(
                  'mb-1 inline-flex max-w-[min(100%,52rem)] items-center justify-center rounded-full border border-amber-400/45 bg-black/35 px-3.5 py-1.5 font-bold uppercase text-amber-200 [text-shadow:0_1px_3px_rgba(0,0,0,0.55)] shadow-[0_4px_20px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:mb-1.5 sm:px-4 sm:py-1.5 sm:tracking-[0.16em]',
                  lang === 'es'
                    ? 'text-[11px] tracking-[0.1em] sm:text-[12.5px] sm:tracking-[0.12em] md:text-[13px]'
                    : 'text-[12px] tracking-[0.14em] sm:text-[13px] sm:tracking-[0.16em] md:text-[13.5px]'
                )}
              >
                {tk('home.badgeLine')}
              </p>
              {/* Main heading — gradient trắng→vàng + nhấn vàng Tây Ban Nha */}
              <h1
                className={cn(
                  'mx-auto mb-2 py-0.5 font-display font-black tracking-tight sm:mb-2.5 sm:py-1 md:py-1.5 lg:py-2',
                  lang === 'vi'
                    ? 'max-w-[21ch] text-[1.46rem] leading-[1.43] sm:max-w-[18ch] sm:text-3xl sm:leading-[1.42] md:text-4xl md:leading-[1.38] lg:text-6xl lg:leading-[1.32] xl:text-7xl xl:leading-[1.28]'
                    : 'w-full max-w-none text-balance text-[1.52rem] leading-[1.16] sm:text-[2.05rem] sm:leading-[1.12] md:text-5xl md:leading-[1.08] lg:text-6xl lg:leading-[1.05] xl:text-7xl xl:leading-[1.02]'
                )}
              >
                <span
                  className="inline bg-gradient-to-r from-white via-[#fffef8] to-[#ffe082] bg-clip-text text-transparent [filter:drop-shadow(0_3px_18px_rgba(0,0,0,0.42))]"
                  style={{ WebkitBackgroundClip: 'text' }}
                >
                  {tk('home.heroTitle')}
                </span>
              </h1>

              {/* Subtitle */}
              <p
                className={cn(
                  'hero-subtitle-readable mx-auto mb-4 mt-0 leading-relaxed sm:mb-5 sm:mt-0',
                  lang === 'vi'
                    ? 'w-full max-w-none text-balance text-[14px] sm:text-base md:text-lg lg:text-2xl'
                    : 'max-w-3xl sm:max-w-4xl md:max-w-5xl lg:max-w-6xl text-[15px] sm:text-base md:text-lg lg:text-2xl'
                )}
              >
                {tk('home.heroSubtitle')}
              </p>

              {/* CTA — primary gradient + glass secondary (hero đỏ đậm) */}
              <div className="mx-auto flex max-w-xl flex-col items-stretch gap-2 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-2.5">
                <LocaleLink href="/quizzes" className="inline-flex sm:min-w-0">
                  <Button variant="ghost" size="lg" className={heroPrimaryCtaButtonClass}>
                    <Play className="shrink-0" strokeWidth={2.25} aria-hidden />
                    {tk('home.startPractice')}
                  </Button>
                </LocaleLink>
                {isAuthenticated ? (
                  <LocaleLink href="/materials" className="inline-flex sm:min-w-0">
                    <Button size="lg" variant="secondary" className={heroSecondaryGlassCtaButtonClass}>
                      <FileText className="shrink-0 opacity-95" aria-hidden />
                      {tk('home.studyMaterials')}
                    </Button>
                  </LocaleLink>
                ) : null}
              </div>
              <p
                className={cn(
                  'mx-auto mt-3 max-w-3xl px-3 py-1 text-center font-semibold leading-snug text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.65),0_0_12px_rgba(0,0,0,0.35)] sm:mt-3.5 sm:px-4 sm:leading-relaxed md:max-w-4xl',
                  lang === 'vi'
                    ? 'text-[13px] sm:text-sm'
                    : 'text-[12.5px] sm:text-sm md:text-[0.9375rem]'
                )}
              >
                {tk('home.heroFootnote')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section - Professional */}
      <section className="relative w-full border-t border-primary/20 bg-[#f2f4f7] pt-0 pb-2 sm:pb-3 lg:pb-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={1}
          className="w-full"
        >
          <div className="w-full border border-[#d6dce3] bg-[#eceff3] py-1.5 shadow-[0_10px_24px_rgba(18,22,32,0.08)] sm:py-2 lg:py-3">
            <div
              ref={statsScrollRef}
              className="flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden pb-1 scrollbar-hide lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0"
              style={{ touchAction: 'pan-x', overscrollBehaviorX: 'contain' }}
            >
              {quickStats.map((item, i) => (
                <motion.div
                  key={item.label}
                  custom={i + 1}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className={`relative min-w-[50%] snap-start bg-[#f7f8fa] px-2.5 pt-0.5 pb-1.5 text-center first:rounded-none last:rounded-none md:min-w-[33.333333%] lg:min-w-0 lg:px-6 lg:py-3 xl:px-7 ${
                    i < quickStats.length - 1 ? 'border-r border-[#d2d8df]' : ''
                  }`}
                >
                  <item.icon className="mx-auto mb-1.5 h-4 w-4 text-black/80 sm:h-6 sm:w-6 lg:mb-2 lg:h-7 lg:w-7" />
                  <p className="mb-1 text-[1.75rem] font-black text-black sm:text-4xl lg:text-[2.75rem] xl:text-[3rem]">
                    {item.value}
                  </p>
                  <p className="text-[13px] font-semibold text-black/90 sm:text-sm lg:text-[1.06rem]">
                    {item.label}
                  </p>
                  <p className="mt-0 text-[11px] leading-snug text-black/70 sm:text-xs lg:mt-0.5 lg:text-[0.93rem]">
                    {item.hint}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Quiz Types Section - warm blush band (distinct from materials below) */}
      <section className="relative bg-[linear-gradient(180deg,rgba(255,251,252,1)_0%,rgba(254,242,247,0.97)_38%,rgba(252,246,249,0.99)_100%)] pt-5 pb-14 sm:pt-6 sm:pb-16 lg:pt-8 lg:pb-20">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="mb-7 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start"
          >
            <div className="max-w-2xl md:max-w-3xl">
              <span className="inline-flex rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary sm:px-3 sm:py-1 sm:tracking-[0.16em] md:text-sm">
                {tk('home.sectionBadge')}
              </span>
              <h2 className="font-display text-2xl font-bold leading-tight text-foreground sm:text-3xl md:text-4xl md:leading-tight lg:text-[2.35rem]">
                {tk('home.quizzesByGoal')}
              </h2>
              <p className="mt-2 max-w-xl text-base font-medium leading-relaxed text-[#4a3038] sm:mt-3 md:text-lg lg:max-w-2xl lg:text-xl">
                {tk('home.quizzesByGoalDesc')}
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 lg:items-end">
              <LocaleLink href="/quizzes" className="inline-flex">
                <Button className={cn(indexViewAllButtonClass)}>
                  {tk('home.viewAllQuizzes')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </LocaleLink>
              {!isLoadingHome ? (
                <p className="inline-flex max-w-full flex-wrap items-center gap-x-1 rounded-lg border border-primary/25 bg-primary/10 px-3.5 py-2 text-center text-sm font-bold leading-snug text-primary shadow-sm md:text-[0.9375rem] lg:text-right">
                  {homeDataFetchFailed
                    ? tkFill('home.quizChipError', {
                        topics: formatCount(quizTypes.length),
                      })
                    : tkFill('home.quizChipFull', {
                        topics: formatCount(quizTypes.length),
                        quizzes: formatCount(quizzes.length),
                      })}
                </p>
              ) : null}
            </div>
          </motion.div>

          {quizTypes.length ? (
            <div className="grid gap-4 sm:gap-5 lg:min-h-[200px] lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] lg:items-start lg:gap-4">
              {/* Featured Quiz Type - Large Card */}
              <motion.div
                custom={1}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="h-full"
              >
                <LocaleLink
                  href={`/quizzes?type=${encodeURIComponent(primaryQuizType || '')}`}
                  className="block h-full min-h-0"
                >
                  <Card className="group h-full min-h-0 overflow-hidden border border-brand-cta-end/25 bg-[linear-gradient(180deg,rgba(255,252,253,0.99)_0%,rgba(255,242,246,0.95)_100%)] shadow-[0_14px_34px_rgba(29,8,15,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(29,8,15,0.3)]">
                    <div className="grid h-full min-h-[280px] grid-rows-[minmax(0,1fr)_auto] sm:min-h-[320px] md:min-h-[340px] lg:min-h-[360px]">
                      <div className="relative min-h-[168px] overflow-hidden sm:min-h-[220px] md:min-h-[240px] lg:min-h-[260px]">
                        <div
                          className={cn(
                            'absolute inset-0 flex items-center justify-center p-2.5 sm:p-4 md:p-5',
                            indexFeaturedQuizImageFrameClass
                          )}
                        >
                          <img
                            src="/brand/quiz-illustration.png"
                            alt={formatQuizType(primaryQuizType || '')}
                            className="max-h-full w-full object-contain object-center drop-shadow-[0_22px_24px_rgba(65,10,24,0.34)] saturate-[1.08] transition-transform duration-500 group-hover:scale-[1.04]"
                            loading="lazy"
                          />
                        </div>
                        <div className={cn('absolute inset-0', indexFeaturedQuizImageVignetteClass)} />
                        <div className="absolute left-2 top-2 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/60 bg-white/36 px-2.5 py-1 text-xs font-semibold text-[#7a2038] backdrop-blur-sm sm:left-4 sm:top-4 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm md:text-[0.9375rem]">
                          <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          {tk('home.featured')}
                        </div>
                      </div>
                      <CardContent className="border-t border-brand-cta-end/25 bg-[linear-gradient(135deg,rgba(104,22,40,0.94)_0%,rgba(140,33,55,0.92)_100%)] p-3 text-white sm:p-4 md:p-5">
                        <div className="grid gap-2 sm:gap-3 md:gap-4">
                          <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3">
                            <h3 className="min-w-0 flex-1 break-words font-display text-xl font-bold leading-snug text-white md:text-2xl lg:text-[1.75rem] lg:leading-tight">
                              {formatQuizType(primaryQuizType || '')}
                            </h3>
                            <span className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border-2 border-white/90 bg-white px-3 text-sm font-semibold text-brand-cta-end shadow-md transition-all group-hover:-translate-y-0.5 group-hover:bg-white group-hover:shadow-lg sm:h-10 sm:gap-2 sm:px-4 md:text-[0.9375rem] [&_svg]:size-4 [&_svg]:transition-transform group-hover:[&_svg]:translate-x-1">
                              {tk('home.seeMore')}
                              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </span>
                          </div>
                          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
                            <p className="line-clamp-2 min-w-0 flex-1 text-sm leading-relaxed text-white/92 sm:min-w-[200px] md:text-base lg:line-clamp-3">
                              {primaryTypeDescription}
                            </p>
                            <span className="shrink-0 text-sm font-semibold tabular-nums text-white/95 md:text-base">
                              {tkFill('home.typeCardStats', {
                                quizzes: String(primaryTypeQuizzes.length),
                                questions: primaryTypeQuestionTotal.toLocaleString(
                                  lang === 'vi' ? 'vi-VN' : lang === 'en' ? 'en-US' : 'es-ES'
                                ),
                              })}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </LocaleLink>
              </motion.div>

              {/* Other Quiz Types - Smaller Cards */}
              <div className="grid gap-2 sm:grid-cols-2 sm:gap-2.5 lg:grid-cols-1 lg:gap-2">
                {quizTypes.slice(1, 5).length ? (
                  quizTypes.slice(1, 5).map((type, i) => {
                    const typeQuizzes = quizzes.filter(
                      (quiz) => String(quiz.quiz_type || '') === String(type)
                    );
                    const typeQuestionTotal = typeQuizzes.reduce(
                      (sum, quiz) => sum + Number(quiz.total_questions || 0),
                      0
                    );
                    const typeDescription = getTopicDescriptionByType(type);
                    const completedCount = typeQuizzes.filter((quiz) =>
                      Boolean(quiz.has_completed)
                    ).length;
                    const completionRate = typeQuizzes.length
                      ? Math.round((completedCount / typeQuizzes.length) * 100)
                      : 0;

                    return (
                      <motion.div
                        key={type}
                        custom={i + 2}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        className="h-full min-h-0"
                      >
                        <LocaleLink
                          href={`/quizzes?type=${encodeURIComponent(type)}`}
                          className="flex h-full min-h-0"
                        >
                          <Card className="group flex h-full min-h-0 w-full flex-col overflow-hidden border border-border/80 bg-[linear-gradient(170deg,rgba(255,255,255,0.98)_0%,rgba(252,247,248,0.93)_100%)] shadow-[0_6px_18px_rgba(20,27,45,0.05)] transition-all hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_12px_26px_rgba(20,27,45,0.12)]">
                            <CardContent className="flex min-h-0 flex-1 flex-col p-0">
                              <div className="flex min-h-0 flex-1 gap-2 sm:gap-3 md:gap-3.5">
                                <div
                                  className={cn(
                                    'flex w-[3.75rem] shrink-0 flex-col items-center justify-center gap-0.5 self-stretch rounded-l-xl border-r border-primary/15 px-1 py-1.5 sm:w-[4.5rem] sm:gap-1 sm:px-1.5 sm:py-2 md:w-20 md:py-2.5',
                                    indexPaleImageFrameClass
                                  )}
                                >
                                  <img
                                    src="/brand/test.png"
                                    alt=""
                                    className="h-8 w-8 object-contain object-center drop-shadow-[0_4px_10px_rgba(122,32,56,0.22)] transition-transform duration-300 group-hover:scale-[1.04] sm:h-10 sm:w-10 md:h-11 md:w-11"
                                    loading="lazy"
                                    aria-hidden
                                  />
                                  <span className="font-display text-xs font-bold tabular-nums leading-none text-primary sm:text-sm md:text-[0.9375rem]">
                                    {typeQuizzes.length}+
                                  </span>
                                </div>
                                <div className="flex min-h-0 min-w-0 flex-1 flex-col py-1.5 pr-1.5 sm:py-2 sm:pr-2 md:py-2.5 md:pr-3">
                                  <div className="mb-0.5 flex items-start justify-between gap-1.5 sm:gap-2">
                                    <h4 className="min-w-0 flex-1 font-display text-base font-bold leading-snug text-foreground sm:text-[1.0625rem] md:text-lg lg:text-xl">
                                      {formatQuizType(type)}
                                    </h4>
                                    <span
                                      className={cn(indexCardOpenChipClass, 'ml-0.5 self-start sm:ml-1')}
                                    >
                                      {tk('home.open')}
                                      <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.25} />
                                    </span>
                                  </div>
                                  <p className="mb-0.5 shrink-0 text-xs font-semibold tabular-nums text-primary/90 sm:mb-1 sm:text-sm md:text-[0.9375rem]">
                                    {tkFill('home.typeCardStatsShort', {
                                      quizzes: String(typeQuizzes.length),
                                      questions: typeQuestionTotal.toLocaleString(
                                        lang === 'vi' ? 'vi-VN' : lang === 'en' ? 'en-US' : 'es-ES'
                                      ),
                                    })}
                                  </p>
                                  <div className="min-h-0 flex-1">
                                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground sm:leading-relaxed md:text-[15px] md:leading-relaxed lg:line-clamp-3">
                                      {typeDescription}
                                    </p>
                                  </div>
                                  {completedCount > 0 && (
                                    <p className="mt-auto shrink-0 pt-0.5 text-xs font-medium text-primary/85 sm:pt-1 sm:text-sm">
                                      {tkFill('home.completedPct', { p: String(completionRate) })}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </LocaleLink>
                      </motion.div>
                    );
                  })
                ) : (
                  <Card className="border border-dashed border-primary/25 bg-primary/5">
                    <CardContent className="p-6 text-center">
                      <p className="font-semibold text-foreground">
                        {tk('home.addingCategories')}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {tk('home.startFeatured')}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <Card className="border border-primary/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(252,247,248,0.95)_100%)] shadow-sm">
              <CardContent className="px-6 py-12 text-center sm:px-10">
                <p className="text-lg font-semibold text-foreground">
                  {tk('home.quizzesUpdating')}
                </p>
                <p className="mt-2 text-muted-foreground">
                  {tk('home.quizzesRetryHint')}
                </p>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <LocaleLink href="/quizzes" className="inline-flex">
                    <Button
                      className={cn(
                        'gap-2 rounded-full border-2 border-primary/30 bg-primary px-6 text-primary-foreground shadow-md hover:bg-secondary hover:shadow-lg [&_svg]:size-4 [&_svg]:transition-transform hover:[&_svg]:translate-x-0.5'
                      )}
                    >
                      {tk('home.viewSampleQuizzes')}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </LocaleLink>
                  {!isAuthenticated && (
                    <LocaleLink href="/register" className="inline-flex">
                      <Button
                        variant="outline"
                        className="border-primary/30 text-primary hover:bg-primary/5"
                      >
                        {tk('home.createAccountStart')}
                      </Button>
                    </LocaleLink>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Tài liệu — cool slate/sky band so it reads separately from quiz blush */}
      <section className="relative border-t border-slate-200/70 bg-[linear-gradient(180deg,rgba(252,253,255,1)_0%,rgba(240,248,255,0.82)_42%,rgba(248,250,252,0.98)_100%)] pt-5 pb-14 sm:pt-6 sm:pb-16 lg:pt-8 lg:pb-20">
        <div className="container mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 xl:px-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="mb-7 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start"
          >
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary sm:text-sm">
                {tk('home.theoryBadge')}
              </span>
              <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl md:text-[2.35rem] md:leading-tight">
                {tk('home.dgtMaterialsTitle')}
              </h2>
              <p className="mt-3 max-w-2xl text-base font-medium leading-relaxed text-[#4a3038] sm:text-lg md:text-xl">
                {tk('home.materialsHeroDesc')}
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 lg:items-end">
              <LocaleLink href="/materials" className="inline-flex">
                <Button className={cn(indexViewAllButtonClass)}>
                  {tk('home.viewAllMaterials')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </LocaleLink>
              {!subjectsLoading ? (
                <p className="inline-flex max-w-full flex-wrap items-center gap-x-1 rounded-lg border border-primary/25 bg-primary/10 px-3.5 py-2 text-center text-sm font-bold leading-snug text-primary shadow-sm md:text-[0.9375rem] lg:text-right">
                  {materialCountsQuery.isError
                    ? tkFill('home.materialChipError', {
                        topics: formatCount(subjects.length),
                      })
                    : materialCountsQuery.isLoading || homeMaterialFilesTotal === null
                      ? tkFill('home.materialChipLoading', {
                          topics: formatCount(subjects.length),
                        })
                      : tkFill('home.materialChipFull', {
                          topics: formatCount(subjects.length),
                          files: formatCount(homeMaterialFilesTotal),
                        })}
                </p>
              ) : null}
            </div>
          </motion.div>

          {subjectsLoading ? (
            <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-primary/20 bg-muted/30">
              <p className="text-sm font-medium text-muted-foreground">
                {tk('home.loadingMaterials')}
              </p>
            </div>
          ) : subjects.length ? (
            <div>
              <div
                className="-mx-3 flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto overflow-y-hidden scroll-pl-3 px-3 pb-2 pt-1 scrollbar-hide sm:-mx-5 sm:gap-4 sm:scroll-pl-5 sm:px-5 md:gap-5 lg:-mx-6 lg:gap-6 lg:scroll-pl-6 lg:px-6 lg:snap-none xl:-mx-8 xl:scroll-pl-8 xl:px-8"
                style={{ touchAction: 'pan-x', overscrollBehaviorX: 'contain' }}
              >
                {subjects.map((sub, i) => {
                  const matLocked =
                    isPremiumContentFlag(sub.requires_premium) && !premiumOk;
                  return (
                  <motion.div
                    key={sub.id}
                    custom={Math.min(i, 5)}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    className="flex w-[min(78vw,260px)] shrink-0 snap-start sm:w-[272px] md:w-[288px] lg:w-[300px] xl:w-[300px]"
                  >
                    <LocaleLink
                      href={
                        matLocked
                          ? APP_ROUTES.PREMIUM
                          : `/materials?subject=${encodeURIComponent(String(sub.id))}`
                      }
                      className="flex min-h-0 min-w-0 flex-1"
                    >
                      <Card
                        className={cn(
                          'group flex h-full min-h-0 w-full flex-col overflow-hidden rounded-lg border border-slate-200/75 bg-[linear-gradient(170deg,rgba(255,255,255,0.99)_0%,rgba(245,248,252,0.94)_100%)] shadow-[0_8px_22px_rgba(15,23,42,0.06)] transition-all duration-300 hover:border-primary/40 sm:rounded-xl sm:shadow-[0_12px_32px_rgba(15,23,42,0.08)] sm:hover:-translate-y-1 sm:hover:shadow-[0_18px_42px_rgba(15,23,42,0.11)]',
                          matLocked &&
                            'opacity-[0.88] saturate-[0.88] contrast-[0.98]'
                        )}
                      >
                        <div className="relative h-[100px] shrink-0 overflow-hidden border-b border-primary/12 sm:h-[132px] md:h-[148px]">
                          <div
                            className={cn(
                              'absolute inset-0 flex items-center justify-center p-2 sm:p-3 md:p-4',
                              indexPaleImageFrameClass
                            )}
                          >
                            <img
                              src="/brand/materials-illustration.png"
                              alt=""
                              className="max-h-[70px] w-full object-contain object-center transition-transform duration-500 group-hover:scale-[1.05] sm:max-h-[100px] md:max-h-[118px]"
                              loading="lazy"
                            />
                          </div>
                          <div className="absolute right-1.5 top-1.5 z-[1] flex max-w-[calc(100%-0.75rem)] flex-col items-end gap-1 sm:right-2 sm:top-2">
                            {isPremiumContentFlag(sub.requires_premium) ? (
                              <span className="inline-flex shrink-0 rounded-full border border-amber-200/90 bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase leading-none text-amber-950 shadow-sm sm:text-[10px]">
                                {tk('listing.content_tier_advanced')}
                              </span>
                            ) : null}
                            {materialCountBySubjectId ? (
                              <span className="inline-flex max-w-full items-center truncate rounded-full border border-white/55 bg-primary px-2 py-0.5 text-[10px] font-bold tabular-nums leading-none text-primary-foreground shadow-[0_2px_8px_rgba(58,10,20,0.28)] sm:px-2.5 sm:text-[11px] md:text-xs">
                                {tkFill('home.materialSubjectPostCount', {
                                  n: formatCount(
                                    materialCountBySubjectId.get(sub.id) ?? 0
                                  ),
                                })}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <CardContent className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden bg-white p-0">
                          <div className="border-b border-primary/20 bg-white px-2.5 py-2 sm:px-3 sm:py-2.5 md:px-3.5">
                            <h3 className="text-balance break-words font-display text-[0.97rem] font-bold leading-snug text-foreground sm:text-[1.0625rem] md:text-[1.125rem]">
                              {sub.name}
                            </h3>
                          </div>
                          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-1.5 bg-white px-2.5 pb-2.5 pt-2 sm:gap-2 sm:px-3 sm:pb-3 sm:pt-2.5 md:px-3.5 md:pb-3">
                            {sub.material_topic_group_name ? (
                              <p className="break-words text-sm font-semibold leading-snug text-foreground sm:text-[0.9375rem] md:text-[15px]">
                                {sub.material_topic_group_name}
                              </p>
                            ) : null}
                            {sub.description ? (
                              <p className="line-clamp-4 text-sm leading-snug text-foreground/90 sm:text-[15px] sm:leading-relaxed md:text-base">
                                {sub.description}
                              </p>
                            ) : null}
                            <span className={indexMaterialsOpenButtonClass}>
                              {matLocked ? tk('listing.content_tier_advanced') : tk('home.open')}
                              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.25} />
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </LocaleLink>
                  </motion.div>
                  );
                })}
              </div>
              <p className="mt-2 text-center text-sm text-muted-foreground md:text-base lg:hidden">
                {tk('home.swipeMoreTopics')}
              </p>
            </div>
          ) : (
            <Card className="border border-primary/20 bg-muted/20 shadow-sm">
              <CardContent className="px-6 py-10 text-center sm:px-10">
                <p className="text-lg font-semibold text-foreground">
                  {tk('home.noMaterialsYet')}
                </p>
                <p className="mt-2 text-muted-foreground">
                  {tk('home.materialsRetryHint')}
                </p>
                <LocaleLink href="/materials" className="mt-5 inline-flex">
                  <Button className={cn(indexViewAllButtonClass)}>
                    {tk('home.openMaterialsPage')}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </LocaleLink>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* CTA — nền đơn giản; scroll-mt tránh chồng lên thanh nav khi cuộn */}
      <section
        id="cta-dang-ky"
        className="relative w-full scroll-mt-24 overflow-x-hidden border-t border-primary/10 bg-[#2a0a12]"
        style={{
          backgroundImage:
            'linear-gradient(180deg, rgba(52,10,20,0.76) 0%, rgba(82,12,29,0.62) 40%, rgba(18,4,9,0.74) 100%), url(/brand/deco-wave.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="relative z-[1] mx-auto flex w-full max-w-none flex-col items-center overflow-visible px-3 py-12 text-center sm:px-4 sm:py-14 md:px-5 lg:px-6 lg:py-16"
        >
          <div className="flex w-full max-w-4xl flex-col items-center gap-4 sm:gap-5">
            <span className="inline-flex rounded-full border border-[#e8c88a]/55 bg-[rgba(12,4,8,0.45)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#fff4e6] shadow-sm backdrop-blur-[2px] sm:text-[11px]">
              {tk('home.sectionBadge')}
            </span>
            <h2 className="cta-headline-luxe max-w-3xl px-1 pb-0.5 text-[1.35rem] sm:text-3xl md:text-4xl lg:text-[2.65rem]">
              {tk('home.ctaHeadline')}
            </h2>
            <p
              className={cn(
                'cta-subline-luxe w-full px-2 text-base leading-snug text-pretty sm:text-lg sm:leading-relaxed md:text-xl',
                lang === 'es' ? 'max-w-4xl' : 'max-w-2xl'
              )}
            >
              {tk('home.ctaSub')}
            </p>
          </div>

          <div className="mt-10 flex w-full max-w-[min(100%,520px)] flex-col items-center gap-4 bg-transparent sm:mt-12">
            {!isAuthenticated ? (
              <>
                <LocaleLink
                  href="/register"
                  className="group block w-full bg-transparent p-0 shadow-none ring-0 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
                >
                  <img
                    key={lang}
                    src={
                      lang === 'es'
                        ? '/brand/dangky_es.png'
                        : lang === 'en'
                          ? '/brand/dangky_en.png'
                          : '/brand/dangky.png'
                    }
                    alt={tk('home.registerImgAlt')}
                    className="h-auto w-full bg-transparent object-contain object-center brightness-[1.07] saturate-[1.08] transition-transform duration-300 group-hover:scale-[1.03]"
                    loading="lazy"
                    width={640}
                    height={200}
                  />
                </LocaleLink>
                <p className="max-w-sm text-center text-xs italic leading-relaxed text-[#f0e8dc] drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] sm:text-sm">
                  {tk('home.registerHint')}
                </p>
              </>
            ) : (
              <div className="flex w-full max-w-xl flex-col items-stretch gap-2 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-2.5">
                <LocaleLink href="/quizzes" className="inline-flex w-full sm:min-w-0 sm:w-auto">
                  <Button variant="ghost" size="lg" className={heroPrimaryCtaButtonClass}>
                    {tk('home.goQuizzes')}
                    <ArrowRight className="shrink-0" strokeWidth={2.25} aria-hidden />
                  </Button>
                </LocaleLink>
                <LocaleLink href="/materials" className="inline-flex w-full sm:min-w-0 sm:w-auto">
                  <Button size="lg" variant="secondary" className={heroSecondaryGlassCtaButtonClass}>
                    <FileText className="shrink-0 opacity-95" aria-hidden />
                    {tk('home.studyMaterials')}
                  </Button>
                </LocaleLink>
              </div>
            )}
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
