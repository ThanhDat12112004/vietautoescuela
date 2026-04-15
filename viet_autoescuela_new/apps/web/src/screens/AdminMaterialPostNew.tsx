'use client';

import { Footer, Navbar } from '@/components/layout';
import { LocaleLink } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { APP_ROUTES } from '@/config/routes';
import {
  AdminNoticeBanner,
  AdminAccessTierField,
  buildStoredMediaPath,
  createInitialMaterialForm,
  filterByGroupId,
  mapAdminSubjectsToSubjectShape,
  mapTopicGroupsForLanguage,
  MaterialPostFormColumns,
  useAdminActions,
  useAdminShell,
} from '@/features/admin';
import { useLanguage } from '@/hooks/useLanguage';
import {
  createAdminMaterialPost,
  getAdminMaterialPostsBySubject,
  getAdminMaterialTopicGroups,
  getAdminSubjects,
  type AdminSubject,
  type AdminTopicGroup,
} from '@/lib/api/admin';
import { resolveMediaUrl, uploadMaterialContentImage } from '@/lib/api/upload';
import { localePath } from '@/lib/i18n-routing';
import { useQueryClient } from '@tanstack/react-query';
import { tKey } from '@viet/i18n';
import { AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

/** Đường dẫn không locale — dùng với LocaleLink (component tự gọi localePath). */
const ADMIN_MATERIALS_MANAGE_HREF = `${APP_ROUTES.ADMIN}?tab=materials&materialsSub=manage`;

export default function AdminMaterialPostNewScreen() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { lang, tk } = useLanguage();
  const { isAdmin, invalidateHomeQueries } = useAdminShell(queryClient);
  const [notice, setNotice] = useState<{ text: string; type: 'error' | 'success' }>({
    text: '',
    type: 'error',
  });
  const { showError, showFormError, showSuccess } = useAdminActions(lang, setNotice);

  const [loading, setLoading] = useState(true);
  const [adminSubjects, setAdminSubjects] = useState<AdminSubject[]>([]);
  const [materialTopicGroupsAdmin, setMaterialTopicGroupsAdmin] = useState<AdminTopicGroup[]>([]);
  const [materialCreateFilterGroupId, setMaterialCreateFilterGroupId] = useState('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [materialForm, setMaterialForm] = useState(createInitialMaterialForm);

  const materialSubjectsForAdminUi = useMemo(
    () => mapAdminSubjectsToSubjectShape(adminSubjects, lang),
    [adminSubjects, lang]
  );
  const materialSubjectsActiveOnly = useMemo(
    () => materialSubjectsForAdminUi.filter((s) => s.is_active !== false),
    [materialSubjectsForAdminUi]
  );
  const materialTopicGroupsCreatePick = useMemo(
    () =>
      mapTopicGroupsForLanguage(
        materialTopicGroupsAdmin.filter((g) => g.is_active),
        lang,
        { markInactive: false }
      ),
    [materialTopicGroupsAdmin, lang]
  );
  const createSubjectsByGroupActive = useMemo(() => {
    return filterByGroupId(
      materialSubjectsActiveOnly as any[],
      materialCreateFilterGroupId,
      'material_topic_group_id'
    );
  }, [materialSubjectsActiveOnly, materialCreateFilterGroupId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [subjects, groups] = await Promise.all([
          getAdminSubjects(),
          getAdminMaterialTopicGroups(),
        ]);
        if (cancelled) return;
        setAdminSubjects(subjects);
        setMaterialTopicGroupsAdmin(groups);
      } catch (e) {
        if (!cancelled) {
          showError(e instanceof Error ? e : 'Error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showError]);

  useEffect(() => {
    const scoped = createSubjectsByGroupActive;
    if (!scoped.length) {
      setSelectedSubjectId(null);
      return;
    }
    if (
      selectedSubjectId == null ||
      !scoped.some((s: { id: number }) => Number(s.id) === Number(selectedSubjectId))
    ) {
      setSelectedSubjectId(Number(scoped[0].id));
    }
  }, [createSubjectsByGroupActive, selectedSubjectId]);

  /** Gợi ý thứ tự = max(sort_order) trong chủ đề + 1 (bài mới xếp sau cùng). */
  useEffect(() => {
    if (selectedSubjectId == null || !Number.isFinite(Number(selectedSubjectId))) return;
    let cancelled = false;
    (async () => {
      try {
        const posts = await getAdminMaterialPostsBySubject(Number(selectedSubjectId));
        if (cancelled) return;
        const maxSo = posts.reduce((acc, p) => Math.max(acc, Number(p.sort_order) || 0), 0);
        setMaterialForm((prev) => ({ ...prev, sort_order: String(maxSo + 1) }));
      } catch {
        if (!cancelled) {
          setMaterialForm((prev) => ({ ...prev, sort_order: '0' }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedSubjectId]);

  async function resolveMaterialImageUrl(file: File) {
    const uploaded = await uploadMaterialContentImage(file);
    const path = buildStoredMediaPath(uploaded);
    return resolveMediaUrl(path || '');
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedSubjectId) {
      showFormError(tk('adminUi.please_select_a_material_topic'));
      return;
    }
    if (!String(materialForm.title_vi || '').trim()) {
      showFormError(tk('adminUi.enter_the_vietnamese_title_for_the_material'));
      return;
    }
    if (!String(materialForm.title_en || '').trim()) {
      showFormError(tk('adminUi.enter_the_english_title_for_the_material'));
      return;
    }
    if (!String(materialForm.title_es || '').trim()) {
      showFormError(tk('adminUi.enter_the_spanish_title_for_the_material'));
      return;
    }
    try {
      const sortN = Number(materialForm.sort_order);
      await createAdminMaterialPost(selectedSubjectId, {
        title_vi: materialForm.title_vi,
        title_en: String(materialForm.title_en || materialForm.title_es).trim(),
        title_es: materialForm.title_es,
        excerpt_vi: materialForm.excerpt_vi || null,
        excerpt_en: materialForm.excerpt_en || materialForm.excerpt_es || null,
        excerpt_es: materialForm.excerpt_es || null,
        body_html_vi: materialForm.body_html_vi,
        body_html_es: materialForm.body_html_es,
        body_html_en: materialForm.body_html_en,
        access_tier: materialForm.access_tier === 'premium' ? 'premium' : 'free',
        is_published: materialForm.is_published,
        sort_order: Number.isFinite(sortN) ? sortN : 0,
      });
      setMaterialForm(createInitialMaterialForm());
      await invalidateHomeQueries();
      showSuccess('adminUi.toast_bilingual_material_added');
      router.replace(localePath(lang, ADMIN_MATERIALS_MANAGE_HREF));
    } catch (e) {
      showError(e instanceof Error ? e : 'Error');
    }
  }

  if (!isAdmin) return null;

  return (
    <div className="app-page flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="w-full min-w-0 flex-1 px-3 py-6 sm:px-4 md:py-8 lg:px-6 xl:px-8">
        <AdminNoticeBanner notice={notice} SuccessIcon={CheckCircle2} ErrorIcon={AlertCircle} />
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="gap-1 text-[#6b1b31]">
            <LocaleLink href={ADMIN_MATERIALS_MANAGE_HREF}>
              <ArrowLeft className="h-4 w-4" aria-hidden />
              {tKey(lang, 'nav.admin')}
            </LocaleLink>
          </Button>
        </div>
        <header className="mb-6 border-b border-[#e8d7dd] pb-4">
          <h1 className="font-display text-xl font-bold text-[#6b1b31] sm:text-2xl">
            {tKey(lang, 'adminUi.add_bilingual_material')}
          </h1>
        </header>

        {loading ? (
          <p className="text-sm text-muted-foreground">{tk('common.loading')}</p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6" noValidate>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <Label className="text-xs text-[#5b5b5b]">{tKey(lang, 'adminUi.topic_group')}</Label>
                <Select
                  value={materialCreateFilterGroupId}
                  onValueChange={(v) => {
                    setMaterialCreateFilterGroupId(v);
                    const gid = Number(v);
                    const scoped =
                      v === 'all' || !Number.isFinite(gid) || gid <= 0
                        ? materialSubjectsActiveOnly
                        : materialSubjectsActiveOnly.filter(
                            (item: any) => Number(item.material_topic_group_id) === gid
                          );
                    if (
                      scoped.length &&
                      !scoped.some((s: any) => Number(s.id) === Number(selectedSubjectId))
                    ) {
                      setSelectedSubjectId(Number(scoped[0].id));
                    }
                  }}
                >
                  <SelectTrigger className="mt-1 h-9 border-[#d2d2d2] bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{tKey(lang, 'adminUi.all_topic_groups')}</SelectItem>
                    {materialTopicGroupsCreatePick.map((g) => (
                      <SelectItem key={g.id} value={String(g.id)}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-[#5b5b5b]">{tKey(lang, 'adminUi.topic')}</Label>
                <Select
                  value={selectedSubjectId != null ? String(selectedSubjectId) : ''}
                  onValueChange={(v) => setSelectedSubjectId(Number(v))}
                >
                  <SelectTrigger className="mt-1 h-9 border-[#d2d2d2] bg-white">
                    <SelectValue placeholder={tKey(lang, 'adminUi.select_topic')} />
                  </SelectTrigger>
                  <SelectContent>
                    {createSubjectsByGroupActive.map((s: any) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-md border border-[#ece2e6] bg-[#fcfbfc] px-3 py-2">
              <div className="flex flex-wrap items-center gap-3">
                <AdminAccessTierField
                  lang={lang}
                  id="page-bilingual-material-access-tier"
                  value={materialForm.access_tier}
                  onChange={(v) => setMaterialForm({ ...materialForm, access_tier: v })}
                />
                <div className="flex items-center gap-2">
                  <Switch
                    id="page-material-create-published"
                    checked={materialForm.is_published}
                    onCheckedChange={(v) =>
                      setMaterialForm((prev) => ({ ...prev, is_published: Boolean(v) }))
                    }
                  />
                  <Label htmlFor="page-material-create-published" className="text-xs text-[#5b5b5b]">
                    {tKey(lang, 'adminUi.material_post_visible_label')}
                  </Label>
                </div>
              </div>
              <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                <Label htmlFor="page-material-create-sort" className="shrink-0 text-xs text-[#5b5b5b]">
                  {tKey(lang, 'adminUi.material_sort_order_label')}
                </Label>
                <Input
                  id="page-material-create-sort"
                  type="number"
                  className="h-8 w-24 border-[#d2d2d2] bg-white sm:w-20"
                  value={materialForm.sort_order}
                  onChange={(e) =>
                    setMaterialForm((prev) => ({ ...prev, sort_order: e.target.value }))
                  }
                />
              </div>
            </div>
            <MaterialPostFormColumns
              lang={lang}
              form={materialForm}
              setForm={setMaterialForm}
              onUploadImage={resolveMaterialImageUrl}
              open
              editorHeight={560}
            />
            <div className="flex flex-wrap justify-end gap-2 border-t border-[#e8d7dd] pt-4">
              <Button type="button" variant="outline" className="border-[#d2d2d2] bg-white" asChild>
                <LocaleLink href={ADMIN_MATERIALS_MANAGE_HREF}>{tKey(lang, 'adminUi.cancel')}</LocaleLink>
              </Button>
              <Button type="submit" className="bg-[#7a2038] font-bold text-white hover:bg-[#5a1428]">
                {tKey(lang, 'adminUi.add_material')}
              </Button>
            </div>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}
