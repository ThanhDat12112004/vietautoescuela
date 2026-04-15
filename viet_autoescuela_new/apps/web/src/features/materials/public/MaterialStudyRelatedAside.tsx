'use client';

import { LocaleLink } from '@/components/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { getMaterialPostsBySubject, getSubjects, type Subject } from '@/lib/api/materials';
import { cn } from '@/lib/utils';
import { tKey } from '@viet/i18n';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Lock } from 'lucide-react';
import { useMemo } from 'react';
import { buildMaterialsSubjectHref } from '@/features/materials/public/materials-study-links';

function isPremiumFlag(v: boolean | number | string | null | undefined) {
  return v === true || v === 1 || v === '1';
}

function subjectTopicKey(subject: Subject) {
  return String(subject.material_topic_group_name || '').trim();
}

type Props = {
  subjectId: number;
  currentPostId: number;
  /** Tiêu đề phụ (tên chủ đề) — optional */
  subjectHeading?: string | null;
  className?: string;
};

export function MaterialStudyRelatedAside({
  subjectId,
  currentPostId,
  subjectHeading,
  className,
}: Props) {
  const { lang, tk, tkFill } = useLanguage();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['materials', 'subject', subjectId, lang, 'related-aside'],
    queryFn: () => getMaterialPostsBySubject(subjectId, lang),
    enabled: Number.isFinite(subjectId) && subjectId > 0,
    staleTime: 60_000,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['materials', 'subjects', lang],
    queryFn: () => getSubjects(lang),
    staleTime: 60_000,
  });

  const items = useMemo(
    () => posts.filter((p) => Number(p.id) !== Number(currentPostId)).slice(0, 10),
    [posts, currentPostId]
  );

  /** Các chủ đề (môn) khác trong cùng loại chủ đề / nhóm với bài đang xem. */
  const otherSubjectsSameGroup = useMemo(() => {
    if (!subjects.length) return [];
    const current = subjects.find((s) => Number(s.id) === Number(subjectId));
    if (!current) return [];
    const g = subjectTopicKey(current);
    return subjects
      .filter((s) => subjectTopicKey(s) === g && Number(s.id) !== Number(subjectId))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
      .slice(0, 14);
  }, [subjects, subjectId]);

  return (
    <div
      className={cn(
        'flex flex-col lg:h-full lg:min-h-0 lg:flex-1 lg:gap-0',
        className
      )}
    >
      <nav
        className={cn(
          'flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border bg-card lg:rounded-none lg:border-0 lg:bg-transparent lg:shadow-none'
        )}
        aria-label={tKey(lang, 'materialsPage.postSidebar_relatedTitle')}
      >
        <div className="shrink-0 border-b border-primary/15 bg-primary/[0.06] px-3 py-2 sm:px-2 lg:rounded-none lg:px-3 lg:py-2.5">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary/90">
            {tKey(lang, 'materialsPage.postSidebar_relatedTitle')}
          </h2>
          {subjectHeading ? (
            <p className="mt-1.5 text-[13px] font-semibold leading-snug text-foreground/85 sm:mt-2 sm:text-sm">
              {tkFill('materialsPage.postSidebar_relatedTopicLine', { subject: subjectHeading })}
            </p>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2 pt-1.5 sm:px-1.5 lg:px-3 lg:pt-2">
          {isLoading ? (
            <p className="px-1 py-2 text-sm text-muted-foreground lg:px-0">
              {tKey(lang, 'common.loading')}
            </p>
          ) : items.length === 0 ? (
            <p className="px-1 py-2 text-sm leading-relaxed text-muted-foreground lg:px-0">
              {tKey(lang, 'materialsPage.postSidebar_relatedEmpty')}
            </p>
          ) : (
            <ul className="space-y-0.5">
              {items.map((p) => {
                const href = `/materials/${subjectId}/${p.id}`;
                const premium =
                  p.content_locked === true || isPremiumFlag(p.requires_premium);
                return (
                  <li key={p.id}>
                    <LocaleLink
                      href={href}
                      className="group flex items-center gap-1.5 rounded-none py-1.5 text-sm transition-colors hover:bg-muted/80 lg:px-0"
                    >
                      <ChevronRight
                        className="h-3.5 w-3.5 shrink-0 text-primary/70 opacity-80 group-hover:opacity-100"
                        aria-hidden
                      />
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5 leading-normal text-foreground">
                        <span className="break-normal font-medium text-brand-heading group-hover:text-primary">
                          {p.title}
                        </span>
                        {premium ? (
                          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-amber-900">
                            <Lock className="h-3 w-3" aria-hidden />
                            {tKey(lang, 'listing.content_tier_advanced')}
                          </span>
                        ) : null}
                      </span>
                    </LocaleLink>
                  </li>
                );
              })}
            </ul>
          )}

          {otherSubjectsSameGroup.length > 0 ? (
            <div
              className="mt-0 -mx-2 sm:-mx-1.5 lg:-mx-3"
              role="group"
              aria-label={tKey(lang, 'materialsPage.postSidebar_otherTopicTypesTitle')}
            >
              <div className="border-t border-primary/15 bg-primary/[0.06] px-3 py-2 sm:px-2 lg:px-3 lg:py-2">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary/90">
                  {tKey(lang, 'materialsPage.postSidebar_otherTopicTypesTitle')}
                </h2>
              </div>
              <ul className="mt-1 space-y-0.5 px-2 pb-1 sm:px-1.5 lg:px-3">
                {otherSubjectsSameGroup.map((s) => {
                  const premium = isPremiumFlag(s.requires_premium);
                  return (
                    <li key={s.id}>
                      <LocaleLink
                        href={buildMaterialsSubjectHref(s)}
                        className="group flex items-center gap-1.5 rounded-none py-1.5 text-sm transition-colors hover:bg-muted/80 lg:px-0"
                      >
                        <ChevronRight
                          className="h-3.5 w-3.5 shrink-0 text-primary/65 opacity-80 group-hover:opacity-100"
                          aria-hidden
                        />
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5 leading-normal text-foreground">
                          <span className="break-normal font-medium leading-snug text-brand-heading group-hover:text-primary">
                            {s.name}
                          </span>
                          {premium ? (
                            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-amber-900">
                              <Lock className="h-3 w-3" aria-hidden />
                              {tKey(lang, 'listing.content_tier_advanced')}
                            </span>
                          ) : null}
                        </span>
                      </LocaleLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
      </nav>
    </div>
  );
}
