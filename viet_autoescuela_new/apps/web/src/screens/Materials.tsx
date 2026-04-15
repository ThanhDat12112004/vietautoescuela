'use client';

import { Footer, Navbar } from '@/components/layout';
import { LocaleLink } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/hooks/useLanguage';
import { useMaterialPostReadVersion } from '@/hooks/useMaterialPostReadVersion';
import { useRouterSearchParams } from '@/hooks/useRouterSearchParams';
import { formatUserFacingApiError } from '@/lib/api/format-api-error';
import { getMaterialPostsBySubject, getSubjects, type MaterialPostListItem, type Subject } from '@/lib/api/materials';
import { getStoredAuth, userHasPremium } from '@/lib/auth';
import { isMaterialPostRead } from '@/lib/material-post-read';
import { isPremiumContentFlag } from '@/lib/premium-content-flag';
import { cn } from '@/lib/utils';
import { useQueries, useQuery } from '@tanstack/react-query';
import { MaterialStudyArticleCard } from '@/features/materials/public';
import { materialStudyCardCoverSrc } from '@/features/materials/public/material-card-covers';
import { ChevronDown, Search } from 'lucide-react';
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';

const ITEMS_PER_PAGE = 10;

const TOPIC_PARAM_ALL = 'all';
const TOPIC_PARAM_UNGROUPED = '_ungrouped';

type MaterialRow = MaterialPostListItem & {
  subjectId: number;
  subjectName: string;
  topicGroupLabel: string;
};

function subjectTopicKey(subject: Subject) {
  return String(subject.material_topic_group_name || '').trim();
}

const Materials = () => {
  const { tk, lang } = useLanguage();
  const premiumOk = userHasPremium(getStoredAuth()?.user);
  const [searchParams, setSearchParams] = useRouterSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTopicGroup, setActiveTopicGroup] = useState<string | null>(null);
  const [activeSubjectId, setActiveSubjectId] = useState<number | null>(null);
  const [expandedTopicGroup, setExpandedTopicGroup] = useState<string | null>(null);
  const [mobileTopicOpen, setMobileTopicOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [readProgressFilter, setReadProgressFilter] = useState<'all' | 'done' | 'todo'>('all');
  const prevSearchForPage = useRef<string | undefined>(undefined);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const vipArticleLockHint =
    lang === 'es'
      ? 'Desbloquea el plan premium para leer este material.'
      : lang === 'en'
        ? 'Unlock premium plan to read this material.'
        : 'Mở khóa gói nâng cao để đọc tài liệu này.';

  const {
    data: subjects = [],
    isLoading: subjectsLoading,
    error: subjectsError,
  } = useQuery<Subject[]>({
    queryKey: ['materials', 'subjects', lang],
    queryFn: () => getSubjects(lang),
    staleTime: 60_000,
  });

  const error = useMemo(
    () =>
      subjectsError
        ? subjectsError instanceof Error
          ? formatUserFacingApiError(lang, subjectsError)
          : tk('materialsPage.errTopics')
        : '',
    [subjectsError, lang, tk]
  );

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate search from URL once
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  const topicGroups = useMemo(() => {
    const keys = subjects.map((s) => subjectTopicKey(s));
    const unique = Array.from(new Set(keys));
    unique.sort((a, b) => {
      if (a === '') return 1;
      if (b === '') return -1;
      return a.localeCompare(b, undefined, { sensitivity: 'base' });
    });
    return unique;
  }, [subjects]);

  const subjectsByGroup = useMemo(() => {
    const result: Record<string, Subject[]> = {};
    for (const s of subjects) {
      const k = subjectTopicKey(s);
      if (!result[k]) result[k] = [];
      result[k].push(s);
    }
    for (const k of Object.keys(result)) {
      result[k].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    }
    return result;
  }, [subjects]);

  /** Chỉ tag nhóm khi nhóm được đặt premium — không tag vì chỉ chủ đề con premium. */
  const topicGroupHasPremiumSubject = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const s of subjects) {
      const k = subjectTopicKey(s);
      if (String(s.material_topic_group_access_tier || '').toLowerCase() === 'premium') {
        map[k] = true;
      }
    }
    return map;
  }, [subjects]);

  const displayTopicLabel = useCallback(
    (key: string) =>
      key === ''
        ? tk('materialsPage.unassigned')
        : key,
    [tk]
  );

  const requestedPage = useMemo(() => {
    const raw = Number(searchParams.get('page'));
    return Number.isInteger(raw) && raw > 0 ? raw : 1;
  }, [searchParams]);

  useEffect(() => {
    setCurrentPage(requestedPage);
  }, [requestedPage]);

  const requestedReadProgress = useMemo(() => {
    const raw = String(searchParams.get('progress') || '').trim().toLowerCase();
    return raw === 'done' || raw === 'todo' || raw === 'all' ? raw : '';
  }, [searchParams]);

  useEffect(() => {
    if (!requestedReadProgress) return;
    setReadProgressFilter(requestedReadProgress as 'all' | 'done' | 'todo');
  }, [requestedReadProgress]);

  useEffect(() => {
    if (!mobileSearchOpen) return;
    const id = window.requestAnimationFrame(() => {
      mobileSearchInputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [mobileSearchOpen]);

  const parseTopicParam = (raw: string | null): string | null => {
    const s = String(raw || '').trim();
    if (!s || s.toLowerCase() === TOPIC_PARAM_ALL) return null;
    if (s === TOPIC_PARAM_UNGROUPED) return '';
    return s;
  };

  const requestedTopicGroup = useMemo(
    () => parseTopicParam(searchParams.get('topic_group')),
    [searchParams]
  );

  const requestedSubjectId = useMemo(() => {
    const raw = Number(searchParams.get('subject'));
    return Number.isInteger(raw) && raw > 0 ? raw : null;
  }, [searchParams]);

  useEffect(() => {
    if (requestedTopicGroup === null) {
      setActiveTopicGroup(null);
      return;
    }
    if (topicGroups.includes(requestedTopicGroup)) {
      setActiveTopicGroup(requestedTopicGroup);
      setExpandedTopicGroup(requestedTopicGroup);
    }
  }, [requestedTopicGroup, topicGroups]);

  useEffect(() => {
    if (requestedSubjectId != null) return;
    setActiveSubjectId(null);
  }, [requestedSubjectId]);

  useEffect(() => {
    if (requestedSubjectId == null) return;
    const sub = subjects.find((s) => s.id === requestedSubjectId);
    if (!sub) return;
    const k = subjectTopicKey(sub);
    setActiveTopicGroup(k);
    setExpandedTopicGroup(k);
    setActiveSubjectId(requestedSubjectId);
  }, [requestedSubjectId, subjects]);

  const applyTopicScope = (groupKey: string | null, subjectId: number | null) => {
    setActiveTopicGroup(groupKey);
    setActiveSubjectId(subjectId);
    setCurrentPage(1);
    const next = new URLSearchParams(searchParams);
    next.delete('page');
    if (groupKey === null) {
      next.delete('topic_group');
    } else if (groupKey === '') {
      next.set('topic_group', TOPIC_PARAM_UNGROUPED);
    } else {
      next.set('topic_group', groupKey);
    }
    if (subjectId == null) {
      next.delete('subject');
    } else {
      next.set('subject', String(subjectId));
    }
    setSearchParams(next, { replace: true });
  };

  const applyReadProgressFilter = useCallback(
    (value: 'all' | 'done' | 'todo') => {
      setReadProgressFilter(value);
      setCurrentPage(1);
      const next = new URLSearchParams(searchParams);
      if (value === 'all') {
        next.delete('progress');
      } else {
        next.set('progress', value);
      }
      next.delete('page');
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const subjectIdsForFetch = useMemo(() => {
    if (!subjects.length) return [];
    let scoped: Subject[];
    if (activeTopicGroup === null) {
      scoped = subjects;
    } else {
      scoped = subjects.filter((s) => subjectTopicKey(s) === activeTopicGroup);
    }
    if (activeSubjectId != null) {
      const one = scoped.find((s) => s.id === activeSubjectId);
      return one ? [one.id] : [];
    }
    return scoped.map((s) => s.id);
  }, [subjects, activeTopicGroup, activeSubjectId]);

  const materialQueries = useQueries({
    queries: subjectIdsForFetch.map((subjectId) => ({
      queryKey: ['materials', 'subject', subjectId, lang] as const,
      queryFn: () => getMaterialPostsBySubject(subjectId, lang),
      enabled: subjectIdsForFetch.length > 0 && !subjectsLoading,
      staleTime: 60_000,
    })),
  });

  const materialsLoading =
    subjectIdsForFetch.length > 0 && materialQueries.some((q) => q.isLoading);
  const materialsErrorMsg = useMemo(() => {
    const err = materialQueries.find((q) => q.error)?.error;
    if (!err) return '';
    return err instanceof Error
      ? formatUserFacingApiError(lang, err)
      : tk('materialsPage.errMaterials');
  }, [materialQueries, lang, tk]);

  const materialRows = useMemo((): MaterialRow[] => {
    const rows: MaterialRow[] = [];
    subjectIdsForFetch.forEach((subjectId, idx) => {
      const data = materialQueries[idx]?.data;
      const sub = subjects.find((s) => s.id === subjectId);
      if (!data || !sub) return;
      const topicGroupLabel = displayTopicLabel(subjectTopicKey(sub));
      for (const m of data) {
        rows.push({
          ...m,
          subjectId,
          subjectName: sub.name,
          topicGroupLabel,
        });
      }
    });
    /** Giữ thứ tự API: sort_order ASC trong từng chủ đề, theo thứ tự subjectIdsForFetch. */
    return rows;
  }, [subjectIdsForFetch, materialQueries, subjects, displayTopicLabel]);

  const materialReadVersion = useMaterialPostReadVersion();

  const readScopedRows = useMemo(() => {
    if (readProgressFilter === 'all') return materialRows;
    return materialRows.filter((row) => {
      const done = isMaterialPostRead(row.subjectId, row.id);
      return readProgressFilter === 'done' ? done : !done;
    });
  }, [materialRows, readProgressFilter, materialReadVersion]);

  const readProgressCounts = useMemo(() => {
    const done = materialRows.filter((row) => isMaterialPostRead(row.subjectId, row.id)).length;
    return {
      all: materialRows.length,
      done,
      todo: Math.max(0, materialRows.length - done),
    };
  }, [materialRows, materialReadVersion]);

  const normalizeForSearch = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const filtered = useMemo(() => {
    const q = normalizeForSearch(deferredSearchQuery);
    return readScopedRows.filter((row) => {
      if (!q) return true;
      const blob = normalizeForSearch(
        [row.title, row.description || '', row.subjectName, row.topicGroupLabel].join(' ')
      );
      return blob.includes(q);
    });
  }, [deferredSearchQuery, readScopedRows]);

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

  const pagedRows = useMemo(() => {
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

  useEffect(() => {
    if (activeTopicGroup == null) return;
    setExpandedTopicGroup((prev) => prev ?? activeTopicGroup);
  }, [activeTopicGroup]);

  const mobileTopicSummary = useMemo(() => {
    if (activeTopicGroup === null) {
      return tk('listing.allGroupsAndTopics');
    }
    if (activeSubjectId == null) {
      return displayTopicLabel(activeTopicGroup);
    }
    const sub = subjects.find((s) => s.id === activeSubjectId);
    return sub ? `${displayTopicLabel(activeTopicGroup)} › ${sub.name}` : displayTopicLabel(activeTopicGroup);
  }, [activeSubjectId, activeTopicGroup, subjects, displayTopicLabel, tk]);

  const activeScopeDescription = useMemo(() => {
    if (activeSubjectId != null) {
      const sub = subjects.find((s) => s.id === activeSubjectId);
      return String(sub?.description || '').trim();
    }
    if (activeTopicGroup !== null) {
      const inGroup = subjects.find((s) => subjectTopicKey(s) === activeTopicGroup);
      return String(inGroup?.material_topic_group_description || '').trim();
    }
    return '';
  }, [activeSubjectId, activeTopicGroup, subjects]);

  const listLoading = subjectsLoading || materialsLoading;
  const listError = error || materialsErrorMsg;

  return (
    <div className="app-page flex min-h-screen flex-col bg-white">
      <Navbar />
      <div className="flex flex-1 flex-col">
        <div className="border-b-2 border-primary/25 bg-card">
          <div className="w-full px-3 py-5 sm:px-4 md:py-6 lg:px-5">
            <div className="max-w-3xl border-l-[3px] border-primary/60 pl-3 sm:pl-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/80">
                {tk('materialsPage.eyebrow')}
              </p>
              <h1 className="mt-1.5 font-display text-[1.65rem] font-bold leading-tight tracking-tight text-foreground md:text-[2rem]">
                {tk('materialsPage.heroTitle')}
              </h1>
              <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-foreground/72 md:text-[0.97rem]">
                {tk('materialsPage.heroDesc')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-1 flex-col bg-white">
          <div className="w-full border-b border-primary/20 bg-card px-3 py-3.5 font-sans shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] sm:px-4 xl:px-5">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,230px)_minmax(0,1fr)] lg:items-end lg:gap-4">
              <div className="order-2 min-w-0 lg:order-1">
                <div className="flex items-center justify-between gap-2 lg:block">
                  <span className="block min-w-0 text-xs font-bold uppercase tracking-[0.06em] text-[#6b1b31]">
                    {tk('materialsPage.statusLabel')}
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
                    aria-controls="material-search-mobile"
                    aria-label={tk('listing.openSearchAria')}
                  >
                    <Search className="h-[1.15rem] w-[1.15rem]" strokeWidth={2.25} aria-hidden />
                  </button>
                </div>
                <Select
                  value={readProgressFilter}
                  onValueChange={(v) => applyReadProgressFilter(v as 'all' | 'done' | 'todo')}
                >
                  <SelectTrigger
                    className="mt-1.5 h-11 w-full rounded-lg border-primary/25 bg-white/95 text-base font-semibold text-foreground shadow-[0_8px_22px_rgba(143,34,61,0.12)] ring-1 ring-white/70 focus:ring-primary/35 max-lg:text-[1.05rem]"
                    aria-label={tk('materialsPage.readFilterAria')}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="start" className="rounded-xl">
                    <SelectItem value="all" className="font-semibold">
                      {tk('listing.all')}{' '}
                      <span className="tabular-nums text-muted-foreground">
                        ({readProgressCounts.all})
                      </span>
                    </SelectItem>
                    <SelectItem value="done" className="font-semibold">
                      {tk('materialsPage.readDone')}{' '}
                      <span className="tabular-nums font-bold text-[#b91c1c]">
                        ({readProgressCounts.done})
                      </span>
                    </SelectItem>
                    <SelectItem value="todo" className="font-semibold">
                      {tk('materialsPage.readUnread')}{' '}
                      <span className="tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                        ({readProgressCounts.todo})
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div
                  id="material-search-mobile"
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
                      placeholder={tk('materialsPage.searchPh')}
                      aria-label={tk('listing.search')}
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
                      htmlFor="material-search"
                      className="hidden shrink-0 text-xs font-bold uppercase tracking-[0.06em] text-[#6b1b31] lg:block"
                    >
                      {tk('listing.search')}
                    </label>
                    <div className="relative min-w-0 flex-1">
                      <span
                        aria-hidden
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-primary/70"
                      >
                        🔍
                      </span>
                      <Input
                        id="material-search"
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={tk('materialsPage.searchPh')}
                        aria-label={tk('listing.search')}
                        className="h-12 w-full rounded-lg border border-primary/25 bg-white/95 pl-10 pr-4 text-sm font-semibold text-foreground placeholder:text-muted-foreground/70 shadow-[0_8px_22px_rgba(143,34,61,0.12)] ring-1 ring-white/70 backdrop-blur-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/35"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full px-0 pb-0 pt-0 max-xl:px-0 xl:px-0">
            <div className="w-full border-b border-primary/20 bg-card px-3 py-3.5 font-sans shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] sm:px-4 xl:hidden">
              <Popover modal={false} open={mobileTopicOpen} onOpenChange={setMobileTopicOpen}>
                <span className="block text-xs font-bold uppercase tracking-[0.06em] text-[#6b1b31]">
                  {tk('listing.topicGroupAndTopic')}
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
                    aria-label={`${tk('listing.topicGroupAndTopic')}: ${mobileTopicSummary}`}
                  >
                    <span className="block min-w-0 truncate whitespace-nowrap text-left text-base leading-snug max-lg:text-[1.05rem] font-semibold text-[#6b1b31]">
                      {mobileTopicSummary}
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
                          applyTopicScope(null, null);
                          setMobileTopicOpen(false);
                        }}
                        className={cn(
                          'w-full border-b border-[#e8d0d6] px-3 py-2.5 text-left text-[15px] font-semibold transition-colors',
                          activeTopicGroup === null
                            ? 'bg-[#fff4f7] text-[#7a2038]'
                            : 'bg-white/90 text-[#6b1b31] hover:bg-[#fff4f7]/85'
                        )}
                      >
                        {tk('listing.all')}
                      </button>
                      {topicGroups.map((groupKey) => {
                        const isOpen = expandedTopicGroup === groupKey;
                        const groupSubjects = subjectsByGroup[groupKey] || [];
                        return (
                          <div key={groupKey || 'ungrouped'} className="border-b border-[#e8d0d6] last:border-b-0 bg-white/90">
                            <button
                              type="button"
                              onClick={() => {
                                applyTopicScope(groupKey, null);
                                if (!isOpen) {
                                  setExpandedTopicGroup(groupKey);
                                } else {
                                  setExpandedTopicGroup(null);
                                }
                              }}
                              className={cn(
                                'flex w-full items-center justify-between px-3 py-2.5 text-left text-[15px] font-semibold transition-colors',
                                activeTopicGroup === groupKey
                                  ? 'bg-[#fff4f7] text-[#7a2038]'
                                  : 'bg-white/80 text-[#6b1b31] hover:bg-[#fff4f7]/75'
                              )}
                            >
                              <span className="flex min-w-0 flex-1 items-center gap-1.5 pr-2">
                                <span className="min-w-0 truncate">{displayTopicLabel(groupKey)}</span>
                                {topicGroupHasPremiumSubject[groupKey] ? (
                                  <span className="shrink-0 rounded bg-amber-100 px-1 py-px text-[9px] font-bold uppercase text-amber-950">
                                    {tk('listing.content_tier_advanced')}
                                  </span>
                                ) : null}
                              </span>
                              <span
                                className={cn(
                                  'shrink-0 text-lg leading-none',
                                  activeTopicGroup === groupKey ? 'text-[#7a2038]' : 'text-primary/65'
                                )}
                              >
                                {isOpen ? '▾' : '▸'}
                              </span>
                            </button>
                            {isOpen && (
                              <div className="border-t border-[#e8d0d6] bg-[#fffafb]">
                                <div className="overflow-hidden">
                                  {groupSubjects.map((sub) => {
                                    const subPremiumLocked =
                                      isPremiumContentFlag(sub.requires_premium) &&
                                      !premiumOk;
                                    return (
                                    <button
                                      key={sub.id}
                                      type="button"
                                      onClick={() => {
                                        applyTopicScope(groupKey, sub.id);
                                        setMobileTopicOpen(false);
                                      }}
                                      className={cn(
                                        'w-full truncate whitespace-nowrap border-b border-[#f0e3e7] px-3 py-2 pl-4 text-left text-sm transition-colors last:border-b-0',
                                        activeTopicGroup === groupKey && activeSubjectId === sub.id
                                          ? 'border-l-2 border-l-[#e2c2cb] bg-[#fff4f7] font-semibold text-[#7a2038]'
                                          : 'bg-white/70 font-normal text-foreground/85 hover:bg-primary/[0.06]',
                                        subPremiumLocked &&
                                          'opacity-[0.85] saturate-[0.88] contrast-[0.98]'
                                      )}
                                    >
                                      <span className="flex min-w-0 items-center gap-1.5">
                                        <span className="truncate">{sub.name}</span>
                                        {isPremiumContentFlag(sub.requires_premium) ? (
                                          <span className="shrink-0 rounded bg-amber-100 px-1 py-px text-[9px] font-bold uppercase text-amber-950">
                                            {tk('listing.content_tier_advanced')}
                                          </span>
                                        ) : null}
                                      </span>
                                    </button>
                                    );
                                  })}
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
                  {tk('listing.topicGroup')}
                </p>
                <div className="space-y-0 overflow-hidden border border-[#e7d9dd] bg-white">
                  <button
                    type="button"
                    onClick={() => applyTopicScope(null, null)}
                    className={cn(
                      'w-full border-b border-[#ece6e8] bg-white px-3 py-2 text-left text-[15px] font-semibold',
                      activeTopicGroup === null
                        ? 'bg-[#8f223d] text-white'
                        : 'text-[#6b1b31] hover:bg-[#fafafa]'
                    )}
                  >
                    {tk('listing.all')}
                  </button>
                  {topicGroups.map((groupKey) => {
                    const isOpen = expandedTopicGroup === groupKey;
                    const groupSubjects = subjectsByGroup[groupKey] || [];
                    return (
                      <div key={groupKey || 'ungrouped'} className="border-b border-[#ece6e8] last:border-b-0 bg-white">
                        <button
                          type="button"
                          onClick={() => {
                            applyTopicScope(groupKey, null);
                            if (!isOpen) {
                              setExpandedTopicGroup(groupKey);
                            } else {
                              setExpandedTopicGroup(null);
                            }
                          }}
                          className={cn(
                            'flex w-full items-center justify-between bg-white px-3 py-2.5 text-left text-[17px] font-semibold transition-colors',
                            activeTopicGroup === groupKey
                              ? 'bg-[#8f223d] text-white'
                              : 'text-[#6b1b31] hover:bg-[#fafafa]'
                          )}
                        >
                          <span className="flex min-w-0 flex-1 items-center gap-1.5 pr-2">
                            <span className="min-w-0 truncate">{displayTopicLabel(groupKey)}</span>
                            {topicGroupHasPremiumSubject[groupKey] ? (
                              <span
                                className={cn(
                                  'shrink-0 rounded px-1 py-px text-[9px] font-bold uppercase',
                                  activeTopicGroup === groupKey
                                    ? 'border border-white/40 bg-white/20 text-amber-100'
                                    : 'bg-amber-100 text-amber-950'
                                )}
                              >
                                {tk('listing.content_tier_advanced')}
                              </span>
                            ) : null}
                          </span>
                          <span
                            className={cn(
                              'text-xl leading-none',
                              activeTopicGroup === groupKey ? 'text-white' : 'text-primary/80'
                            )}
                          >
                            {isOpen ? '▾' : '▸'}
                          </span>
                        </button>
                        {isOpen && (
                          <div className="border-t border-[#ece6e8] bg-white">
                            <div className="overflow-hidden border-t border-[#ece6e8] bg-white">
                              {groupSubjects.map((sub) => {
                                const subPremiumLocked =
                                  isPremiumContentFlag(sub.requires_premium) &&
                                  !premiumOk;
                                return (
                                <button
                                  key={sub.id}
                                  type="button"
                                  onClick={() => applyTopicScope(groupKey, sub.id)}
                                  className={cn(
                                    'w-full truncate whitespace-nowrap border-b border-[#f0e3e7] bg-white px-3 py-2 text-left text-sm font-normal last:border-b-0',
                                    activeTopicGroup === groupKey && activeSubjectId === sub.id
                                      ? 'bg-[#f6d4dd] text-[#7a2038]'
                                      : 'text-foreground hover:bg-[#fafafa]',
                                    subPremiumLocked &&
                                      'opacity-[0.85] saturate-[0.88] contrast-[0.98]'
                                  )}
                                >
                                  <span className="flex min-w-0 items-center gap-1.5">
                                    <span className="truncate">{sub.name}</span>
                                    {isPremiumContentFlag(sub.requires_premium) ? (
                                      <span className="shrink-0 rounded bg-amber-100 px-1 py-px text-[9px] font-bold uppercase text-amber-950">
                                        {tk('listing.content_tier_advanced')}
                                      </span>
                                    ) : null}
                                  </span>
                                </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </aside>

              <div>
                {listLoading && (
                  <p className="text-sm text-muted-foreground">{tk('common.loading')}</p>
                )}
                {!listLoading && listError && (
                  <p className="text-sm text-destructive">{listError}</p>
                )}

                {!listLoading && !listError && (
                  <>
                    {filtered.length === 0 && (
                      <p className="py-8 text-center text-sm text-muted-foreground">
                        {materialRows.length === 0
                          ? tk('materialsPage.empty')
                          : tk('materialsPage.noMatch')}
                      </p>
                    )}
                    {filtered.length > 0 && (
                      <>
                        <div className="mb-0 rounded-none border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm sm:px-5">
                          <span className="font-semibold text-brand-heading">
                            {activeTopicGroup === null
                              ? tk('listing.allTopicGroups')
                              : displayTopicLabel(activeTopicGroup)}
                          </span>
                          <span className="mx-2 text-muted-foreground" aria-hidden>
                            /
                          </span>
                          {activeSubjectId == null ? (
                            <span className="text-muted-foreground">{tk('materialsPage.allMaterials')}</span>
                          ) : (
                            <span className="text-muted-foreground">
                              {subjects.find((s) => s.id === activeSubjectId)?.name || '—'}
                            </span>
                          )}
                          {activeScopeDescription ? (
                            <p className="mt-1.5 text-sm leading-relaxed text-foreground/75">
                              {activeScopeDescription}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex w-full max-w-4xl flex-col gap-0 xl:max-w-none">
                          {pagedRows.map((row, idx) => {
                            const locked =
                              row.content_locked === true ||
                              (isPremiumContentFlag(row.requires_premium) && !premiumOk);
                            const readHref = `/materials/${row.subjectId}/${row.id}`;
                            return (
                              <MaterialStudyArticleCard
                                key={`${row.id}-${row.subjectId}`}
                                title={row.title}
                                description={row.description || ''}
                                topicGroupLabel={row.topicGroupLabel}
                                subjectName={row.subjectName}
                                illustrationSrc={materialStudyCardCoverSrc(row.subjectId, row.id)}
                                readHref={readHref}
                                locked={locked}
                                tightTop={idx === 0}
                                tierAdvancedLabel={
                                  isPremiumContentFlag(row.requires_premium)
                                    ? tk('listing.content_tier_advanced')
                                    : null
                                }
                                readArticleLabel={tk('materialsPage.readArticle')}
                                lockedCtaLabel={tk('listing.content_tier_advanced')}
                                lockedHintLabel={vipArticleLockHint}
                                noDescriptionLabel={tk('listing.noDescription')}
                              />
                            );
                          })}
                        </div>
                      </>
                    )}

                    {filtered.length > 0 && (
                      <div className="mt-4 flex flex-col items-center gap-3 border-t-2 border-primary/25 bg-card px-3 py-3 shadow-[0_-2px_12px_rgba(45,38,36,0.06)] sm:gap-3 sm:px-4 sm:py-3.5">
                        <p className="text-center text-sm font-semibold tabular-nums text-foreground sm:text-[15px]">
                          {tk('listing.page')} {effectivePage}/{totalPages} · {filtered.length}{' '}
                          {tk('materialsPage.items')}
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-10 min-h-10 border-2 border-[#8f223d]/45 bg-white px-4 text-sm font-bold text-[#5a1428] shadow-sm hover:border-[#7a2038] hover:bg-[#fff4f7] disabled:border-muted-foreground/25 disabled:text-muted-foreground sm:text-[15px]"
                            onClick={() => goToPage(effectivePage - 1)}
                            disabled={effectivePage <= 1}
                          >
                            {tk('listing.previous')}
                          </Button>
                          {pageWindow.map((page) => (
                            <Button
                              key={page}
                              size="sm"
                              variant="outline"
                              className={cn(
                                'h-10 min-h-10 min-w-10 border-2 px-3 text-sm font-bold shadow-sm sm:min-w-11 sm:text-[15px]',
                                page === effectivePage
                                  ? 'border-[#5a1428] bg-[#7a2038] text-white hover:bg-[#5a1428] hover:text-white'
                                  : 'border-[#8f223d]/40 bg-white text-[#6b1b31] hover:border-[#7a2038] hover:bg-[#fff4f7]'
                              )}
                              onClick={() => goToPage(page)}
                            >
                              {page}
                            </Button>
                          ))}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-10 min-h-10 border-2 border-[#8f223d]/45 bg-white px-4 text-sm font-bold text-[#5a1428] shadow-sm hover:border-[#7a2038] hover:bg-[#fff4f7] disabled:border-muted-foreground/25 disabled:text-muted-foreground sm:text-[15px]"
                            onClick={() => goToPage(effectivePage + 1)}
                            disabled={effectivePage >= totalPages}
                          >
                            {tk('listing.nextPage')}
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

export default Materials;
