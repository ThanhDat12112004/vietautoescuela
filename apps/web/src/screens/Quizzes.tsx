import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLanguage } from '@/hooks/useLanguage';
import { getQuizzes, type QuizListItem } from '@/lib/api/quiz';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Search } from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const ITEMS_PER_PAGE = 10;

const QUIZZES_ILLUSTRATION_SRC = '/brand/test.png';

const Quizzes = () => {
  const { t, lang } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState<string>('all');
  const [activeTopicGroup, setActiveTopicGroup] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [expandedTopicGroup, setExpandedTopicGroup] = useState<string>('');
  const [progressFilter, setProgressFilter] = useState<'all' | 'done' | 'todo'>('all');
  const [mobileTopicOpen, setMobileTopicOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const prevSearchForPage = useRef<string | undefined>(undefined);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const {
    data: quizzes = [],
    isLoading: loading,
    error: quizzesError,
  } = useQuery<QuizListItem[]>({
    queryKey: ['quizzes', lang],
    queryFn: () => getQuizzes(lang),
    staleTime: 60_000,
  });

  const error = useMemo(
    () =>
      quizzesError
        ? quizzesError instanceof Error
          ? quizzesError.message
          : t('Không tải được danh sách đề', 'No se pudo cargar la lista')
        : '',
    [quizzesError, t]
  );

  const formatQuizType = (value: string) =>
    value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

  const normalizeToken = (value: string) =>
    String(value || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial `q` from URL only
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  const quizTypes = useMemo(() => {
    const names = quizzes
      .map((quiz) => quiz.quiz_type)
      .filter((value): value is string => Boolean(value));
    return Array.from(new Set(names));
  }, [quizzes]);

  const quizTopicGroups = useMemo(() => {
    const names = quizzes
      .map((quiz) => String(quiz.quiz_topic_group_name || '').trim())
      .filter(Boolean);
    return Array.from(new Set(names));
  }, [quizzes]);

  const quizCategoriesByGroup = useMemo(() => {
    const result: Record<string, string[]> = {};
    for (const quiz of quizzes) {
      const group = String(quiz.quiz_topic_group_name || '').trim();
      const cat = String(quiz.category_name || '').trim();
      if (!group || !cat) continue;
      if (!result[group]) result[group] = [];
      if (!result[group].includes(cat)) result[group].push(cat);
    }
    return result;
  }, [quizzes]);

  const quizCategories = useMemo(
    () => (activeTopicGroup ? quizCategoriesByGroup[activeTopicGroup] || [] : []),
    [activeTopicGroup, quizCategoriesByGroup]
  );
  const requestedProgress = useMemo(() => {
    const raw = String(searchParams.get('progress') || '').trim().toLowerCase();
    return raw === 'done' || raw === 'todo' || raw === 'all' ? raw : '';
  }, [searchParams]);

  const requestedPage = useMemo(() => {
    const raw = Number(searchParams.get('page'));
    return Number.isInteger(raw) && raw > 0 ? raw : 1;
  }, [searchParams]);

  useEffect(() => {
    if (!requestedProgress) return;
    setProgressFilter(requestedProgress);
  }, [requestedProgress]);

  useEffect(() => {
    setCurrentPage(requestedPage);
  }, [requestedPage]);

  useEffect(() => {
    if (!mobileSearchOpen) return;
    const id = window.requestAnimationFrame(() => {
      mobileSearchInputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [mobileSearchOpen]);

  const requestedType = useMemo(() => String(searchParams.get('type') || '').trim(), [searchParams]);
  const requestedTopicGroup = useMemo(
    () => String(searchParams.get('topic_group') || '').trim(),
    [searchParams]
  );
  const requestedCategory = useMemo(
    () => String(searchParams.get('category') || '').trim(),
    [searchParams]
  );

  useEffect(() => {
    if (!requestedType) return;
    if (requestedType.toLowerCase() === 'all') {
      setActiveType('all');
      return;
    }

    const normalizedRequested = normalizeToken(requestedType);
    const matchedType = quizTypes.find((type) => {
      return (
        normalizeToken(type) === normalizedRequested ||
        normalizeToken(formatQuizType(type)) === normalizedRequested
      );
    });

    if (matchedType) {
      setActiveType(matchedType);

      if (requestedType !== matchedType) {
        const next = new URLSearchParams(searchParams);
        next.set('type', matchedType);
        setSearchParams(next, { replace: true });
      }
    }
  }, [formatQuizType, normalizeToken, quizTypes, requestedType, searchParams, setSearchParams]);

  useEffect(() => {
    if (!activeType || activeType === 'all') return;
    const matchedQuiz = quizzes.find((quiz) => String(quiz.quiz_type || '') === String(activeType));
    if (!matchedQuiz) return;

    const group = String(matchedQuiz.quiz_topic_group_name || '').trim();
    const category = String(matchedQuiz.category_name || '').trim();
    if (group) {
      setActiveTopicGroup(group);
      setExpandedTopicGroup(group);
    }
    if (category) {
      setActiveCategory(category);
    }
  }, [activeType, quizzes]);

  useEffect(() => {
    if (!requestedTopicGroup) return;
    if (!quizTopicGroups.includes(requestedTopicGroup)) return;
    setActiveTopicGroup(requestedTopicGroup);
    setExpandedTopicGroup(requestedTopicGroup);
  }, [quizTopicGroups, requestedTopicGroup]);

  useEffect(() => {
    if (!requestedCategory) return;

    if (requestedTopicGroup && quizTopicGroups.includes(requestedTopicGroup)) {
      const scoped = quizCategoriesByGroup[requestedTopicGroup] || [];
      if (scoped.includes(requestedCategory)) {
        setActiveTopicGroup(requestedTopicGroup);
        setExpandedTopicGroup(requestedTopicGroup);
        setActiveCategory(requestedCategory);
        return;
      }
    }

    const matchedGroup = quizTopicGroups.find((group) =>
      (quizCategoriesByGroup[group] || []).includes(requestedCategory)
    );
    if (matchedGroup) {
      setActiveTopicGroup(matchedGroup);
      setExpandedTopicGroup(matchedGroup);
      setActiveCategory(requestedCategory);
    }
  }, [quizCategoriesByGroup, quizTopicGroups, requestedCategory, requestedTopicGroup]);

  const applyTypeFilter = (type: string) => {
    setActiveType(type);
    if (type === 'all') {
      setActiveTopicGroup('');
      setActiveCategory('');
      setExpandedTopicGroup('');
    }
    setCurrentPage(1);
    const next = new URLSearchParams(searchParams);
    if (type === 'all') {
      next.delete('type');
    } else {
      next.set('type', type);
    }
    next.delete('page');
    setSearchParams(next, { replace: true });
  };

  const applyProgressFilter = (value: 'all' | 'done' | 'todo') => {
    setProgressFilter(value);
    setCurrentPage(1);
    const next = new URLSearchParams(searchParams);
    if (value === 'all') {
      next.delete('progress');
    } else {
      next.set('progress', value);
    }
    next.delete('page');
    setSearchParams(next, { replace: true });
  };

  const normalizeForSearch = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const filtered = useMemo(() => {
    const q = normalizeForSearch(deferredSearchQuery);
    const searchingAll = q.length > 0;
    return quizzes.filter((quiz) => {
      const byType = activeType === 'all' ? true : quiz.quiz_type === activeType;
      const byTopicGroup = searchingAll
        ? true
        : activeTopicGroup
          ? String(quiz.quiz_topic_group_name || '').trim() === activeTopicGroup
          : true;
      const byCategory = searchingAll
        ? true
        : activeCategory
          ? String(quiz.category_name || '').trim() === activeCategory
          : true;
      const byProgress =
        progressFilter === 'all'
          ? true
          : progressFilter === 'done'
            ? Boolean(quiz.has_completed)
            : !quiz.has_completed;
      if (!byType || !byTopicGroup || !byCategory || !byProgress) return false;
      if (!q) return true;
      const blob = normalizeForSearch(
        [
          quiz.title,
          quiz.description || '',
          quiz.quiz_type ? formatQuizType(quiz.quiz_type) : '',
          quiz.quiz_topic_group_name || '',
        ].join(' ')
      );
      return blob.includes(q);
    });
  }, [
    activeCategory,
    activeTopicGroup,
    activeType,
    deferredSearchQuery,
    formatQuizType,
    progressFilter,
    quizzes,
  ]);

  useEffect(() => {
    if (!activeTopicGroup) return;
    setExpandedTopicGroup((prev) => prev || activeTopicGroup);
  }, [activeTopicGroup]);

  useEffect(() => {
    if (!activeCategory) return;
    if (!quizCategories.includes(activeCategory)) {
      setActiveCategory('');
    }
  }, [activeCategory, quizCategories]);

  const mobileTopicSummary = useMemo(() => {
    if (!activeTopicGroup) {
      return t('Tất cả nhóm và chủ đề', 'Todos los grupos y temas');
    }
    if (!activeCategory) {
      return activeTopicGroup;
    }
    return `${activeTopicGroup} › ${activeCategory}`;
  }, [activeCategory, activeTopicGroup, t]);

  const progressCounts = useMemo(() => {
    const scoped =
      activeType === 'all' ? quizzes : quizzes.filter((quiz) => quiz.quiz_type === activeType);

    return {
      all: scoped.length,
      done: scoped.filter((quiz) => Boolean(quiz.has_completed)).length,
      todo: scoped.filter((quiz) => !quiz.has_completed).length,
    };
  }, [activeType, quizzes]);

  const typeCounts = useMemo(() => {
    const scoped =
      progressFilter === 'all'
        ? quizzes
        : quizzes.filter((quiz) =>
            progressFilter === 'done' ? Boolean(quiz.has_completed) : !quiz.has_completed
          );

    return scoped.reduce<Record<string, number>>((acc, quiz) => {
      const key = quiz.quiz_type || '';
      if (!key) return acc;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [progressFilter, quizzes]);

  useEffect(() => {
    if (prevSearchForPage.current === undefined) {
      prevSearchForPage.current = deferredSearchQuery;
      return;
    }
    if (prevSearchForPage.current === deferredSearchQuery) return;
    prevSearchForPage.current = deferredSearchQuery;
    setCurrentPage(1);
    const next = new URLSearchParams(searchParams);
    next.delete('page');
    setSearchParams(next, { replace: true });
  }, [deferredSearchQuery, searchParams, setSearchParams]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE)),
    [filtered.length]
  );

  const effectivePage = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (currentPage <= totalPages) return;
    setCurrentPage(totalPages);
    const next = new URLSearchParams(searchParams);
    if (totalPages <= 1) {
      next.delete('page');
    } else {
      next.set('page', String(totalPages));
    }
    setSearchParams(next, { replace: true });
  }, [currentPage, searchParams, setSearchParams, totalPages]);

  const pagedQuizzes = useMemo(() => {
    const start = (effectivePage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [effectivePage, filtered]);

  const goToPage = (page: number) => {
    const nextPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const next = new URLSearchParams(searchParams);
    if (nextPage === 1) {
      next.delete('page');
    } else {
      next.set('page', String(nextPage));
    }
    setSearchParams(next, { replace: true });
  };

  const pageWindow = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const start = Math.max(1, effectivePage - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);
    return Array.from({ length: end - adjustedStart + 1 }, (_, i) => adjustedStart + i);
  }, [effectivePage, totalPages]);

  return (
    <div className="app-page flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b-2 border-primary/25 bg-card">
          <div className="w-full px-3 py-5 sm:px-4 md:py-6 lg:px-5">
            <div className="max-w-3xl border-l-[3px] border-primary/60 pl-3 sm:pl-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/80">
                {t('Luyện tập', 'Práctica')}
              </p>
              <h1 className="mt-1.5 font-display text-[1.65rem] font-bold leading-tight tracking-tight text-foreground md:text-[2rem]">
                {t('Làm bài thi mô phỏng', 'Exámenes simulados')}
              </h1>
              <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-foreground/72 md:text-[0.97rem]">
                {t(
                  'Chọn bài thi và chế độ làm bài. Luyện tập để kiểm tra từng câu hoặc thi thật để xem kết quả cuối cùng.',
                  'Elige un examen y modo. Práctica para verificar cada pregunta o examen real para ver resultados al final.'
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-1 flex-col bg-background">
          <div className="w-full border-b border-primary/20 bg-card px-3 py-3.5 font-sans shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] sm:px-4 xl:px-5">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,230px)_minmax(0,1fr)_230px] lg:items-end lg:gap-4">
              <div className="order-2 min-w-0 lg:order-1">
                <div className="flex items-center justify-between gap-2 lg:block">
                  <span className="block min-w-0 text-xs font-semibold uppercase tracking-[0.06em] text-primary/90">
                    {t('Trạng thái làm bài', 'Estado')}
                  </span>
                  <button
                    type="button"
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-white/95 text-primary shadow-[0_6px_16px_rgba(143,34,61,0.1)] ring-1 ring-white/70 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 lg:hidden',
                      mobileSearchOpen && 'border-primary/40 ring-primary/25',
                      normalizeForSearch(searchQuery).length > 0 &&
                        !mobileSearchOpen &&
                        'border-primary/35 bg-primary/8'
                    )}
                    onClick={() => setMobileSearchOpen((open) => !open)}
                    aria-expanded={mobileSearchOpen}
                    aria-controls="quiz-search-mobile"
                    aria-label={t('Mở ô tìm kiếm', 'Abrir búsqueda')}
                  >
                    <Search className="h-[1.15rem] w-[1.15rem]" strokeWidth={2.25} aria-hidden />
                  </button>
                </div>
                <Select
                  value={progressFilter}
                  onValueChange={(v) => applyProgressFilter(v as 'all' | 'done' | 'todo')}
                >
                  <SelectTrigger
                    className="mt-1.5 h-11 w-full rounded-lg border-primary/25 bg-white/95 text-base font-semibold text-foreground shadow-[0_8px_22px_rgba(143,34,61,0.12)] ring-1 ring-white/70 focus:ring-primary/35 max-lg:text-[1.05rem]"
                    aria-label={t('Lọc theo trạng thái', 'Filtrar por estado')}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="start" className="rounded-xl">
                    <SelectItem value="all" className="font-semibold">
                      {t('Tất cả', 'Todos')}{' '}
                      <span className="tabular-nums text-muted-foreground">
                        ({progressCounts.all})
                      </span>
                    </SelectItem>
                    <SelectItem value="done" className="font-semibold">
                      {t('Đã làm', 'Hechos')}{' '}
                      <span className="tabular-nums font-bold text-[#b91c1c]">
                        ({progressCounts.done})
                      </span>
                    </SelectItem>
                    <SelectItem value="todo" className="font-semibold">
                      {t('Chưa làm', 'Pend.')}{' '}
                      <span className="tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                        ({progressCounts.todo})
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div
                  id="quiz-search-mobile"
                  className={cn('mt-2 lg:hidden', !mobileSearchOpen && 'hidden')}
                >
                  <div className="relative">
                    <span
                      aria-hidden
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-primary/70"
                    >
                      🔍
                    </span>
                    <Input
                      ref={mobileSearchInputRef}
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('Tìm nhanh đề thi...', 'Busca examen rápido...')}
                      aria-label={t('Tìm kiếm', 'Buscar')}
                      className="h-12 w-full rounded-lg border border-primary/25 bg-white/95 pl-10 pr-4 text-sm font-semibold text-foreground placeholder:text-muted-foreground/70 shadow-[0_8px_22px_rgba(143,34,61,0.12)] ring-1 ring-white/70 backdrop-blur-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/35"
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>

              <div className="order-1 hidden min-w-0 lg:order-2 lg:block">
                <div className="min-w-0 space-y-1.5 lg:w-full">
                  <div className="flex items-center gap-3 max-lg:gap-0">
                    <label
                      htmlFor="quiz-search"
                      className="hidden shrink-0 text-xs font-semibold uppercase tracking-[0.06em] text-primary/90 lg:block"
                    >
                      {t('Tìm kiếm', 'Buscar')}
                    </label>
                    <div className="relative min-w-0 flex-1">
                      <span
                        aria-hidden
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-primary/70"
                      >
                        🔍
                      </span>
                      <Input
                        id="quiz-search"
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('Tìm nhanh đề thi...', 'Busca examen rápido...')}
                        aria-label={t('Tìm kiếm', 'Buscar')}
                        className="h-12 w-full rounded-lg border border-primary/25 bg-white/95 pl-10 pr-4 text-sm font-semibold text-foreground placeholder:text-muted-foreground/70 shadow-[0_8px_22px_rgba(143,34,61,0.12)] ring-1 ring-white/70 backdrop-blur-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/35"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden lg:order-3 lg:block" aria-hidden />
            </div>
          </div>

          <div className="w-full flex-1 px-0 pb-0 pt-0 max-xl:px-0 sm:pt-0 xl:px-0">
          <div className="w-full border-b border-primary/20 bg-card px-3 py-3.5 font-sans shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] sm:px-4 xl:hidden">
            <Popover open={mobileTopicOpen} onOpenChange={setMobileTopicOpen}>
              <span className="block text-xs font-semibold uppercase tracking-[0.06em] text-primary/90">
                {t('Loại chủ đề và chủ đề', 'Grupo y tema')}
              </span>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'mt-1.5 flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-primary/25 bg-white/95 px-3 text-left text-base font-semibold shadow-[0_8px_22px_rgba(143,34,61,0.12)] ring-1 ring-white/70 transition-colors max-lg:text-[1.05rem]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
                    mobileTopicOpen && 'ring-2 ring-primary/35'
                  )}
                  aria-expanded={mobileTopicOpen}
                  aria-label={`${t('Loại chủ đề và chủ đề', 'Grupo y tema')}: ${mobileTopicSummary}`}
                >
                  <span className="block min-w-0 truncate whitespace-nowrap text-left text-base leading-snug max-lg:text-[1.05rem]">
                    {!activeTopicGroup ? (
                      <span className="font-semibold text-[#6b1b31]">{mobileTopicSummary}</span>
                    ) : !activeCategory ? (
                      <span className="font-bold text-[#6b1b31]">{activeTopicGroup}</span>
                    ) : (
                      <>
                        <span className="font-bold text-[#6b1b31]">{activeTopicGroup}</span>
                        <span className="font-medium text-[#7a2038]"> &gt; {activeCategory}</span>
                      </>
                    )}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 text-primary/70 transition-transform duration-200',
                      mobileTopicOpen && 'rotate-180'
                    )}
                    aria-hidden
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                sideOffset={8}
                className="max-h-[min(56vh,380px)] w-[calc(100vw-1.5rem)] max-w-[24rem] overflow-hidden border-[#e2c2cb] bg-[#fffafb] p-0 shadow-[0_16px_34px_rgba(95,20,40,0.14)]"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <div className="max-h-[min(56vh,380px)] overflow-y-auto overscroll-contain bg-[#fffafb]">
                  <div className="space-y-0 overflow-hidden border border-[#e2c2cb] bg-[#fffafb]">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTopicGroup('');
                        setActiveCategory('');
                        setExpandedTopicGroup('');
                        setCurrentPage(1);
                        setMobileTopicOpen(false);
                      }}
                      className={cn(
                        'w-full border-b border-[#e8d0d6] px-3 py-2.5 text-left text-[15px] font-semibold transition-colors',
                        !activeTopicGroup
                          ? 'bg-[#fff4f7] text-[#7a2038]'
                          : 'bg-white/90 text-[#6b1b31] hover:bg-[#fff4f7]/85'
                      )}
                    >
                      {t('Tất cả', 'Todos')}
                    </button>
                    {quizTopicGroups.map((group) => {
                      const isOpen = expandedTopicGroup === group;
                      const groupCats = quizCategoriesByGroup[group] || [];
                      return (
                        <div key={group} className="border-b border-[#e8d0d6] last:border-b-0 bg-white/90">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTopicGroup(group);
                              setActiveCategory('');
                              if (!isOpen) {
                                setExpandedTopicGroup(group);
                              } else {
                                setExpandedTopicGroup('');
                              }
                              setCurrentPage(1);
                            }}
                            className={cn(
                              'flex w-full items-center justify-between px-3 py-2.5 text-left text-[15px] font-semibold transition-colors',
                              activeTopicGroup === group
                                ? 'bg-[#fff4f7] text-[#7a2038]'
                                : 'bg-white/80 text-[#6b1b31] hover:bg-[#fff4f7]/75'
                            )}
                          >
                            <span className="min-w-0 pr-2">{group}</span>
                            <span
                              className={cn(
                                'shrink-0 text-lg leading-none',
                                activeTopicGroup === group ? 'text-[#7a2038]' : 'text-primary/65'
                              )}
                            >
                              {isOpen ? '▾' : '▸'}
                            </span>
                          </button>
                          {isOpen && (
                            <div className="border-t border-[#e8d0d6] bg-[#fffafb]">
                              <div className="overflow-hidden">
                                {groupCats.map((cat) => (
                                  <button
                                    key={cat}
                                    type="button"
                                    onClick={() => {
                                      setActiveTopicGroup(group);
                                      setActiveCategory(cat);
                                      setCurrentPage(1);
                                      setMobileTopicOpen(false);
                                    }}
                                    className={cn(
                                      'w-full truncate whitespace-nowrap border-b border-[#f0e3e7] px-3 py-2 pl-4 text-left text-sm transition-colors last:border-b-0',
                                      activeTopicGroup === group && activeCategory === cat
                                        ? 'border-l-2 border-l-[#e2c2cb] bg-[#fff4f7] font-semibold text-[#7a2038]'
                                        : 'bg-white/70 font-normal text-foreground/85 hover:bg-primary/[0.06]'
                                    )}
                                  >
                                    {cat}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[252px_minmax(0,1fr)] xl:gap-0">
            <aside className="hidden border border-primary/20 bg-white p-2 shadow-md xl:block">
              <p className="border-b border-[#e7d9dd] px-2 pb-2 text-base font-extrabold uppercase tracking-[0.06em] text-[#6b1b31]">
                {t('Loại chủ đề', 'Grupo de tema')}
              </p>
              <div className="space-y-0 overflow-hidden border border-[#e7d9dd] bg-white">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTopicGroup('');
                    setActiveCategory('');
                    setExpandedTopicGroup('');
                    setCurrentPage(1);
                  }}
                  className={cn(
                    'w-full border-b border-[#ece6e8] bg-white px-3 py-2 text-left text-[15px] font-semibold',
                    !activeTopicGroup
                      ? 'bg-[#8f223d] text-white'
                      : 'text-[#6b1b31] hover:bg-[#fafafa]'
                  )}
                >
                  {t('Tất cả', 'Todos')}
                </button>
                {quizTopicGroups.map((group) => {
                  const isOpen = expandedTopicGroup === group;
                  const groupCats = quizCategoriesByGroup[group] || [];
                  return (
                    <div
                      key={group}
                      className={cn(
                        'border-b border-[#ece6e8] last:border-b-0 bg-white'
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTopicGroup(group);
                          // Parent click = show all quizzes in this topic group.
                          setActiveCategory('');
                          if (!isOpen) {
                            setExpandedTopicGroup(group);
                          } else {
                            setExpandedTopicGroup('');
                          }
                          setCurrentPage(1);
                        }}
                        className={cn(
                          'flex w-full items-center justify-between bg-white px-3 py-2.5 text-left text-[17px] font-semibold transition-colors',
                          activeTopicGroup === group
                            ? 'bg-[#8f223d] text-white'
                            : 'text-[#6b1b31] hover:bg-[#fafafa]'
                        )}
                      >
                        <span>{group}</span>
                        <span
                          className={cn(
                            'text-xl leading-none',
                            activeTopicGroup === group ? 'text-white' : 'text-primary/80'
                          )}
                        >
                          {isOpen ? '▾' : '▸'}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="border-t border-[#ece6e8] bg-white">
                          <div className="overflow-hidden border-t border-[#ece6e8] bg-white">
                          {groupCats.map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                setActiveTopicGroup(group);
                                setActiveCategory(cat);
                                setCurrentPage(1);
                              }}
                              className={cn(
                                'w-full truncate whitespace-nowrap border-b border-[#f0e3e7] bg-white px-3 py-2 text-left text-sm font-normal last:border-b-0',
                                activeTopicGroup === group && activeCategory === cat
                                  ? 'bg-[#f6d4dd] text-[#7a2038]'
                                  : 'text-foreground hover:bg-[#fafafa]'
                              )}
                            >
                              {cat}
                            </button>
                          ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </aside>
            <div>

          {loading && (
            <p className="text-sm text-muted-foreground">{t('Đang tải...', 'Cargando...')}</p>
          )}
          {!loading && error && <p className="text-sm text-destructive">{error}</p>}

          {!loading && !error && (
            <>
              {filtered.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {quizzes.length === 0
                    ? t('Chưa có bài thi.', 'No hay exámenes.')
                    : t('Không có bài thi phù hợp.', 'No hay exámenes que coincidan.')}
                </p>
              )}
              {filtered.length > 0 && (
              <>
              <div className="mb-3 hidden border border-[#ece6e8] bg-white px-3 py-2 text-xs sm:text-sm xl:block">
                <span className="font-bold text-[#6b1b31]">
                  {activeTopicGroup || t('Tất cả loại chủ đề', 'Todos los grupos')}
                </span>
                {!activeCategory && (
                  <>
                    {' '}
                    &gt;{' '}
                    <span className="font-normal text-[#7a2038]">
                      {t('Tất cả bài test', 'Todos los exámenes')}
                    </span>
                  </>
                )}
                {activeCategory && (
                  <>
                    {' '}
                    &gt;{' '}
                    <span className="font-normal text-[#7a2038]">{activeCategory}</span>
                  </>
                )}
              </div>
              <div className="grid grid-cols-1 gap-5 px-3 sm:grid-cols-2 sm:px-4 2xl:grid-cols-3 md:gap-6 xl:px-0 xl:pl-3">
                {pagedQuizzes.map((quiz) => (
                  <div key={quiz.id}>
                    <Card className="h-full overflow-hidden border border-primary/10 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
                      <CardContent className="flex h-full flex-row items-stretch gap-0 p-0">
                        <div className="flex w-[4.75rem] shrink-0 flex-col items-center justify-center self-stretch border-r border-foreground/10 bg-primary/[0.07] px-1.5 py-2 sm:w-[5.25rem] md:w-28">
                          <div className="flex flex-col items-center gap-0.5">
                            <img
                              src={QUIZZES_ILLUSTRATION_SRC}
                              alt=""
                              className="h-auto max-h-[4rem] w-full object-contain object-center sm:max-h-[4.25rem]"
                              aria-hidden
                            />
                            <div className="flex flex-col items-center gap-0 text-center leading-none">
                              <span className="font-display text-lg font-bold tabular-nums text-primary sm:text-xl">
                                {quiz.total_questions}
                              </span>
                              <span className="max-w-[4.5rem] text-[9px] font-semibold leading-tight text-primary/85">
                                {t('câu hỏi', 'preguntas')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col p-4 md:p-5">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          {quiz.quiz_topic_group_name && (
                            <span className="rounded border border-[#e2c2cb] bg-[#fff4f7] px-2 py-0.5 text-[11px] font-semibold text-[#7a2038]">
                              {quiz.quiz_topic_group_name}
                            </span>
                          )}
                          {quiz.category_name && (
                            <span className="rounded border border-primary/25 bg-primary/[0.08] px-2 py-0.5 text-[11px] font-semibold text-primary">
                              {quiz.category_name}
                            </span>
                          )}
                        </div>

                        <h3 className="mb-1.5 font-display text-[15px] font-bold leading-snug text-foreground sm:text-base md:text-[1.1rem]">
                          {quiz.title}
                        </h3>
                        <p className="mb-4 flex-1 text-sm leading-relaxed text-foreground/68 line-clamp-2">
                          {quiz.description || t('Không có mô tả', 'Sin descripción')}
                        </p>

                        <div className="mt-auto flex gap-2 border-t border-foreground/10 pt-4">
                          <Link to={`/quiz/${quiz.id}?mode=practice`} className="min-w-0 flex-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-9 w-full rounded-md border-2 border-[#F59E0B]/70 bg-[#F59E0B]/12 text-[12px] font-semibold text-amber-950 shadow-sm transition-colors hover:border-[#F59E0B] hover:bg-[#F59E0B]/22 hover:text-amber-950 focus-visible:ring-amber-500/40 dark:border-amber-500/60 dark:bg-[#F59E0B]/16 dark:text-amber-50 dark:hover:bg-[#F59E0B]/26 dark:hover:text-amber-50 sm:text-[13px]"
                            >
                              {t('Luyện tập', 'Práctica')}
                            </Button>
                          </Link>
                          <Link to={`/quiz/${quiz.id}?mode=exam`} className="min-w-0 flex-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-10 w-full rounded-md border-2 border-[#b91c1c] bg-[#DC2626] text-[12px] font-bold text-white shadow-[0_6px_16px_rgba(220,38,38,0.38)] transition-all duration-150 hover:scale-[1.02] hover:border-[#991b1b] hover:bg-[#b91c1c] hover:text-white focus-visible:ring-red-600/50 dark:bg-[#DC2626] dark:hover:bg-[#ef4444] sm:text-[13px]"
                            >
                              {t('Bắt đầu thi', 'Empezar examen')}
                            </Button>
                          </Link>
                        </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
              </>
              )}

              {filtered.length > 0 && (
                <div className="mt-8 flex flex-col items-center gap-4 border-t-2 border-primary/25 bg-card px-3 py-5 shadow-[0_-2px_12px_rgba(45,38,36,0.06)] sm:gap-5 sm:px-4 rounded-b-xl">
                  <p className="text-center text-sm font-semibold tabular-nums text-foreground sm:text-[15px]">
                    {t('Trang', 'Página')} {effectivePage}/{totalPages} · {filtered.length}{' '}
                    {t('bài thi', 'exámenes')}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-10 min-h-10 border-primary/30 bg-background px-4 text-sm font-semibold text-foreground shadow-sm hover:bg-primary/[0.08] sm:text-[15px]"
                      onClick={() => goToPage(effectivePage - 1)}
                      disabled={effectivePage <= 1}
                    >
                      {t('Trước', 'Anterior')}
                    </Button>
                    {pageWindow.map((page) => (
                      <Button
                        key={page}
                        size="sm"
                        variant="outline"
                        className={cn(
                          'h-10 min-h-10 min-w-10 border-primary/25 px-3 text-sm font-semibold shadow-sm sm:min-w-11 sm:text-[15px]',
                          page === effectivePage
                            ? 'border-primary/50 bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                            : 'bg-card text-foreground hover:bg-primary/[0.08]'
                        )}
                        onClick={() => goToPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-10 min-h-10 border-primary/30 bg-background px-4 text-sm font-semibold text-foreground shadow-sm hover:bg-primary/[0.08] sm:text-[15px]"
                      onClick={() => goToPage(effectivePage + 1)}
                      disabled={effectivePage >= totalPages}
                    >
                      {t('Sau', 'Siguiente')}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
            </div>
          </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Quizzes;
