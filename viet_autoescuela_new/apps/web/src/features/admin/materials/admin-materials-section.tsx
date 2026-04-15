import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { APP_ROUTES } from '@/config/routes';
import { ADMIN_LIST_PAGE_SIZE } from '@/features/admin/admin.constants';
import { adminTrilingualField } from '@/features/admin/admin.lang';
import { AdminLocaleBlockLabel } from '@/features/admin/components/AdminLocaleBlockLabel';
import { tKey } from '@viet/i18n';
import {
  AdminAccessTierField,
  AdminActionIconButton,
  AdminListPaginationControls,
} from '@/features/admin/admin.shared-components';
import { AdminMaterialsTabShell } from '@/features/admin/materials/admin-materials-tab';
import { localePath } from '@/lib/i18n-routing';
import { Edit, Eye, EyeOff, ExternalLink, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AdminMaterialsSection(props: any) {
  const {
    lang,
    materialsSubTab,
    setMaterialsSubTab,
    materialTopicGroupCreateDialogOpen,
    setMaterialTopicGroupCreateDialogOpen,
    onCreateMaterialTopicGroup,
    newMaterialTopicGroup,
    setNewMaterialTopicGroup,
    materialTopicGroupSearch,
    setMaterialTopicGroupSearch,
    filteredMaterialTopicGroups,
    onStartEditMaterialTopicGroup,
    onToggleMaterialTopicGroupActive,
    onDeleteMaterialTopicGroup,
    editingMaterialTopicGroupId,
    setEditingMaterialTopicGroupId,
    editMaterialTopicGroupForm,
    setEditMaterialTopicGroupForm,
    onSaveEditMaterialTopicGroup,
    materialSubjectFilterGroupId,
    setMaterialSubjectFilterGroupId,
    materialTopicGroups,
    materialTopicGroupsCreatePick,
    materialSubjectCreateDialogOpen,
    setMaterialSubjectCreateDialogOpen,
    onCreateSubject,
    subjectForm,
    setSubjectForm,
    materialSubjectSearch,
    setMaterialSubjectSearch,
    filteredAdminSubjects,
    onStartEditSubject,
    onToggleMaterialSubjectActive,
    onDeleteSubject,
    editingSubjectId,
    onCancelEditSubject,
    editSubjectForm,
    setEditSubjectForm,
    onSaveEditSubject,
    subjects,
    selectedSubjectId,
    setSelectedSubjectId,
    materialListSubjectId,
    setMaterialListSubjectId,
    filteredMaterials,
    materialListFilterGroupId,
    setMaterialListFilterGroupId,
    listSubjectsByGroup,
    selectedSubject,
    materialSearch,
    setMaterialSearch,
    paginatedMaterials,
    onDeleteMaterial,
    localePath,
    adminMaterialsPage,
    setAdminMaterialsListPage,
  } = props;
  const router = useRouter();

  function goNewMaterialPostPage() {
    router.push(localePath(lang, `${APP_ROUTES.ADMIN}/materials/new`));
  }

  function goEditMaterialPostPage(item: { subject_id: number; id: number }) {
    router.push(localePath(lang, `${APP_ROUTES.ADMIN}/materials/${item.subject_id}/${item.id}/edit`));
  }

  return (
                <AdminMaterialsTabShell
                  lang={lang}
                  materialsSubTab={materialsSubTab}
                  setMaterialsSubTab={setMaterialsSubTab}
                >

                  {materialsSubTab === 'topic_groups' && (
                    <section className="rounded-lg border border-[#e3ccd4] bg-white p-4 shadow-sm">
                      <header className="mb-4 border-b border-[#f0e8ec] pb-3">
                        <h2 className="text-base font-bold tracking-tight text-[#5a1428]">
                          {tKey(lang, 'adminUi.material_topic_groups')}
                        </h2>
                        <p className="mt-1 text-xs leading-relaxed text-[#6b6570]">
                          {tKey(lang, 'adminUi.parent_groups_for_topics_show_or_hide_to_learners_using_')}
                        </p>
                      </header>
                      <div className="mb-2">
                        <Input
                          value={materialTopicGroupSearch}
                          onChange={(e) => setMaterialTopicGroupSearch(e.target.value)}
                          placeholder={tKey(lang, 'adminUi.search_by_code_name_description')}
                          className="h-9 w-full border-[#d2d2d2] bg-white"
                        />
                      </div>
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <h3 className="min-w-0 flex-1 font-bold text-[#5a1428] text-base leading-snug">
                          {tKey(lang, 'adminUi.add_material_topic_group')}
                        </h3>
                        <Button
                          type="button"
                          onClick={() => setMaterialTopicGroupCreateDialogOpen(true)}
                          className="h-9 shrink-0 rounded-full bg-[#7a2038] px-5 font-bold text-white shadow-sm hover:bg-[#5a1428]"
                        >
                          {tKey(lang, 'adminUi.add_new')}
                        </Button>
                      </div>
                        <Dialog open={materialTopicGroupCreateDialogOpen} onOpenChange={setMaterialTopicGroupCreateDialogOpen}>
                          <DialogContent
                            className="max-w-3xl max-h-[min(92vh,880px)] overflow-y-auto"
                            closeLabel={tKey(lang, 'adminUi.close')}
                            suppressAriaDescribedBy={false}
                          >
                            <DialogHeader>
                              <DialogTitle className="text-left text-[#6b1b31]">
                                {tKey(lang, 'adminUi.add_material_topic_group')}
                              </DialogTitle>
                              <DialogDescription className="text-left text-[#5b5b5b]">
                                {tKey(lang, 'adminUi.topic_groups_organize_material_topics_enter_names_and_de')}
                              </DialogDescription>
                            </DialogHeader>
                        <form onSubmit={onCreateMaterialTopicGroup} className="space-y-2 rounded-md border border-[#e5d9de] bg-[#fcfbfc] p-3">
                          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                            <div className="space-y-2 rounded-md border border-[#ece2e6] bg-white p-2">
                              <p className="text-xs font-bold text-[#7a2038]"><AdminLocaleBlockLabel lang={lang} block="vi" /></p>
                              <div className="space-y-1">
                                <Label htmlFor="new-mtg-name-vi" className="text-xs text-[#5b5b5b]">
                                  {tKey(lang, 'adminUi.display_name_vi_2')}
                                </Label>
                                <Input
                                  id="new-mtg-name-vi"
                                  placeholder={tKey(lang, 'adminUi.name_vi')}
                                  value={newMaterialTopicGroup.name_vi}
                                  onChange={(e) =>
                                    setNewMaterialTopicGroup((prev) => ({ ...prev, name_vi: e.target.value }))
                                  }
                                  className="border-[#d2d2d2] bg-white h-9"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor="new-mtg-desc-vi" className="text-xs text-[#5b5b5b]">
                                  {tKey(lang, 'adminUi.description_vi_2')}
                                </Label>
                                <Input
                                  id="new-mtg-desc-vi"
                                  placeholder={tKey(lang, 'adminUi.description_vi_3')}
                                  value={newMaterialTopicGroup.description_vi}
                                  onChange={(e) =>
                                    setNewMaterialTopicGroup((prev) => ({
                                      ...prev,
                                      description_vi: e.target.value,
                                    }))
                                  }
                                  className="border-[#d2d2d2] bg-white h-9"
                                />
                              </div>
                            </div>
                            <div className="space-y-2 rounded-md border border-[#ece2e6] bg-white p-2">
                              <p className="text-xs font-bold text-[#7a2038]"><AdminLocaleBlockLabel lang={lang} block="en" /></p>
                              <div className="space-y-1">
                                <Label htmlFor="new-mtg-name-en" className="text-xs text-[#5b5b5b]">
                                  {tKey(lang, 'adminUi.display_name_en')}
                                </Label>
                                <Input
                                  id="new-mtg-name-en"
                                  placeholder={tKey(lang, 'adminUi.name_en')}
                                  value={newMaterialTopicGroup.name_en}
                                  onChange={(e) =>
                                    setNewMaterialTopicGroup((prev) => ({ ...prev, name_en: e.target.value }))
                                  }
                                  className="border-[#d2d2d2] bg-white h-9"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor="new-mtg-desc-en" className="text-xs text-[#5b5b5b]">
                                  {tKey(lang, 'adminUi.description_en')}
                                </Label>
                                <Input
                                  id="new-mtg-desc-en"
                                  placeholder={tKey(lang, 'adminUi.description_en_2')}
                                  value={newMaterialTopicGroup.description_en}
                                  onChange={(e) =>
                                    setNewMaterialTopicGroup((prev) => ({
                                      ...prev,
                                      description_en: e.target.value,
                                    }))
                                  }
                                  className="border-[#d2d2d2] bg-white h-9"
                                />
                              </div>
                            </div>
                            <div className="space-y-2 rounded-md border border-[#ece2e6] bg-white p-2">
                              <p className="text-xs font-bold text-[#7a2038]"><AdminLocaleBlockLabel lang={lang} block="es" /></p>
                              <div className="space-y-1">
                                <Label htmlFor="new-mtg-name-es" className="text-xs text-[#5b5b5b]">
                                  {tKey(lang, 'adminUi.display_name_es')}
                                </Label>
                                <Input
                                  id="new-mtg-name-es"
                                  placeholder={tKey(lang, 'adminUi.name_es')}
                                  value={newMaterialTopicGroup.name_es}
                                  onChange={(e) =>
                                    setNewMaterialTopicGroup((prev) => ({ ...prev, name_es: e.target.value }))
                                  }
                                  className="border-[#d2d2d2] bg-white h-9"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor="new-mtg-desc-es" className="text-xs text-[#5b5b5b]">
                                  {tKey(lang, 'adminUi.description_es')}
                                </Label>
                                <Input
                                  id="new-mtg-desc-es"
                                  placeholder={tKey(lang, 'adminUi.description_es_2')}
                                  value={newMaterialTopicGroup.description_es}
                                  onChange={(e) =>
                                    setNewMaterialTopicGroup((prev) => ({
                                      ...prev,
                                      description_es: e.target.value,
                                    }))
                                  }
                                  className="border-[#d2d2d2] bg-white h-9"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 rounded-md border border-[#ece2e6] bg-white px-3 py-2">
                            <AdminAccessTierField
                              lang={lang}
                              id="new-material-topic-group-access-tier"
                              value={newMaterialTopicGroup.access_tier}
                              onChange={(v) =>
                                setNewMaterialTopicGroup((prev) => ({ ...prev, access_tier: v }))
                              }
                            />
                          </div>
                          <Button type="submit" className="h-10 rounded-md bg-[#7a2038] hover:bg-[#5a1428] text-white">
                            {tKey(lang, 'adminUi.add_topic_group_2')}
                          </Button>
                        </form>
                          </DialogContent>
                        </Dialog>
                        <div className="overflow-hidden rounded-md border border-[#e5d9de] divide-y divide-[#ece2e6] bg-white">
                          {filteredMaterialTopicGroups.map((groupItem) => (
                            <div
                              key={groupItem.id}
                              className="group rounded-none border-0 bg-white p-2 text-xs"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                                    <span className="font-bold text-[#5a1428]">
                                      {adminTrilingualField(lang, groupItem.name_vi, groupItem.name_es, groupItem.name_en)}
                                    </span>
                                    <span
                                      className={`text-[11px] font-semibold ${
                                        groupItem.is_active ? 'text-emerald-700' : 'text-[#6b6570]'
                                      }`}
                                    >
                                      {groupItem.is_active
                                        ? tKey(lang, 'adminUi.active')
                                        : tKey(lang, 'adminUi.hidden_2')}
                                    </span>
                                    {String(groupItem.access_tier || '').toLowerCase() === 'premium' ? (
                                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-900">
                                        {tKey(lang, 'listing.content_tier_advanced')}
                                      </span>
                                    ) : null}
                                  </div>
                                  <div className="text-xs text-[#5b5b5b]">
                                    {adminTrilingualField(
                                      lang,
                                      groupItem.description_vi,
                                      groupItem.description_es,
                                      groupItem.description_en
                                    ) || '-'}
                                  </div>
                                </div>
                                <div className="admin-row-actions flex gap-1">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onToggleMaterialTopicGroupActive(groupItem)}
                                    className="h-8 w-8 shrink-0 border-[#d2d2d2] bg-white p-0 hover:bg-[#fdf5f8]"
                                    title={
                                      groupItem.is_active
                                        ? tKey(lang, 'adminUi.hide_from_students')
                                        : tKey(lang, 'adminUi.show_to_students')
                                    }
                                  >
                                    {groupItem.is_active ? (
                                      <EyeOff className="h-3.5 w-3.5" />
                                    ) : (
                                      <Eye className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                  <AdminActionIconButton onClick={() => onStartEditMaterialTopicGroup(groupItem)} title={tKey(lang, 'adminUi.edit')} kind="edit" className="h-8 w-8 rounded-md px-0" icon={<Edit className="h-3.5 w-3.5" />} />
                                  <AdminActionIconButton onClick={() => onDeleteMaterialTopicGroup(groupItem)} title={tKey(lang, 'adminUi.delete')} kind="delete" className="h-8 w-8 rounded-md px-0" icon={<Trash2 className="h-3.5 w-3.5" />} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Dialog
                          open={editingMaterialTopicGroupId != null}
                          onOpenChange={(open) => {
                            if (!open) setEditingMaterialTopicGroupId(null);
                          }}
                        >
                          <DialogContent
                            className="max-w-3xl max-h-[min(92vh,880px)] overflow-y-auto"
                            closeLabel={tKey(lang, 'adminUi.close')}
                            suppressAriaDescribedBy={false}
                          >
                            <DialogHeader>
                              <DialogTitle className="text-left text-[#6b1b31]">
                                {tKey(lang, 'adminUi.edit_material_topic_group')}
                              </DialogTitle>
                              <DialogDescription className="text-left text-[#5b5b5b]">
                                {tKey(lang, 'adminUi.edit_names_and_descriptions_per_language_visibility_for_')}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-3 pt-1">
                              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                <div className="space-y-2 rounded-md border border-[#e8d7dd] bg-white p-3">
                                  <p className="text-xs font-bold text-[#7a2038]"><AdminLocaleBlockLabel lang={lang} block="vi" /></p>
                                  <div className="space-y-1">
                                    <Label htmlFor="edit-mtg-name-vi" className="text-xs text-[#5b5b5b]">
                                      {tKey(lang, 'adminUi.display_name_vi')}
                                    </Label>
                                    <Input
                                      id="edit-mtg-name-vi"
                                      value={editMaterialTopicGroupForm.name_vi}
                                      onChange={(e) =>
                                        setEditMaterialTopicGroupForm((p) => ({ ...p, name_vi: e.target.value }))
                                      }
                                      className="h-9 border-[#d2d2d2]"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label htmlFor="edit-mtg-desc-vi" className="text-xs text-[#5b5b5b]">
                                      {tKey(lang, 'adminUi.description_vi')}
                                    </Label>
                                    <Input
                                      id="edit-mtg-desc-vi"
                                      value={editMaterialTopicGroupForm.description_vi}
                                      onChange={(e) =>
                                        setEditMaterialTopicGroupForm((p) => ({
                                          ...p,
                                          description_vi: e.target.value,
                                        }))
                                      }
                                      className="h-9 border-[#d2d2d2]"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2 rounded-md border border-[#e8d7dd] bg-white p-3">
                                  <p className="text-xs font-bold text-[#7a2038]"><AdminLocaleBlockLabel lang={lang} block="en" /></p>
                                  <div className="space-y-1">
                                    <Label htmlFor="edit-mtg-name-en" className="text-xs text-[#5b5b5b]">
                                      {tKey(lang, 'adminUi.display_name_en')}
                                    </Label>
                                    <Input
                                      id="edit-mtg-name-en"
                                      value={editMaterialTopicGroupForm.name_en}
                                      onChange={(e) =>
                                        setEditMaterialTopicGroupForm((p) => ({ ...p, name_en: e.target.value }))
                                      }
                                      className="h-9 border-[#d2d2d2]"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label htmlFor="edit-mtg-desc-en" className="text-xs text-[#5b5b5b]">
                                      {tKey(lang, 'adminUi.description_en')}
                                    </Label>
                                    <Input
                                      id="edit-mtg-desc-en"
                                      value={editMaterialTopicGroupForm.description_en}
                                      onChange={(e) =>
                                        setEditMaterialTopicGroupForm((p) => ({
                                          ...p,
                                          description_en: e.target.value,
                                        }))
                                      }
                                      className="h-9 border-[#d2d2d2]"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2 rounded-md border border-[#e8d7dd] bg-white p-3">
                                  <p className="text-xs font-bold text-[#7a2038]"><AdminLocaleBlockLabel lang={lang} block="es" /></p>
                                  <div className="space-y-1">
                                    <Label htmlFor="edit-mtg-name-es" className="text-xs text-[#5b5b5b]">
                                      {tKey(lang, 'adminUi.display_name_es')}
                                    </Label>
                                    <Input
                                      id="edit-mtg-name-es"
                                      value={editMaterialTopicGroupForm.name_es}
                                      onChange={(e) =>
                                        setEditMaterialTopicGroupForm((p) => ({ ...p, name_es: e.target.value }))
                                      }
                                      className="h-9 border-[#d2d2d2]"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label htmlFor="edit-mtg-desc-es" className="text-xs text-[#5b5b5b]">
                                      {tKey(lang, 'adminUi.description_es')}
                                    </Label>
                                    <Input
                                      id="edit-mtg-desc-es"
                                      value={editMaterialTopicGroupForm.description_es}
                                      onChange={(e) =>
                                        setEditMaterialTopicGroupForm((p) => ({
                                          ...p,
                                          description_es: e.target.value,
                                        }))
                                      }
                                      className="h-9 border-[#d2d2d2]"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 rounded-md border border-[#ece2e6] bg-[#fcfbfc] px-3 py-2">
                                <AdminAccessTierField
                                  lang={lang}
                                  id="edit-material-topic-group-access-tier"
                                  value={editMaterialTopicGroupForm.access_tier}
                                  onChange={(v) =>
                                    setEditMaterialTopicGroupForm((p) => ({ ...p, access_tier: v }))
                                  }
                                />
                              </div>
                              <div className="flex flex-wrap gap-2 pt-1">
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => {
                                    const id = editingMaterialTopicGroupId;
                                    if (id == null) return;
                                    const row =
                                      filteredMaterialTopicGroups.find((g: { id: number }) => g.id === id) ??
                                      ({ id } as any);
                                    onSaveEditMaterialTopicGroup(row);
                                  }}
                                  className="h-9 bg-[#7a2038] hover:bg-[#5a1428] text-white"
                                >
                                  {tKey(lang, 'adminUi.save')}
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingMaterialTopicGroupId(null)}
                                  className="h-9 border-[#d2d2d2] bg-white"
                                >
                                  {tKey(lang, 'adminUi.cancel')}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                    </section>
                  )}
                  {materialsSubTab === 'subjects' && (
                    <section className="rounded-lg border border-[#e3ccd4] bg-white p-4 shadow-sm">
                      <header className="mb-4 border-b border-[#f0e8ec] pb-3">
                        <h2 className="text-base font-bold tracking-tight text-[#5a1428]">
                          {tKey(lang, 'adminUi.material_topics')}
                        </h2>
                        <p className="mt-1 text-xs leading-relaxed text-[#6b6570]">
                          {tKey(lang, 'adminUi.each_topic_belongs_to_a_topic_group_filter_by_parent_gro')}
                        </p>
                      </header>
                      <div className="mb-4 max-w-md">
                        <Label className="text-xs font-medium text-[#5b5b5b]">
                          {tKey(lang, 'adminUi.filter_by_parent_group')}
                        </Label>
                        {materialTopicGroups.length === 0 ? (
                          <p className="mt-1 text-xs text-[#6b6570]">
                            {tKey(lang, 'adminUi.no_material_topic_groups_yet_add_a_topic_group_first')}
                          </p>
                        ) : (
                        <Select
                          value={materialSubjectFilterGroupId}
                          onValueChange={setMaterialSubjectFilterGroupId}
                        >
                          <SelectTrigger className="h-9 border-[#d2d2d2] bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">
                              {tKey(lang, 'adminUi.all_topic_groups')}
                            </SelectItem>
                            {materialTopicGroups.map((g) => (
                              <SelectItem key={g.id} value={String(g.id)}>
                                {g.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        )}
                      </div>
                      <div className="mb-2">
                        <Input
                          value={materialSubjectSearch}
                          onChange={(e) => setMaterialSubjectSearch(e.target.value)}
                          placeholder={tKey(lang, 'adminUi.search_topics_by_code_name_description')}
                          className="h-9 w-full border-[#d2d2d2] bg-white"
                        />
                      </div>
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <h3 className="min-w-0 flex-1 font-bold text-[#5a1428] text-base leading-snug">
                          {tKey(lang, 'adminUi.add_material_topic')}
                        </h3>
                        <Button
                          type="button"
                          onClick={() => setMaterialSubjectCreateDialogOpen(true)}
                          className="h-9 shrink-0 rounded-full bg-[#7a2038] px-5 font-bold text-white shadow-sm hover:bg-[#5a1428]"
                        >
                          {tKey(lang, 'adminUi.add_new')}
                        </Button>
                      </div>
                      <Dialog open={materialSubjectCreateDialogOpen} onOpenChange={setMaterialSubjectCreateDialogOpen}>
                        <DialogContent
                          className="max-w-4xl max-h-[min(92vh,880px)] overflow-y-auto"
                          closeLabel={tKey(lang, 'adminUi.close')}
                          suppressAriaDescribedBy={false}
                        >
                          <DialogHeader>
                            <DialogTitle className="text-left text-[#6b1b31]">
                              {tKey(lang, 'adminUi.add_material_topic')}
                            </DialogTitle>
                            <DialogDescription className="text-left text-[#5b5b5b]">
                              {tKey(lang, 'adminUi.choose_the_parent_topic_group_then_enter_names_and_descr')}
                            </DialogDescription>
                          </DialogHeader>
                      <form
                        onSubmit={onCreateSubject}
                        className="mb-2 space-y-3 rounded-md border border-[#e5d9de] bg-[#fcfbfc] p-3"
                      >
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-[#5b5b5b]">
                            {tKey(lang, 'adminUi.topic_group_parent_2')}
                          </Label>
                          <Select
                            value={String(subjectForm.material_topic_group_id || 1)}
                            onValueChange={(v) =>
                              setSubjectForm({ ...subjectForm, material_topic_group_id: Number(v) })
                            }
                          >
                            <SelectTrigger className="border-[#d2d2d2] bg-white h-9">
                              <SelectValue
                                placeholder={tKey(lang, 'adminUi.select_topic_group')}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {materialTopicGroupsCreatePick.map((g) => (
                                <SelectItem key={g.id} value={String(g.id)}>
                                  {g.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 rounded-md border border-[#ece2e6] bg-white px-3 py-2">
                          <AdminAccessTierField
                            lang={lang}
                            id="new-material-subject-access-tier"
                            value={subjectForm.access_tier}
                            onChange={(v) => setSubjectForm({ ...subjectForm, access_tier: v })}
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                          <div className="space-y-2 rounded-md border border-[#ece2e6] bg-white p-2">
                            <p className="text-xs font-bold text-[#7a2038]"><AdminLocaleBlockLabel lang={lang} block="vi" /></p>
                            <div className="space-y-1">
                              <Label htmlFor="new-subject-name-vi" className="text-xs text-[#5b5b5b]">
                                {tKey(lang, 'adminUi.topic_name_vi')}
                              </Label>
                              <Input
                                id="new-subject-name-vi"
                                placeholder={tKey(lang, 'adminUi.name_vi')}
                                value={subjectForm.name_vi}
                                onChange={(e) =>
                                  setSubjectForm({ ...subjectForm, name_vi: e.target.value })
                                }
                                required
                                className="border-[#d2d2d2] bg-white h-9"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="new-subject-desc-vi" className="text-xs text-[#5b5b5b]">
                                {tKey(lang, 'adminUi.description_vi')}
                              </Label>
                              <Input
                                id="new-subject-desc-vi"
                                placeholder={tKey(lang, 'adminUi.description_vi_3')}
                                value={subjectForm.description_vi}
                                onChange={(e) =>
                                  setSubjectForm({ ...subjectForm, description_vi: e.target.value })
                                }
                                className="border-[#d2d2d2] bg-white h-9"
                              />
                            </div>
                          </div>
                          <div className="space-y-2 rounded-md border border-[#ece2e6] bg-white p-2">
                            <p className="text-xs font-bold text-[#7a2038]"><AdminLocaleBlockLabel lang={lang} block="en" /></p>
                            <div className="space-y-1">
                              <Label htmlFor="new-subject-name-en" className="text-xs text-[#5b5b5b]">
                                {tKey(lang, 'adminUi.topic_name_en')}
                              </Label>
                              <Input
                                id="new-subject-name-en"
                                placeholder={tKey(lang, 'adminUi.name_en')}
                                value={subjectForm.name_en}
                                onChange={(e) =>
                                  setSubjectForm({ ...subjectForm, name_en: e.target.value })
                                }
                                className="border-[#d2d2d2] bg-white h-9"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="new-subject-desc-en" className="text-xs text-[#5b5b5b]">
                                {tKey(lang, 'adminUi.description_en')}
                              </Label>
                              <Input
                                id="new-subject-desc-en"
                                placeholder={tKey(lang, 'adminUi.description_en_2')}
                                value={subjectForm.description_en}
                                onChange={(e) =>
                                  setSubjectForm({ ...subjectForm, description_en: e.target.value })
                                }
                                className="border-[#d2d2d2] bg-white h-9"
                              />
                            </div>
                          </div>
                          <div className="space-y-2 rounded-md border border-[#ece2e6] bg-white p-2">
                            <p className="text-xs font-bold text-[#7a2038]"><AdminLocaleBlockLabel lang={lang} block="es" /></p>
                            <div className="space-y-1">
                              <Label htmlFor="new-subject-name-es" className="text-xs text-[#5b5b5b]">
                                {tKey(lang, 'adminUi.topic_name_es')}
                              </Label>
                              <Input
                                id="new-subject-name-es"
                                placeholder={tKey(lang, 'adminUi.name_es')}
                                value={subjectForm.name_es}
                                onChange={(e) =>
                                  setSubjectForm({ ...subjectForm, name_es: e.target.value })
                                }
                                required
                                className="border-[#d2d2d2] bg-white h-9"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="new-subject-desc-es" className="text-xs text-[#5b5b5b]">
                                {tKey(lang, 'adminUi.description_es')}
                              </Label>
                              <Input
                                id="new-subject-desc-es"
                                placeholder={tKey(lang, 'adminUi.description_es_2')}
                                value={subjectForm.description_es}
                                onChange={(e) =>
                                  setSubjectForm({ ...subjectForm, description_es: e.target.value })
                                }
                                className="border-[#d2d2d2] bg-white h-9"
                              />
                            </div>
                          </div>
                        </div>
                        <Button
                          type="submit"
                          className="h-9 bg-[#7a2038] hover:bg-[#5a1428] text-white font-bold"
                        >
                          {tKey(lang, 'adminUi.add_topic_2')}
                        </Button>
                      </form>
                        </DialogContent>
                      </Dialog>
                      <div className="space-y-0 divide-y divide-[#ece2e6] overflow-hidden rounded-md border border-[#e5d9de] bg-white">
                        {filteredAdminSubjects.map((item) => (
                          <div
                            key={item.id}
                            className="p-2 border-0 bg-white rounded-none"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                                  <span className="font-bold text-[#5a1428]">
                                    {adminTrilingualField(lang, item.name_vi, item.name_es, item.name_en)}
                                  </span>
                                  <span
                                    className={`text-[11px] font-semibold ${
                                      item.is_active !== false ? 'text-emerald-700' : 'text-[#6b6570]'
                                    }`}
                                  >
                                    {item.is_active !== false
                                      ? tKey(lang, 'adminUi.active')
                                      : tKey(lang, 'adminUi.hidden_2')}
                                  </span>
                                  {String(item.access_tier || '').toLowerCase() === 'premium' ? (
                                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-900">
                                      {tKey(lang, 'listing.content_tier_advanced')}
                                    </span>
                                  ) : null}
                                </div>
                                <div className="text-[11px] text-[#7a2038]">
                                  {adminTrilingualField(
                                    lang,
                                    item.material_topic_group_name_vi,
                                    item.material_topic_group_name_es,
                                    item.material_topic_group_name_en
                                  ) || '-'}
                                </div>
                                <div className="text-xs text-[#5b5b5b]">
                                  {adminTrilingualField(
                                    lang,
                                    item.description_vi,
                                    item.description_es,
                                    item.description_en
                                  ) || '-'}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onToggleMaterialSubjectActive(item)}
                                  className="h-8 w-8 shrink-0 border-[#d2d2d2] bg-white p-0 hover:bg-[#fdf5f8]"
                                  title={
                                    item.is_active !== false
                                      ? tKey(lang, 'adminUi.hide_from_students')
                                      : tKey(lang, 'adminUi.show_to_students')
                                  }
                                >
                                  {item.is_active !== false ? (
                                    <EyeOff className="h-3.5 w-3.5" />
                                  ) : (
                                    <Eye className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                                <AdminActionIconButton onClick={() => onStartEditSubject(item)} title={tKey(lang, 'adminUi.edit_topic')} kind="edit" icon={<Edit className="h-3.5 w-3.5" />} />
                                <AdminActionIconButton onClick={() => onDeleteSubject(item)} title={tKey(lang, 'adminUi.delete_topic')} kind="delete" icon={<Trash2 className="h-3.5 w-3.5" />} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Dialog
                        open={editingSubjectId != null}
                        onOpenChange={(open) => {
                          if (!open) onCancelEditSubject();
                        }}
                      >
                        <DialogContent
                          className="max-w-4xl max-h-[min(92vh,880px)] overflow-y-auto"
                          closeLabel={tKey(lang, 'adminUi.close')}
                          suppressAriaDescribedBy={false}
                        >
                          <DialogHeader>
                            <DialogTitle className="text-left text-[#6b1b31]">
                              {tKey(lang, 'adminUi.edit_material_topic')}
                            </DialogTitle>
                            <DialogDescription className="text-left text-[#5b5b5b]">
                              {tKey(lang, 'adminUi.set_the_parent_group_and_edit_names_and_descriptions_stu')}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-3 pt-1">
                            <div className="space-y-1">
                              <Label className="text-xs font-medium text-[#5b5b5b]">
                                {tKey(lang, 'adminUi.topic_group_parent_2')}
                              </Label>
                              <Select
                                value={String(editSubjectForm.material_topic_group_id || 1)}
                                onValueChange={(v) =>
                                  setEditSubjectForm({
                                    ...editSubjectForm,
                                    material_topic_group_id: Number(v),
                                  })
                                }
                              >
                                <SelectTrigger className="border-[#d2d2d2] bg-white h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {materialTopicGroups.map((g) => (
                                    <SelectItem key={g.id} value={String(g.id)}>
                                      {g.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 rounded-md border border-[#ece2e6] bg-[#fcfbfc] px-3 py-2">
                              <AdminAccessTierField
                                lang={lang}
                                id="edit-material-subject-access-tier"
                                value={editSubjectForm.access_tier}
                                onChange={(v) =>
                                  setEditSubjectForm({ ...editSubjectForm, access_tier: v })
                                }
                              />
                            </div>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                              <div className="space-y-2 rounded-md border border-[#e8d7dd] bg-white p-3">
                                <p className="text-xs font-bold text-[#7a2038]"><AdminLocaleBlockLabel lang={lang} block="vi" /></p>
                                <div className="space-y-1">
                                  <Label htmlFor="edit-subject-name-vi" className="text-xs text-[#5b5b5b]">
                                    {tKey(lang, 'adminUi.topic_name_vi')}
                                  </Label>
                                  <Input
                                    id="edit-subject-name-vi"
                                    value={editSubjectForm.name_vi}
                                    onChange={(e) =>
                                      setEditSubjectForm({
                                        ...editSubjectForm,
                                        name_vi: e.target.value,
                                      })
                                    }
                                    className="border-[#d2d2d2] bg-white h-9"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor="edit-subject-desc-vi" className="text-xs text-[#5b5b5b]">
                                    {tKey(lang, 'adminUi.description_vi')}
                                  </Label>
                                  <Input
                                    id="edit-subject-desc-vi"
                                    value={editSubjectForm.description_vi}
                                    onChange={(e) =>
                                      setEditSubjectForm({
                                        ...editSubjectForm,
                                        description_vi: e.target.value,
                                      })
                                    }
                                    className="border-[#d2d2d2] bg-white h-9"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2 rounded-md border border-[#e8d7dd] bg-white p-3">
                                <p className="text-xs font-bold text-[#7a2038]"><AdminLocaleBlockLabel lang={lang} block="en" /></p>
                                <div className="space-y-1">
                                  <Label htmlFor="edit-subject-name-en" className="text-xs text-[#5b5b5b]">
                                    {tKey(lang, 'adminUi.topic_name_en')}
                                  </Label>
                                  <Input
                                    id="edit-subject-name-en"
                                    value={editSubjectForm.name_en}
                                    onChange={(e) =>
                                      setEditSubjectForm({
                                        ...editSubjectForm,
                                        name_en: e.target.value,
                                      })
                                    }
                                    className="border-[#d2d2d2] bg-white h-9"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor="edit-subject-desc-en" className="text-xs text-[#5b5b5b]">
                                    {tKey(lang, 'adminUi.description_en')}
                                  </Label>
                                  <Input
                                    id="edit-subject-desc-en"
                                    value={editSubjectForm.description_en}
                                    onChange={(e) =>
                                      setEditSubjectForm({
                                        ...editSubjectForm,
                                        description_en: e.target.value,
                                      })
                                    }
                                    className="border-[#d2d2d2] bg-white h-9"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2 rounded-md border border-[#e8d7dd] bg-white p-3">
                                <p className="text-xs font-bold text-[#7a2038]"><AdminLocaleBlockLabel lang={lang} block="es" /></p>
                                <div className="space-y-1">
                                  <Label htmlFor="edit-subject-name-es" className="text-xs text-[#5b5b5b]">
                                    {tKey(lang, 'adminUi.topic_name_es')}
                                  </Label>
                                  <Input
                                    id="edit-subject-name-es"
                                    value={editSubjectForm.name_es}
                                    onChange={(e) =>
                                      setEditSubjectForm({
                                        ...editSubjectForm,
                                        name_es: e.target.value,
                                      })
                                    }
                                    className="border-[#d2d2d2] bg-white h-9"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor="edit-subject-desc-es" className="text-xs text-[#5b5b5b]">
                                    {tKey(lang, 'adminUi.description_es')}
                                  </Label>
                                  <Input
                                    id="edit-subject-desc-es"
                                    value={editSubjectForm.description_es}
                                    onChange={(e) =>
                                      setEditSubjectForm({
                                        ...editSubjectForm,
                                        description_es: e.target.value,
                                      })
                                    }
                                    className="border-[#d2d2d2] bg-white h-9"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-1">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => {
                                  const id = editingSubjectId;
                                  if (id == null) return;
                                  const row =
                                    filteredAdminSubjects.find((s: { id: number }) => s.id === id) ??
                                    ({ id } as any);
                                  onSaveEditSubject(row);
                                }}
                                className="h-9 bg-[#7a2038] hover:bg-[#5a1428] text-white"
                              >
                                {tKey(lang, 'adminUi.save')}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={onCancelEditSubject}
                                className="h-9 border-[#d2d2d2] bg-white"
                              >
                                {tKey(lang, 'adminUi.cancel')}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </section>
                  )}

                  {/* Add Material Form */}
                  {materialsSubTab === 'manage' && (
                    <div className="border border-[#dbe3ee] bg-white rounded-none p-3">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-[#5a1428] text-base md:text-lg">
                          {tKey(lang, 'adminUi.add_bilingual_material')}
                        </h3>
                        <Button
                          type="button"
                          onClick={goNewMaterialPostPage}
                          className="h-9 bg-[#7a2038] hover:bg-[#5a1428] text-white font-bold"
                        >
                          {tKey(lang, 'adminUi.add_new')}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Materials List */}
                  {materialsSubTab === 'manage' && (
                    <div className="border border-[#dbe3ee] bg-white rounded-none p-3">
                      <h3 className="mb-2 font-bold text-[#5a1428] text-base md:text-base">
                        {tKey(lang, 'adminUi.materials_list')} (
                        {filteredMaterials.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <Label className="text-xs text-[#5b5b5b]">
                            {tKey(lang, 'adminUi.topic_group')}
                          </Label>
                          <Select
                            value={materialListFilterGroupId}
                            onValueChange={(v) => {
                              setMaterialListFilterGroupId(v);
                              const gid = Number(v);
                              const scoped =
                                v === 'all' || !Number.isFinite(gid) || gid <= 0
                                  ? subjects
                                  : subjects.filter(
                                      (item: any) => Number(item.material_topic_group_id) === gid
                                    );
                              if (scoped.length) {
                                let nextList: number | 'all' =
                                  materialListSubjectId === 'all'
                                    ? 'all'
                                    : materialListSubjectId != null
                                      ? Number(materialListSubjectId)
                                      : Number(scoped[0].id);
                                if (
                                  nextList !== 'all' &&
                                  !scoped.some((s: any) => Number(s.id) === nextList)
                                ) {
                                  nextList = Number(scoped[0].id);
                                }
                                const nextSel = scoped.some(
                                  (s: any) => Number(s.id) === Number(selectedSubjectId)
                                )
                                  ? Number(selectedSubjectId)
                                  : Number(scoped[0].id);
                                setSelectedSubjectId(nextSel);
                                setMaterialListSubjectId(nextList);
                              }
                            }}
                          >
                            <SelectTrigger className="border-[#d2d2d2] bg-white h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">
                                {tKey(lang, 'adminUi.all_topic_groups')}
                              </SelectItem>
                              {materialTopicGroups.map((g) => (
                                <SelectItem key={g.id} value={String(g.id)}>
                                  {g.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs text-[#5b5b5b]">
                            {tKey(lang, 'adminUi.material_topics')}
                          </Label>
                          <Select
                            value={
                              materialListSubjectId === 'all'
                                ? 'all'
                                : materialListSubjectId != null
                                  ? String(materialListSubjectId)
                                  : ''
                            }
                            onValueChange={(v) => {
                              if (v === 'all') {
                                setMaterialListSubjectId('all');
                                return;
                              }
                              const nextSubjectId = Number(v);
                              setMaterialListSubjectId(nextSubjectId);
                              setSelectedSubjectId(nextSubjectId);
                            }}
                          >
                            <SelectTrigger className="border-[#d2d2d2] bg-white h-9">
                              <SelectValue
                                placeholder={tKey(lang, 'adminUi.select_topic')}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">
                                {tKey(lang, 'adminUi.all_topics')}
                              </SelectItem>
                              {listSubjectsByGroup.map((s: any) => (
                                <SelectItem key={s.id} value={String(s.id)}>
                                  {s.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="text-xs text-[#5b5b5b] md:self-end">
                          {tKey(lang, 'adminUi.filtered_by_topic')}{' '}
                          <span className="font-semibold text-[#5a1428]">
                            {materialListSubjectId === 'all'
                              ? tKey(lang, 'adminUi.all_topics_current_filter')
                              : selectedSubject?.name || '-'}
                          </span>
                        </div>
                      </div>
                      <div className="mb-3">
                        <Input
                          value={materialSearch}
                          onChange={(e) => setMaterialSearch(e.target.value)}
                          placeholder={tKey(lang, 'adminUi.search_by_title_vi_es_description')}
                          className="h-9 border-[#d2d2d2] bg-white"
                        />
                      </div>
                      <div className="space-y-0 divide-y divide-[#ece2e6] border border-[#e9dfe3]">
                        {paginatedMaterials.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex flex-col gap-2 border-0 bg-white p-2 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                                <span className="font-bold text-[#5a1428]">
                                  {adminTrilingualField(lang, item.title_vi || '-', item.title_es || '-', item.title_en)}
                                </span>
                                {String(item.access_tier || '').toLowerCase() === 'premium' ? (
                                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-900">
                                    {tKey(lang, 'listing.content_tier_advanced')}
                                  </span>
                                ) : null}
                              </div>
                              <div className="text-xs text-[#5b5b5b]">
                                {adminTrilingualField(
                                  lang,
                                  item.excerpt_vi || '—',
                                  item.excerpt_es || '—',
                                  item.excerpt_en
                                )}
                                {item.is_published === false ? (
                                  <span className="ml-1 font-semibold text-amber-800">{tKey(lang, 'adminUi.hidden')}</span>
                                ) : null}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="h-8 border-[#d2d2d2] bg-white hover:bg-[#fdf5f8]"
                              >
                                <a
                                  href={localePath(lang, `/materials/${item.subject_id}/${item.id}`)}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              </Button>
                              <AdminActionIconButton
                                onClick={() => goEditMaterialPostPage(item)}
                                title={tKey(lang, 'adminUi.edit_material')}
                                kind="edit"
                                className="h-8 w-8 px-0"
                                icon={<Edit className="h-3.5 w-3.5 shrink-0" />}
                              />
                              <AdminActionIconButton onClick={() => onDeleteMaterial(item)} title={tKey(lang, 'adminUi.delete_material')} kind="delete" icon={<Trash2 className="h-3.5 w-3.5" />} />
                            </div>
                          </div>
                        ))}
                        <AdminListPaginationControls
                          lang={lang}
                          page={adminMaterialsPage}
                          pageSize={ADMIN_LIST_PAGE_SIZE}
                          total={filteredMaterials.length}
                          onPageChange={setAdminMaterialsListPage}
                        />
                      </div>
                    </div>
                  )}
                </AdminMaterialsTabShell>
  );
}
