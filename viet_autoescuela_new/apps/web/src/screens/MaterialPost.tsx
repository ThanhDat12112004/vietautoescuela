'use client';

import { PremiumGoldCtaLink } from '@/components/marketing/PremiumLockedOverlayCta';
import { MaterialStudyPostLayout, MaterialStudyRelatedAside } from '@/features/materials/public';
import { MATERIAL_STUDY_PROSE } from '@/features/materials/public/material-study.typography';
import { useLanguage } from '@/hooks/useLanguage';
import { formatUserFacingApiError } from '@/lib/api/format-api-error';
import { getMaterialPostDetail } from '@/lib/api/materials';
import { markMaterialPostRead } from '@/lib/material-post-read';
import { useQuery } from '@tanstack/react-query';
import DOMPurify from 'isomorphic-dompurify';
import { cn } from '@/lib/utils';
import { useEffect, useMemo } from 'react';

export default function MaterialPostScreen({
  subjectId,
  postId,
}: {
  subjectId: number;
  postId: number;
}) {
  const { tk, lang } = useLanguage();

  const { data, error, isLoading } = useQuery({
    queryKey: ['materialPost', subjectId, postId, lang],
    queryFn: () => getMaterialPostDetail(subjectId, postId, lang, { bustCache: true }),
    enabled: Number.isFinite(subjectId) && subjectId > 0 && Number.isFinite(postId) && postId > 0,
    retry: false,
  });

  const errText = error instanceof Error ? formatUserFacingApiError(lang, error) : '';

  const safeHtml = useMemo(() => {
    if (!data?.body_html || data.content_locked) return '';
    return DOMPurify.sanitize(data.body_html, { USE_PROFILES: { html: true } });
  }, [data?.body_html, data?.content_locked]);

  useEffect(() => {
    if (!data || data.content_locked) return;
    markMaterialPostRead(subjectId, postId);
  }, [data, data?.content_locked, subjectId, postId]);

  const invalidIds = !Number.isFinite(subjectId) || subjectId <= 0 || !Number.isFinite(postId) || postId <= 0;

  const topicLabel = data?.topic_group_name?.trim() || '';
  const subjectLabel = data?.subject_name?.trim() || '';
  const metaLine =
    topicLabel && subjectLabel
      ? `${topicLabel} · ${subjectLabel}`
      : topicLabel || subjectLabel || null;

  return (
    <MaterialStudyPostLayout
      backLabel={tk('materialsPage.heroTitle')}
      metaLine={metaLine}
      postHero={
        data
          ? {
              title: data.title,
              lead: data.excerpt?.trim() || tk('materialsPage.heroDesc'),
            }
          : null
      }
      asideEnd={
        !invalidIds ? (
          <MaterialStudyRelatedAside
            subjectId={subjectId}
            currentPostId={postId}
            subjectHeading={data?.subject_name?.trim() || null}
          />
        ) : undefined
      }
    >
      {invalidIds ? (
        <p className="rounded-sm border border-destructive/30 bg-card px-3 py-6 text-sm text-destructive sm:px-4">
          {tk('materialsPage.errMaterials')}
        </p>
      ) : isLoading ? (
        <div className="rounded-sm border border-border bg-card px-3 py-12 text-center sm:px-4">
          <p className="text-sm font-medium text-muted-foreground">{tk('common.loading')}</p>
        </div>
      ) : error ? (
        <div className="rounded-sm border border-destructive/30 bg-card px-3 py-6 text-sm text-destructive sm:px-4">
          <p>{errText || tk('materialsPage.errMaterials')}</p>
        </div>
      ) : data ? (
        data.content_locked ? (
          <div className="space-y-4 rounded-md border border-amber-200/80 bg-gradient-to-b from-amber-50/90 to-card px-2 py-6 sm:px-3 sm:py-8 lg:px-2">
            {data.excerpt?.trim() ? (
              <p className="text-sm leading-relaxed text-foreground/85 sm:text-[15px]">{data.excerpt}</p>
            ) : null}
            <div
              className={cn(
                MATERIAL_STUDY_PROSE,
                'relative overflow-hidden rounded-md border border-border/60 bg-muted/30 px-3 py-10 text-center sm:py-14'
              )}
            >
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 via-amber-50/10 to-white/25 backdrop-blur-[0.5px]"
                aria-hidden
              />
              <div className="relative z-[1] mx-auto flex justify-center px-2 py-1">
                <PremiumGoldCtaLink label={tk('listing.content_tier_advanced')} />
              </div>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              MATERIAL_STUDY_PROSE,
              'rounded-md border border-border bg-card px-2 py-4 sm:px-2.5 sm:py-5',
              'lg:rounded-none lg:border-b-0 lg:border-l-0 lg:border-r-0 lg:border-t lg:border-border lg:px-0 lg:py-4'
            )}
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />
        )
      ) : null}
    </MaterialStudyPostLayout>
  );
}
