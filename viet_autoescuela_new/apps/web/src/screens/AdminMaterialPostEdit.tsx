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
  createInitialEditMaterialForm,
  filterByGroupId,
  mapAdminSubjectsToSubjectShape,
  mapTopicGroupsForLanguage,
  MaterialPostFormColumns,
  useAdminActions,
  useAdminShell,
} from '@/features/admin';
import { useLanguage } from '@/hooks/useLanguage';
import type { AdminSubject, AdminTopicGroup } from '@/lib/api/admin';
import {
  getAdminMaterialPostsBySubject,
  getAdminMaterialTopicGroups,
  getAdminSubjects,
  updateAdminMaterialPost,
} from '@/lib/api/admin';
import type { MaterialPostAdminRow } from '@/lib/api/types';
import { resolveMediaUrl, uploadMaterialContentImage } from '@/lib/api/upload';
import { localePath } from '@/lib/i18n-routing';
import { useQueryClient } from '@tanstack/react-query';
import { tKey } from '@viet/i18n';
import { AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const ADMIN_MATERIALS_MANAGE_HREF = `${APP_ROUTES.ADMIN}?tab=materials&materialsSub=manage`;

export default function AdminMaterialPostEditScreen({
  subjectId: subjectIdProp,
  postId: postIdProp,
}: {
  subjectId: number;
  postId: number;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { lang, tk } = useLanguage();
  const { isAdmin, invalidateHomeQueries } = useAdminShell(queryClient);
  const [notice, setNotice] = useState<{ text: string; type: 'error' | 'success' }>({
    text: '',
    type: 'error',
  });
  const { showError, showFormError, showSuccess } = useAdminActions(lang, setNotice);

  const subjectId = Number(subjectIdProp);
  const postId = Number(postIdProp);
  const idsValid = Number.isFinite(subjectId) && subjectId > 0 && Number.isFinite(postId) && postId > 0;

  const [loading, setLoading] = useState(true);
  const [adminSubjects, setAdminSubjects] = useState<AdminSubject[]>([]);
  const [materialTopicGroupsAdmin, setMaterialTopicGroupsAdmin] = useState<AdminTopicGroup[]>([]);
  const [materialEditFilterGroupId, setMaterialEditFilterGroupId] = useState('all');
  const [row, setRow] = useState<MaterialPostAdminRow | null>(null);
  const [editMaterialForm, setEditMaterialForm] = useState(createInitialEditMaterialForm);

  const subjectsUi = useMemo(
    () => mapAdminSubjectsToSubjectShape(adminSubjects, lang),
    [adminSubjects, lang]
  );
  const materialSubjectsActiveOnly = useMemo(
    () => subjectsUi.filter((s) => s.is_active !== false),
    [subjectsUi]
  );
  /** Giữ chủ đề hiện tại nếu đã ẩn — tránh mất lựa chọn khi sửa bài cũ. */
  const materialSubjectsForEditPicker = useMemo(() => {
    const active = materialSubjectsActiveOnly;
    const curId = row ? Number(row.subject_id) : NaN;
    if (!row || !Number.isFinite(curId) || curId <= 0) return active;
    if (active.some((s) => Number(s.id) === curId)) return active;
    const cur = subjectsUi.find((s) => Number(s.id) === curId);
    return cur ? [...active, cur] : active;
  }, [materialSubjectsActiveOnly, row, subjectsUi]);
  const materialTopicGroupsEditPick = useMemo(
    () =>
      mapTopicGroupsForLanguage(
        materialTopicGroupsAdmin.filter((g) => g.is_active),
        lang,
        { markInactive: false }
      ),
    [materialTopicGroupsAdmin, lang]
  );
  const editSubjectsByGroupActive = useMemo(
    () =>
      filterByGroupId(
        materialSubjectsForEditPicker as any[],
        materialEditFilterGroupId,
        'material_topic_group_id'
      ),
    [materialSubjectsForEditPicker, materialEditFilterGroupId]
  );

  useEffect(() => {
    const scoped = editSubjectsByGroupActive;
    if (!scoped.length) return;
    const cur = Number(editMaterialForm.subject_id);
    if (!Number.isFinite(cur) || !scoped.some((s: { id: number }) => Number(s.id) === cur)) {
      setEditMaterialForm((prev) => ({ ...prev, subject_id: String(scoped[0].id) }));
    }
  }, [editSubjectsByGroupActive, editMaterialForm.subject_id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!idsValid) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [subjects, groups, posts] = await Promise.all([
          getAdminSubjects(),
          getAdminMaterialTopicGroups(),
          getAdminMaterialPostsBySubject(subjectId, { bustCache: true }),
        ]);
        if (cancelled) return;
        setAdminSubjects(subjects);
        setMaterialTopicGroupsAdmin(groups);
        const found = posts.find((p) => Number(p.id) === postId) ?? null;
        setRow(found);
        if (found) {
          const sid = Number(found.subject_id || subjectId || '');
          const subMeta = subjects.find((s: AdminSubject) => Number(s.id) === sid);
          const gid = subMeta?.material_topic_group_id;
          const groupFilter =
            gid != null && Number.isFinite(Number(gid)) && Number(gid) > 0 ? String(gid) : 'all';
          setMaterialEditFilterGroupId(groupFilter);
          setEditMaterialForm({
            subject_id: String(found.subject_id || subjectId || ''),
            title_vi: found.title_vi || '',
            title_en: found.title_en || '',
            title_es: found.title_es || '',
            excerpt_vi: found.excerpt_vi || '',
            excerpt_en: found.excerpt_en || '',
            excerpt_es: found.excerpt_es || '',
            body_html_vi: found.body_html_vi || '',
            body_html_es: found.body_html_es || '',
            body_html_en: found.body_html_en || '',
            access_tier: found.access_tier === 'premium' ? 'premium' : 'free',
            is_published: found.is_published !== false,
            sort_order: String(found.sort_order ?? 0),
          });
        }
      } catch (e) {
        if (!cancelled) showError(e instanceof Error ? e : 'Error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [idsValid, subjectId, postId, lang, showError]);

  async function resolveMaterialImageUrl(file: File) {
    const uploaded = await uploadMaterialContentImage(file);
    const path = buildStoredMediaPath(uploaded);
    return resolveMediaUrl(path || '');
  }

  async function onSave() {
    if (!row) return;
    const sid = Number(editMaterialForm.subject_id);
    if (!Number.isFinite(sid) || sid <= 0) {
      showFormError(tk('adminUi.please_select_a_material_topic'));
      return;
    }
    if (!String(editMaterialForm.title_vi || '').trim()) {
      showFormError(tk('adminUi.enter_the_vietnamese_title_for_the_material'));
      return;
    }
    if (!String(editMaterialForm.title_en || '').trim()) {
      showFormError(tk('adminUi.enter_the_english_title_for_the_material'));
      return;
    }
    if (!String(editMaterialForm.title_es || '').trim()) {
      showFormError(tk('adminUi.enter_the_spanish_title_for_the_material'));
      return;
    }
    try {
      const sortN = Number(editMaterialForm.sort_order);
      await updateAdminMaterialPost(row.id, {
        subject_id: sid,
        material_type_id: sid,
        title_vi: editMaterialForm.title_vi,
        title_en: String(editMaterialForm.title_en || editMaterialForm.title_es).trim(),
        title_es: editMaterialForm.title_es,
        excerpt_vi: editMaterialForm.excerpt_vi || null,
        excerpt_en: editMaterialForm.excerpt_en || null,
        excerpt_es: editMaterialForm.excerpt_es || null,
        body_html_vi: editMaterialForm.body_html_vi,
        body_html_es: editMaterialForm.body_html_es,
        body_html_en: editMaterialForm.body_html_en,
        access_tier: editMaterialForm.access_tier === 'premium' ? 'premium' : 'free',
        is_published: editMaterialForm.is_published,
        sort_order: Number.isFinite(sortN) ? sortN : 0,
      });
      await invalidateHomeQueries();
      showSuccess('adminUi.toast_material_updated');
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
            {tKey(lang, 'adminUi.edit_material_2')}
          </h1>
        </header>

        {!idsValid ? (
          <p className="text-sm text-destructive">{tk('materialsPage.errMaterials')}</p>
        ) : loading ? (
          <p className="text-sm text-muted-foreground">{tk('common.loading')}</p>
        ) : !row ? (
          <p className="text-sm text-destructive">{tKey(lang, 'materialsPage.errMaterials')}</p>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <Label className="text-xs text-[#5b5b5b]">{tKey(lang, 'adminUi.topic_group')}</Label>
                <Select
                  value={materialEditFilterGroupId}
                  onValueChange={(v) => {
                    setMaterialEditFilterGroupId(v);
                    const gid = Number(v);
                    const scoped =
                      v === 'all' || !Number.isFinite(gid) || gid <= 0
                        ? materialSubjectsForEditPicker
                        : materialSubjectsForEditPicker.filter(
                            (item: any) => Number(item.material_topic_group_id) === gid
                          );
                    const cur = Number(editMaterialForm.subject_id);
                    if (
                      scoped.length &&
                      (!Number.isFinite(cur) || !scoped.some((s: any) => Number(s.id) === cur))
                    ) {
                      setEditMaterialForm((prev) => ({ ...prev, subject_id: String(scoped[0].id) }));
                    }
                  }}
                >
                  <SelectTrigger className="mt-1 h-9 border-[#d2d2d2] bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{tKey(lang, 'adminUi.all_topic_groups')}</SelectItem>
                    {materialTopicGroupsEditPick.map((g) => (
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
                  value={editMaterialForm.subject_id}
                  onValueChange={(v) => setEditMaterialForm((prev) => ({ ...prev, subject_id: v }))}
                >
                  <SelectTrigger className="mt-1 h-9 border-[#d2d2d2] bg-white">
                    <SelectValue placeholder={tKey(lang, 'adminUi.select_topic')} />
                  </SelectTrigger>
                  <SelectContent>
                    {editSubjectsByGroupActive.map((s: any) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-md border border-[#ece2e6] bg-[#fcfbfc] px-3 py-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <AdminAccessTierField
                lang={lang}
                id="page-edit-material-access-tier"
                value={editMaterialForm.access_tier}
                onChange={(v) => setEditMaterialForm((prev) => ({ ...prev, access_tier: v }))}
              />
              <div className="flex items-center gap-2">
                <Switch
                  id="page-edit-material-published"
                  checked={editMaterialForm.is_published}
                  onCheckedChange={(v) =>
                    setEditMaterialForm((prev) => ({ ...prev, is_published: Boolean(v) }))
                  }
                />
                <Label htmlFor="page-edit-material-published" className="text-xs text-[#5b5b5b]">
                  {tKey(lang, 'adminUi.material_post_visible_label')}
                </Label>
              </div>
              <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                <Label htmlFor="page-edit-material-sort" className="shrink-0 text-xs text-[#5b5b5b]">
                  {tKey(lang, 'adminUi.material_sort_order_label')}
                </Label>
                <Input
                  id="page-edit-material-sort"
                  type="number"
                  className="h-8 w-20 border-[#d2d2d2] bg-white"
                  value={editMaterialForm.sort_order}
                  onChange={(e) =>
                    setEditMaterialForm((prev) => ({ ...prev, sort_order: e.target.value }))
                  }
                />
              </div>
            </div>
            <MaterialPostFormColumns
              lang={lang}
              form={editMaterialForm}
              setForm={setEditMaterialForm}
              onUploadImage={resolveMaterialImageUrl}
              open
              editorHeight={560}
            />
            <div className="flex flex-wrap justify-end gap-2 border-t border-[#e8d7dd] pt-4">
              <Button type="button" variant="outline" className="border-[#d2d2d2] bg-white" asChild>
                <LocaleLink href={ADMIN_MATERIALS_MANAGE_HREF}>{tKey(lang, 'adminUi.cancel')}</LocaleLink>
              </Button>
              <Button
                type="button"
                onClick={onSave}
                className="bg-[#7a2038] font-bold text-white hover:bg-[#5a1428]"
              >
                {tKey(lang, 'adminUi.save')}
              </Button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
