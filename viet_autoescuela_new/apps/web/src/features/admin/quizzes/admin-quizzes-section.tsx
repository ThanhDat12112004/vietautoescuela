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
import { ADMIN_LIST_PAGE_SIZE } from '@/features/admin/admin.constants';
import { adminTrilingualField } from '@/features/admin/admin.lang';
import { AdminLocaleBlockLabel } from '@/features/admin/components/AdminLocaleBlockLabel';
import { fillTemplate, tKey } from '@viet/i18n';
import {
  AdminAccessTierField,
  AdminActionIconButton,
  AdminListPaginationControls,
} from '@/features/admin/admin.shared-components';
import { AdminQuizzesTabShell } from '@/features/admin/quizzes/admin-quizzes-tab';
import { Edit, Eye, EyeOff, Trash2 } from 'lucide-react';

export function AdminQuizzesSection(props: any) {
  const {
    adminQuizzesPage,
    createQuizCategories,
    creatingQuiz,
    currentEditQuestion,
    currentEditQuestionImageFile,
    currentEditQuestionImagePreview,
    currentEditQuestionIndex,
    currentQuestionDraft,
    currentQuestionImageFile,
    currentQuestionImagePreview,
    currentQuestionIndex,
    editingQuizCategoryId,
    editingQuizId,
    editingQuizTopicGroupId,
    editQuizCategories,
    editQuizCategoryForm,
    editQuizForm,
    editQuizModalStep,
    editQuizQuestions,
    editQuizTopicGroupForm,
    filteredAdminQuizzes,
    filteredQuizCategories,
    filteredQuizTopicGroups,
    getQuizDisplayDescription,
    getQuizDisplayTitle,
    getQuizTopicGroupLabel,
    getQuizCategoryLabel,
    getQuizCategoryParentGroupLabel,
    lang,
    listQuizCategoriesByGroup,
    loadingEditQuizDetail,
    newQuizCategory,
    newQuizTopicGroup,
    onAddEditQuestion,
    onCancelEditQuiz,
    onChangeQuestionCount,
    onCreateQuiz,
    onCreateQuizCategory,
    onCreateQuizTopicGroup,
    onToggleQuizTopicGroupActive,
    onDeleteQuiz,
    onDeleteQuizCategory,
    onDeleteQuizTopicGroup,
    onSaveEditQuiz,
    onSaveEditQuizCategory,
    onToggleQuizCategoryActive,
    onSaveEditQuizTopicGroup,
    onStartEditQuiz,
    onStartEditQuizCategory,
    onStartEditQuizTopicGroup,
    onToggleQuiz,
    paginatedAdminQuizzes,
    questionCount,
    questionDrafts,
    quizCategoriesAdmin,
    quizCategoryCreateDialogOpen,
    quizCategoryFilterGroupId,
    quizCategorySearch,
    quizCreateDialogOpen,
    quizCreateModalStep,
    quizForm,
    quizListFilterCategoryId,
    quizListFilterGroupId,
    quizSearch,
    quizTopicGroupCreateDialogOpen,
    quizTopicGroupsAdmin,
    quizTopicGroupsPickActive,
    quizTopicGroupSearch,
    quizzesHierarchyTab,
    quizzesSubTab,
    resolveMediaUrl,
    savingEditQuizDetail,
    setAdminQuizzesListPage,
    setCurrentEditQuestionIndex,
    setCurrentQuestionIndex,
    setEditCorrectAnswer,
    setEditingQuizCategoryId,
    setEditingQuizTopicGroupId,
    setEditQuizCategoryForm,
    setEditQuizForm,
    setEditQuizModalStep,
    setEditQuizTopicGroupForm,
    setNewQuizCategory,
    setNewQuizTopicGroup,
    setQuizCategoryCreateDialogOpen,
    setQuizCategoryFilterGroupId,
    setQuizCategorySearch,
    setQuizCreateDialogOpen,
    setQuizCreateModalStep,
    setQuizForm,
    setQuizListFilterCategoryId,
    setQuizListFilterGroupId,
    setQuizSearch,
    setQuizTopicGroupCreateDialogOpen,
    setQuizTopicGroupSearch,
    setQuizzesHierarchyTab,
    setQuizzesSubTab,
    updateCurrentQuestionField,
    updateCurrentQuestionImage,
    updateEditAnswerField,
    updateEditQuestionField,
    updateEditQuestionImage,
  } = props;

  return (
                <AdminQuizzesTabShell
                  lang={lang}
                  quizzesSubTab={quizzesSubTab}
                  quizzesHierarchyTab={quizzesHierarchyTab}
                  setQuizzesSubTab={setQuizzesSubTab}
                  setQuizzesHierarchyTab={setQuizzesHierarchyTab}
                >

                  {quizzesSubTab === 'types' && quizzesHierarchyTab === 'topic_groups' && (
                    <section className="rounded-lg border border-[#e3ccd4] bg-white p-4 shadow-sm">
                      <header className="mb-4 border-b border-[#f0e8ec] pb-3">
                        <h2 className="text-base font-bold tracking-tight text-[#5a1428]">
                          {tKey(lang, 'adminUi.quiz_topic_groups')}
                        </h2>
                        <p className="mt-1 text-xs leading-relaxed text-[#6b6570]">
                          {tKey(lang, 'adminUi.parent_group_for_topics_quizzes_show_or_hide_to_learners')}
                        </p>
                      </header>
                      <div className="mb-2">
                        <Input
                          value={quizTopicGroupSearch}
                          onChange={(e) => setQuizTopicGroupSearch(e.target.value)}
                          placeholder={tKey(lang, 'adminUi.search_by_code_name_description')}
                          className="h-9 w-full border-[#d2d2d2] bg-white"
                        />
                      </div>
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <h3 className="min-w-0 flex-1 font-bold text-[#5a1428] text-base leading-snug">
                          {tKey(lang, 'adminUi.add_quiz_topic_group')}
                        </h3>
                        <Button
                          type="button"
                          onClick={() => setQuizTopicGroupCreateDialogOpen(true)}
                          className="h-9 shrink-0 rounded-full bg-[#7a2038] px-5 font-bold text-white shadow-sm hover:bg-[#5a1428]"
                        >
                          {tKey(lang, 'adminUi.add_new')}
                        </Button>
                      </div>
                        <Dialog open={quizTopicGroupCreateDialogOpen} onOpenChange={setQuizTopicGroupCreateDialogOpen}>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle className="text-[#6b1b31]">
                                {tKey(lang, 'adminUi.add_quiz_topic_group')}
                              </DialogTitle>
                            </DialogHeader>
                        <form onSubmit={onCreateQuizTopicGroup} className="space-y-2 rounded-md border border-[#e5d9de] bg-[#fcfbfc] p-3">
                          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                            <div className="space-y-1 rounded-md border border-[#ece2e6] bg-white p-2">
                              <p className="text-xs font-bold text-[#7a2038]"><AdminLocaleBlockLabel lang={lang} block="vi" /></p>
                              <Input placeholder={tKey(lang, 'adminUi.name_vi')} value={newQuizTopicGroup.name_vi} onChange={(e) => setNewQuizTopicGroup((p) => ({ ...p, name_vi: e.target.value }))} className="border-[#d2d2d2] bg-white h-9" />
                              <Input placeholder={tKey(lang, 'adminUi.description_vi_3')} value={newQuizTopicGroup.description_vi} onChange={(e) => setNewQuizTopicGroup((p) => ({ ...p, description_vi: e.target.value }))} className="border-[#d2d2d2] bg-white h-9" />
                            </div>
                            <div className="space-y-1 rounded-md border border-[#ece2e6] bg-white p-2">
                              <p className="text-xs font-bold text-[#7a2038]"><AdminLocaleBlockLabel lang={lang} block="en" /></p>
                              <Input placeholder={tKey(lang, 'adminUi.name_en')} value={newQuizTopicGroup.name_en} onChange={(e) => setNewQuizTopicGroup((p) => ({ ...p, name_en: e.target.value }))} className="border-[#d2d2d2] bg-white h-9" />
                              <Input placeholder={tKey(lang, 'adminUi.description_en_2')} value={newQuizTopicGroup.description_en} onChange={(e) => setNewQuizTopicGroup((p) => ({ ...p, description_en: e.target.value }))} className="border-[#d2d2d2] bg-white h-9" />
                            </div>
                            <div className="space-y-1 rounded-md border border-[#ece2e6] bg-white p-2">
                              <p className="text-xs font-bold text-[#7a2038]"><AdminLocaleBlockLabel lang={lang} block="es" /></p>
                              <Input placeholder={tKey(lang, 'adminUi.name_es')} value={newQuizTopicGroup.name_es} onChange={(e) => setNewQuizTopicGroup((p) => ({ ...p, name_es: e.target.value }))} className="border-[#d2d2d2] bg-white h-9" />
                              <Input placeholder={tKey(lang, 'adminUi.description_es_2')} value={newQuizTopicGroup.description_es} onChange={(e) => setNewQuizTopicGroup((p) => ({ ...p, description_es: e.target.value }))} className="border-[#d2d2d2] bg-white h-9" />
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 rounded-md border border-[#ece2e6] bg-white px-3 py-2">
                            <label className="flex cursor-pointer items-center gap-2 text-xs text-[#5b5b5b]">
                              <input
                                type="checkbox"
                                checked={Boolean(newQuizTopicGroup.allow_random_quiz)}
                                onChange={(e) =>
                                  setNewQuizTopicGroup((p) => ({ ...p, allow_random_quiz: e.target.checked }))
                                }
                                className="h-4 w-4 rounded border-[#c4c4c4]"
                              />
                              {tKey(lang, 'adminUi.allow_random_quiz_for_this_group')}
                            </label>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-[#5b5b5b]">{tKey(lang, 'adminUi.access')}</span>
                              <Select
                                value={newQuizTopicGroup.access_tier}
                                onValueChange={(v) =>
                                  setNewQuizTopicGroup((p) => ({
                                    ...p,
                                    access_tier: v as 'free' | 'premium',
                                  }))
                                }
                              >
                                <SelectTrigger className="h-8 w-[140px] border-[#d2d2d2] bg-white text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="free">{tKey(lang, 'adminUi.free')}</SelectItem>
                                  <SelectItem value="premium">
                                    {tKey(lang, 'adminUi.tier_premium')}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <Button type="submit" className="h-10 rounded-md bg-[#7a2038] hover:bg-[#5a1428] text-white">{tKey(lang, 'adminUi.add_topic_group_2')}</Button>
                        </form>
                          </DialogContent>
                        </Dialog>
                        <div className="overflow-hidden rounded-md border border-[#e5d9de] divide-y divide-[#ece2e6] bg-white">
                          {filteredQuizTopicGroups.map((groupItem) => (
                            <div key={groupItem.id} className="group rounded-none border-0 bg-white p-2 text-xs">
                              <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                                    <span className="font-bold text-[#5a1428]">
                                      {getQuizTopicGroupLabel(groupItem)}
                                    </span>
                                    {groupItem.is_active ? (
                                      <span className="text-[11px] font-semibold text-emerald-700">
                                        {tKey(lang, 'adminUi.active')}
                                      </span>
                                    ) : null}
                                    {String(groupItem.access_tier || '').toLowerCase() === 'premium' ? (
                                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-900">
                                        {tKey(lang, 'listing.content_tier_advanced')}
                                      </span>
                                    ) : null}
                                    {groupItem.allow_random_quiz ? (
                                      <span className="text-[10px] font-semibold text-primary/80">Random</span>
                                    ) : null}
                                  </div>
                                  <div className="text-xs text-[#5b5b5b]">
                                    {adminTrilingualField(
                                      lang,
                                      groupItem.description_vi || '-',
                                      groupItem.description_es || '-',
                                      groupItem.description_en
                                    )}
                                  </div>
                                </div>
                                <div className="admin-row-actions flex gap-1">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onToggleQuizTopicGroupActive(groupItem)}
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
                                  <AdminActionIconButton onClick={() => onStartEditQuizTopicGroup(groupItem)} title={tKey(lang, 'adminUi.edit')} kind="edit" className="h-8 w-8 rounded-md px-0" icon={<Edit className="h-3.5 w-3.5" />} />
                                  <AdminActionIconButton onClick={() => onDeleteQuizTopicGroup(groupItem)} title={tKey(lang, 'adminUi.delete')} kind="delete" className="h-8 w-8 rounded-md px-0" icon={<Trash2 className="h-3.5 w-3.5" />} />
                                </div>
                              </div>
                              {editingQuizTopicGroupId === groupItem.id && (
                                <Dialog open={editingQuizTopicGroupId === groupItem.id} onOpenChange={(open) => !open && setEditingQuizTopicGroupId(null)}>
                                  <DialogContent className="max-w-3xl">
                                    <DialogHeader>
                                      <DialogTitle className="text-[#6b1b31]">
                                        {tKey(lang, 'adminUi.edit_quiz_topic_group')}
                                      </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-3">
                                      <p className="text-xs text-[#5b5b5b]">
                                        {tKey(lang, 'adminUi.edit_name_and_description_visibility_for_learners_eye_ic')}
                                      </p>
                                      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                                        <div className="space-y-2 rounded-md border border-[#e8d7dd] bg-white p-3">
                                          <p className="text-xs font-bold text-[#7a2038]"><AdminLocaleBlockLabel lang={lang} block="vi" /></p>
                                          <Input placeholder={tKey(lang, 'adminUi.name_vi')} value={editQuizTopicGroupForm.name_vi} onChange={(e) => setEditQuizTopicGroupForm((p) => ({ ...p, name_vi: e.target.value }))} className="h-9 border-[#d2d2d2]" />
                                          <Input placeholder={tKey(lang, 'adminUi.description_vi_3')} value={editQuizTopicGroupForm.description_vi} onChange={(e) => setEditQuizTopicGroupForm((p) => ({ ...p, description_vi: e.target.value }))} className="h-9 border-[#d2d2d2]" />
                                        </div>
                                        <div className="space-y-2 rounded-md border border-[#e8d7dd] bg-white p-3">
                                          <p className="text-xs font-bold text-[#7a2038]"><AdminLocaleBlockLabel lang={lang} block="en" /></p>
                                          <Input placeholder={tKey(lang, 'adminUi.name_en')} value={editQuizTopicGroupForm.name_en} onChange={(e) => setEditQuizTopicGroupForm((p) => ({ ...p, name_en: e.target.value }))} className="h-9 border-[#d2d2d2]" />
                                          <Input placeholder={tKey(lang, 'adminUi.description_en_2')} value={editQuizTopicGroupForm.description_en} onChange={(e) => setEditQuizTopicGroupForm((p) => ({ ...p, description_en: e.target.value }))} className="h-9 border-[#d2d2d2]" />
                                        </div>
                                        <div className="space-y-2 rounded-md border border-[#e8d7dd] bg-white p-3">
                                          <p className="text-xs font-bold text-[#7a2038]"><AdminLocaleBlockLabel lang={lang} block="es" /></p>
                                          <Input placeholder={tKey(lang, 'adminUi.name_es')} value={editQuizTopicGroupForm.name_es} onChange={(e) => setEditQuizTopicGroupForm((p) => ({ ...p, name_es: e.target.value }))} className="h-9 border-[#d2d2d2]" />
                                          <Input placeholder={tKey(lang, 'adminUi.description_es_2')} value={editQuizTopicGroupForm.description_es} onChange={(e) => setEditQuizTopicGroupForm((p) => ({ ...p, description_es: e.target.value }))} className="h-9 border-[#d2d2d2]" />
                                        </div>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-4 rounded-md border border-[#ece2e6] bg-[#fcfbfc] px-3 py-2">
                                        <label className="flex cursor-pointer items-center gap-2 text-xs text-[#5b5b5b]">
                                          <input
                                            type="checkbox"
                                            checked={Boolean(editQuizTopicGroupForm.allow_random_quiz)}
                                            onChange={(e) =>
                                              setEditQuizTopicGroupForm((p) => ({
                                                ...p,
                                                allow_random_quiz: e.target.checked,
                                              }))
                                            }
                                            className="h-4 w-4 rounded border-[#c4c4c4]"
                                          />
                                          {tKey(lang, 'adminUi.allow_random_quiz')}
                                        </label>
                                        <div className="flex items-center gap-2 text-xs">
                                          <span className="text-[#5b5b5b]">
                                            {tKey(lang, 'adminUi.access')}
                                          </span>
                                          <Select
                                            value={editQuizTopicGroupForm.access_tier}
                                            onValueChange={(v) =>
                                              setEditQuizTopicGroupForm((p) => ({
                                                ...p,
                                                access_tier: v as 'free' | 'premium',
                                              }))
                                            }
                                          >
                                            <SelectTrigger className="h-8 w-[140px] border-[#d2d2d2] bg-white text-xs">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="free">
                                                {tKey(lang, 'adminUi.free')}
                                              </SelectItem>
                                              <SelectItem value="premium">
                                    {tKey(lang, 'adminUi.tier_premium')}
                                  </SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button type="button" size="sm" onClick={() => onSaveEditQuizTopicGroup(groupItem)} className="h-9 bg-[#7a2038] hover:bg-[#5a1428] text-white">{tKey(lang, 'adminUi.save')}</Button>
                                        <Button type="button" size="sm" variant="outline" onClick={() => setEditingQuizTopicGroupId(null)} className="h-9 border-[#d2d2d2] bg-white">{tKey(lang, 'adminUi.cancel')}</Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                          ))}
                        </div>
                    </section>
                  )}
                  {quizzesSubTab === 'types' && quizzesHierarchyTab === 'types' && (
                    <section className="rounded-lg border border-[#e3ccd4] bg-white p-4 shadow-sm">
                      <header className="mb-4 border-b border-[#f0e8ec] pb-3">
                        <h2 className="text-base font-bold tracking-tight text-[#5a1428]">
                          {tKey(lang, 'adminUi.quiz_topics')}
                        </h2>
                        <p className="mt-1 text-xs leading-relaxed text-[#6b6570]">
                          {tKey(lang, 'adminUi.organize_quizzes_by_group_pick_a_topic_group_to_filter_t')}
                        </p>
                      </header>
                      <div className="mb-4 max-w-md">
                        <Label className="text-xs font-medium text-[#5b5b5b]">
                          {tKey(lang, 'adminUi.filter_by_parent_group')}
                        </Label>
                        <Select
                          value={quizCategoryFilterGroupId}
                          onValueChange={setQuizCategoryFilterGroupId}
                        >
                          <SelectTrigger className="h-9 border-[#d2d2d2] bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">
                              {tKey(lang, 'adminUi.all_topic_groups')}
                            </SelectItem>
                            {quizTopicGroupsAdmin.map((groupItem) => (
                              <SelectItem key={groupItem.id} value={String(groupItem.id)}>
                                {getQuizTopicGroupLabel(groupItem)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="mb-2">
                        <Input
                          value={quizCategorySearch}
                          onChange={(e) => setQuizCategorySearch(e.target.value)}
                          placeholder={tKey(lang, 'adminUi.search_topics_by_name_description')}
                          className="h-9 w-full border-[#d2d2d2] bg-white"
                        />
                      </div>
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <h3 className="min-w-0 flex-1 font-bold text-[#5a1428] text-base leading-snug">
                          {tKey(lang, 'adminUi.add_quiz_topic_2')}
                        </h3>
                        <Button
                          type="button"
                          onClick={() => setQuizCategoryCreateDialogOpen(true)}
                          className="h-9 shrink-0 rounded-full bg-[#7a2038] px-5 font-bold text-white shadow-sm hover:bg-[#5a1428]"
                        >
                          {tKey(lang, 'adminUi.add_new')}
                        </Button>
                      </div>
                      <Dialog open={quizCategoryCreateDialogOpen} onOpenChange={setQuizCategoryCreateDialogOpen}>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle className="text-[#6b1b31]">
                              {tKey(lang, 'adminUi.add_quiz_topic_2')}
                            </DialogTitle>
                          </DialogHeader>
                      <form
                        onSubmit={onCreateQuizCategory}
                        className="mb-2 space-y-2 rounded-md border border-[#e5d9de] bg-[#fcfbfc] p-3"
                      >
                        <select
                          value={newQuizCategory.quiz_topic_group_id}
                          onChange={(e) =>
                            setNewQuizCategory((prev) => ({
                              ...prev,
                              quiz_topic_group_id: e.target.value,
                            }))
                          }
                          className="h-9 rounded-md border border-[#d2d2d2] bg-white px-2 text-sm"
                        >
                          <option value="">
                            {tKey(lang, 'adminUi.select_topic_group')}
                          </option>
                          {quizTopicGroupsPickActive.map((groupItem) => (
                            <option key={groupItem.id} value={String(groupItem.id)}>
                              {getQuizTopicGroupLabel(groupItem)}
                            </option>
                          ))}
                        </select>
                        <div className="flex flex-wrap items-center gap-4 rounded-md border border-[#ece2e6] bg-white px-2 py-2">
                          <label className="flex cursor-pointer items-center gap-2 text-xs text-[#5b5b5b]">
                            <input
                              type="checkbox"
                              checked={Boolean(newQuizCategory.allow_random_quiz)}
                              onChange={(e) =>
                                setNewQuizCategory((prev) => ({
                                  ...prev,
                                  allow_random_quiz: e.target.checked,
                                }))
                              }
                              className="h-4 w-4 rounded border-[#c4c4c4]"
                            />
                            {tKey(lang, 'adminUi.allow_random_quiz_for_quiz_topic')}
                          </label>
                          <AdminAccessTierField
                            lang={lang}
                            id="new-quiz-category-access-tier"
                            value={newQuizCategory.access_tier}
                            onChange={(v) =>
                              setNewQuizCategory((prev) => ({ ...prev, access_tier: v }))
                            }
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                          <div className="space-y-2 rounded-md border border-[#ece2e6] bg-white p-2">
                            <p className="text-xs font-bold text-[#7a2038]"><AdminLocaleBlockLabel lang={lang} block="vi" /></p>
                            <Input
                              placeholder={tKey(lang, 'adminUi.name_vi')}
                              value={newQuizCategory.name_vi}
                              onChange={(e) =>
                                setNewQuizCategory((prev) => ({ ...prev, name_vi: e.target.value }))
                              }
                              className="border-[#d2d2d2] bg-white h-9"
                            />
                            <Input
                              placeholder={tKey(lang, 'adminUi.description_vi_3')}
                              value={newQuizCategory.description_vi}
                              onChange={(e) =>
                                setNewQuizCategory((prev) => ({ ...prev, description_vi: e.target.value }))
                              }
                              className="border-[#d2d2d2] bg-white h-9"
                            />
                          </div>
                          <div className="space-y-2 rounded-md border border-[#ece2e6] bg-white p-2">
                            <p className="text-xs font-bold text-[#7a2038]"><AdminLocaleBlockLabel lang={lang} block="en" /></p>
                            <Input
                              placeholder={tKey(lang, 'adminUi.name_en')}
                              value={newQuizCategory.name_en}
                              onChange={(e) =>
                                setNewQuizCategory((prev) => ({ ...prev, name_en: e.target.value }))
                              }
                              className="border-[#d2d2d2] bg-white h-9"
                            />
                            <Input
                              placeholder={tKey(lang, 'adminUi.description_en_2')}
                              value={newQuizCategory.description_en}
                              onChange={(e) =>
                                setNewQuizCategory((prev) => ({ ...prev, description_en: e.target.value }))
                              }
                              className="border-[#d2d2d2] bg-white h-9"
                            />
                          </div>
                          <div className="space-y-2 rounded-md border border-[#ece2e6] bg-white p-2">
                            <p className="text-xs font-bold text-[#7a2038]"><AdminLocaleBlockLabel lang={lang} block="es" /></p>
                            <Input
                              placeholder={tKey(lang, 'adminUi.name_es')}
                              value={newQuizCategory.name_es}
                              onChange={(e) =>
                                setNewQuizCategory((prev) => ({ ...prev, name_es: e.target.value }))
                              }
                              className="border-[#d2d2d2] bg-white h-9"
                            />
                            <Input
                              placeholder={tKey(lang, 'adminUi.description_es_2')}
                              value={newQuizCategory.description_es}
                              onChange={(e) =>
                                setNewQuizCategory((prev) => ({ ...prev, description_es: e.target.value }))
                              }
                              className="border-[#d2d2d2] bg-white h-9"
                            />
                          </div>
                        </div>
                        <Button
                          type="submit"
                          className="h-9 bg-[#7a2038] hover:bg-[#5a1428] text-white font-bold"
                        >
                          {tKey(lang, 'adminUi.add_quiz_topic_2')}
                        </Button>
                      </form>
                        </DialogContent>
                      </Dialog>
                      <div className="space-y-0 divide-y divide-[#ece2e6] overflow-hidden rounded-md border border-[#e5d9de] bg-white">
                        {filteredQuizCategories.map((categoryItem) => (
                          <div
                            key={categoryItem.id}
                            className="flex items-center justify-between gap-2 border-0 bg-white p-2 rounded-none"
                          >
                            <div>
                              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                                <span className="font-semibold text-[#5a1428]">
                                  {getQuizCategoryLabel(categoryItem)}
                                </span>
                                {categoryItem.is_active ? (
                                  <span className="text-[11px] font-semibold text-emerald-700">
                                    {tKey(lang, 'adminUi.active')}
                                  </span>
                                ) : null}
                                {String(categoryItem.access_tier || '').toLowerCase() === 'premium' ? (
                                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-900">
                                    {tKey(lang, 'listing.content_tier_advanced')}
                                  </span>
                                ) : null}
                                {categoryItem.allow_random_quiz ? (
                                  <span className="text-[10px] font-semibold text-primary/80">Random</span>
                                ) : null}
                              </div>
                              <div className="text-xs text-[#7a2038]">
                                {getQuizCategoryParentGroupLabel(categoryItem)}
                              </div>
                              <div className="text-xs text-[#5b5b5b]">
                                {adminTrilingualField(
                                  lang,
                                  categoryItem.description_vi || '-',
                                  categoryItem.description_es || '-',
                                  categoryItem.description_en
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => onToggleQuizCategoryActive(categoryItem)}
                                className="h-8 w-8 shrink-0 border-[#d2d2d2] bg-white p-0 hover:bg-[#fdf5f8]"
                                title={
                                  categoryItem.is_active !== false
                                    ? tKey(lang, 'adminUi.hide_from_students')
                                    : tKey(lang, 'adminUi.show_to_students')
                                }
                              >
                                {categoryItem.is_active !== false ? (
                                  <EyeOff className="h-3.5 w-3.5" />
                                ) : (
                                  <Eye className="h-3.5 w-3.5" />
                                )}
                              </Button>
                              <AdminActionIconButton onClick={() => onStartEditQuizCategory(categoryItem)} title={tKey(lang, 'adminUi.edit_quiz_topic')} kind="edit" icon={<Edit className="h-3.5 w-3.5" />} />
                              <AdminActionIconButton onClick={() => onDeleteQuizCategory(categoryItem)} title={tKey(lang, 'adminUi.delete_quiz_topic')} kind="delete" icon={<Trash2 className="h-3.5 w-3.5" />} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <Dialog
                        open={editingQuizCategoryId != null}
                        onOpenChange={(open) => {
                          if (!open) setEditingQuizCategoryId(null);
                        }}
                      >
                        <DialogContent
                          className="max-w-4xl max-h-[min(92vh,880px)] overflow-y-auto"
                          closeLabel={tKey(lang, 'adminUi.close')}
                          suppressAriaDescribedBy={false}
                        >
                          <DialogHeader>
                            <DialogTitle className="text-left text-[#6b1b31]">
                              {tKey(lang, 'adminUi.edit_quiz_topic')}
                            </DialogTitle>
                            <DialogDescription className="text-left text-[#5b5b5b]">
                              {tKey(lang, 'adminUi.set_the_parent_group_and_edit_names_and_descriptions_stu')}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-3 pt-1">
                            <div className="space-y-1">
                              <Label className="text-xs font-medium text-[#5b5b5b]">
                                {tKey(lang, 'adminUi.topic_group_parent')}
                              </Label>
                              <select
                                value={editQuizCategoryForm.quiz_topic_group_id}
                                onChange={(e) =>
                                  setEditQuizCategoryForm((prev) => ({
                                    ...prev,
                                    quiz_topic_group_id: e.target.value,
                                  }))
                                }
                                className="h-9 w-full rounded-md border border-[#d2d2d2] bg-white px-2 text-sm"
                              >
                                <option value="">
                                  {tKey(lang, 'adminUi.select_topic_group')}
                                </option>
                                {quizTopicGroupsAdmin.map((groupItem) => (
                                  <option key={groupItem.id} value={String(groupItem.id)}>
                                    {getQuizTopicGroupLabel(groupItem)}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 rounded-md border border-[#ece2e6] bg-[#fcfbfc] px-3 py-2">
                              <label className="flex cursor-pointer items-center gap-2 text-xs text-[#5b5b5b]">
                                <input
                                  type="checkbox"
                                  checked={Boolean(editQuizCategoryForm.allow_random_quiz)}
                                  onChange={(e) =>
                                    setEditQuizCategoryForm((prev) => ({
                                      ...prev,
                                      allow_random_quiz: e.target.checked,
                                    }))
                                  }
                                  className="h-4 w-4 rounded border-[#c4c4c4]"
                                />
                                {tKey(lang, 'adminUi.allow_random_quiz_for_quiz_topic')}
                              </label>
                              <AdminAccessTierField
                                lang={lang}
                                id="edit-quiz-category-access-tier"
                                value={editQuizCategoryForm.access_tier}
                                onChange={(v) =>
                                  setEditQuizCategoryForm((prev) => ({ ...prev, access_tier: v }))
                                }
                              />
                            </div>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                              <div className="space-y-2 rounded-md border border-[#e8d7dd] bg-white p-3">
                                <p className="text-xs font-bold text-[#7a2038]"><AdminLocaleBlockLabel lang={lang} block="vi" /></p>
                                <div className="space-y-1">
                                  <Label htmlFor="edit-quiz-cat-name-vi" className="text-xs text-[#5b5b5b]">
                                    {tKey(lang, 'adminUi.topic_name_vi')}
                                  </Label>
                                  <Input
                                    id="edit-quiz-cat-name-vi"
                                    value={editQuizCategoryForm.name_vi}
                                    onChange={(e) =>
                                      setEditQuizCategoryForm((prev) => ({
                                        ...prev,
                                        name_vi: e.target.value,
                                      }))
                                    }
                                    className="border-[#d2d2d2] bg-white h-9"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor="edit-quiz-cat-desc-vi" className="text-xs text-[#5b5b5b]">
                                    {tKey(lang, 'adminUi.description_vi')}
                                  </Label>
                                  <Input
                                    id="edit-quiz-cat-desc-vi"
                                    value={editQuizCategoryForm.description_vi}
                                    onChange={(e) =>
                                      setEditQuizCategoryForm((prev) => ({
                                        ...prev,
                                        description_vi: e.target.value,
                                      }))
                                    }
                                    className="border-[#d2d2d2] bg-white h-9"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2 rounded-md border border-[#e8d7dd] bg-white p-3">
                                <p className="text-xs font-bold text-[#7a2038]"><AdminLocaleBlockLabel lang={lang} block="en" /></p>
                                <div className="space-y-1">
                                  <Label htmlFor="edit-quiz-cat-name-en" className="text-xs text-[#5b5b5b]">
                                    {tKey(lang, 'adminUi.topic_name_en')}
                                  </Label>
                                  <Input
                                    id="edit-quiz-cat-name-en"
                                    value={editQuizCategoryForm.name_en}
                                    onChange={(e) =>
                                      setEditQuizCategoryForm((prev) => ({
                                        ...prev,
                                        name_en: e.target.value,
                                      }))
                                    }
                                    className="border-[#d2d2d2] bg-white h-9"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor="edit-quiz-cat-desc-en" className="text-xs text-[#5b5b5b]">
                                    {tKey(lang, 'adminUi.description_en')}
                                  </Label>
                                  <Input
                                    id="edit-quiz-cat-desc-en"
                                    value={editQuizCategoryForm.description_en}
                                    onChange={(e) =>
                                      setEditQuizCategoryForm((prev) => ({
                                        ...prev,
                                        description_en: e.target.value,
                                      }))
                                    }
                                    className="border-[#d2d2d2] bg-white h-9"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2 rounded-md border border-[#e8d7dd] bg-white p-3">
                                <p className="text-xs font-bold text-[#7a2038]"><AdminLocaleBlockLabel lang={lang} block="es" /></p>
                                <div className="space-y-1">
                                  <Label htmlFor="edit-quiz-cat-name-es" className="text-xs text-[#5b5b5b]">
                                    {tKey(lang, 'adminUi.topic_name_es')}
                                  </Label>
                                  <Input
                                    id="edit-quiz-cat-name-es"
                                    value={editQuizCategoryForm.name_es}
                                    onChange={(e) =>
                                      setEditQuizCategoryForm((prev) => ({
                                        ...prev,
                                        name_es: e.target.value,
                                      }))
                                    }
                                    className="border-[#d2d2d2] bg-white h-9"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor="edit-quiz-cat-desc-es" className="text-xs text-[#5b5b5b]">
                                    {tKey(lang, 'adminUi.description_es')}
                                  </Label>
                                  <Input
                                    id="edit-quiz-cat-desc-es"
                                    value={editQuizCategoryForm.description_es}
                                    onChange={(e) =>
                                      setEditQuizCategoryForm((prev) => ({
                                        ...prev,
                                        description_es: e.target.value,
                                      }))
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
                                  const id = editingQuizCategoryId;
                                  if (id == null) return;
                                  const row =
                                    quizCategoriesAdmin.find((c: { id: number }) => c.id === id) ??
                                    filteredQuizCategories.find((c: { id: number }) => c.id === id) ??
                                    ({ id } as any);
                                  onSaveEditQuizCategory(row);
                                }}
                                className="h-9 bg-[#7a2038] hover:bg-[#5a1428] text-white"
                              >
                                {tKey(lang, 'adminUi.save')}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingQuizCategoryId(null)}
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

                  {/* Create Quiz Form */}
                  {quizzesSubTab === 'manage' && (
                    <div className="border border-[#dbe3ee] bg-white rounded-none p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <h3 className="min-w-0 flex-1 font-bold text-[#5a1428] text-base md:text-base">
                          {tKey(lang, 'adminUi.create_quiz_2')}
                        </h3>
                        <Button
                          type="button"
                          onClick={() => {
                            setQuizCreateModalStep('meta');
                            setQuizCreateDialogOpen(true);
                          }}
                          className="h-9 shrink-0 rounded-full bg-[#7a2038] px-5 font-bold text-white shadow-sm hover:bg-[#5a1428]"
                        >
                          {tKey(lang, 'adminUi.add_new')}
                        </Button>
                      </div>
                      <Dialog open={quizCreateDialogOpen} onOpenChange={setQuizCreateDialogOpen}>
                        <DialogContent className="max-w-6xl">
                          <DialogHeader>
                            <DialogTitle className="text-[#6b1b31]">
                              {tKey(lang, 'adminUi.create_quiz_2')}
                            </DialogTitle>
                          </DialogHeader>
                      <div className="w-full rounded-none border border-[#e9dfe3] bg-[#faf7f8] p-2 md:p-2">
                        <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-[#e8c4c8] pb-2">
                          <Edit className="h-4 w-4 shrink-0 text-[#7a2038]" aria-hidden />
                          <span className="text-xs font-bold uppercase tracking-wide text-[#6b1b31]">
                            {tKey(lang, 'adminUi.new_quiz_details_questions')}
                          </span>
                        </div>
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-[#7a2038]">
                            {quizCreateModalStep === 'meta'
                              ? tKey(lang, 'adminUi.step_1_2_quiz_details')
                              : tKey(lang, 'adminUi.step_2_2_questions_answers')}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setQuizCreateModalStep('meta')}
                              className={`h-7 border-[#d2d2d2] px-2 text-xs ${quizCreateModalStep === 'meta' ? 'bg-[#f5d6df] text-[#6b1b31]' : 'bg-white'}`}
                            >
                              {tKey(lang, 'adminUi.details')}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setQuizCreateModalStep('questions')}
                              className={`h-7 border-[#d2d2d2] px-2 text-xs ${quizCreateModalStep === 'questions' ? 'bg-[#f5d6df] text-[#6b1b31]' : 'bg-white'}`}
                            >
                              {tKey(lang, 'adminUi.questions')}
                            </Button>
                          </div>
                        </div>
                      <form onSubmit={onCreateQuiz} className="space-y-2">
                        {quizCreateModalStep === 'meta' && (
                          <>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                          <div>
                            <Label className="text-xs text-[#5b5b5b]">
                              {tKey(lang, 'adminUi.topic_group')}
                            </Label>
                            <Select
                              value={quizForm.quiz_topic_group_id}
                              onValueChange={(v) =>
                                setQuizForm((prev) => ({
                                  ...prev,
                                  quiz_topic_group_id: v,
                                  category_id: '',
                                }))
                              }
                            >
                              <SelectTrigger className="border-[#d2d2d2] bg-white h-9">
                                <SelectValue placeholder={tKey(lang, 'adminUi.select_topic_group')} />
                              </SelectTrigger>
                              <SelectContent>
                                {quizTopicGroupsPickActive.map((groupItem) => (
                                  <SelectItem key={groupItem.id} value={String(groupItem.id)}>
                                    {getQuizTopicGroupLabel(groupItem)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs text-[#5b5b5b]">
                              {tKey(lang, 'adminUi.topic')}
                            </Label>
                            <Select
                              value={quizForm.category_id}
                              onValueChange={(v) => setQuizForm((prev) => ({ ...prev, category_id: v }))}
                            >
                              <SelectTrigger className="border-[#d2d2d2] bg-white h-9">
                                <SelectValue placeholder={tKey(lang, 'adminUi.select_topic')} />
                              </SelectTrigger>
                              <SelectContent>
                                {createQuizCategories.map((categoryItem) => (
                                  <SelectItem key={categoryItem.id} value={String(categoryItem.id)}>
                                    {getQuizCategoryLabel(categoryItem)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs text-[#5b5b5b]">
                              {tKey(lang, 'adminUi.passing_score')}
                            </Label>
                            <Input
                              value="10"
                              disabled
                              className="border-[#d2d2d2] bg-[#f2f2f2] h-9"
                            />
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 rounded-md border border-[#ece2e6] bg-white px-3 py-2">
                          <AdminAccessTierField
                            lang={lang}
                            id="create-quiz-access-tier"
                            value={quizForm.access_tier}
                            onChange={(v) => setQuizForm((p) => ({ ...p, access_tier: v }))}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="border border-[#d2d2d2] bg-white p-2 rounded-none">
                            <h4 className="font-bold text-[#5a1428] mb-2 text-sm"><AdminLocaleBlockLabel lang={lang} block="vi" /></h4>
                            <div className="space-y-2">
                              <Input
                                placeholder={tKey(lang, 'adminUi.title_vi')}
                                value={quizForm.title_vi}
                                onChange={(e) =>
                                  setQuizForm({ ...quizForm, title_vi: e.target.value })
                                }
                                required
                                className="border-[#d2d2d2] bg-white h-9"
                              />
                              <Textarea
                                placeholder={tKey(lang, 'adminUi.description_vi')}
                                value={quizForm.description_vi}
                                onChange={(e) =>
                                  setQuizForm({ ...quizForm, description_vi: e.target.value })
                                }
                                rows={2}
                                className="border-[#d2d2d2] bg-white"
                              />
                              <Textarea
                                placeholder={tKey(lang, 'adminUi.instructions_vietnamese')}
                                value={quizForm.instructions_vi}
                                onChange={(e) =>
                                  setQuizForm({ ...quizForm, instructions_vi: e.target.value })
                                }
                                rows={2}
                                className="border-[#d2d2d2] bg-white"
                              />
                            </div>
                          </div>
                          <div className="border border-[#d2d2d2] bg-white p-2 rounded-none">
                            <h4 className="font-bold text-[#5a1428] mb-2 text-sm"><AdminLocaleBlockLabel lang={lang} block="en" /></h4>
                            <div className="space-y-2">
                              <Input
                                placeholder={tKey(lang, 'adminUi.title_en')}
                                value={quizForm.title_en}
                                onChange={(e) =>
                                  setQuizForm({ ...quizForm, title_en: e.target.value })
                                }
                                className="border-[#d2d2d2] bg-white h-9"
                              />
                              <Textarea
                                placeholder={tKey(lang, 'adminUi.description_en')}
                                value={quizForm.description_en}
                                onChange={(e) =>
                                  setQuizForm({ ...quizForm, description_en: e.target.value })
                                }
                                rows={2}
                                className="border-[#d2d2d2] bg-white"
                              />
                              <Textarea
                                placeholder={tKey(lang, 'adminUi.instructions_english')}
                                value={quizForm.instructions_en}
                                onChange={(e) =>
                                  setQuizForm({ ...quizForm, instructions_en: e.target.value })
                                }
                                rows={2}
                                className="border-[#d2d2d2] bg-white"
                              />
                            </div>
                          </div>
                          <div className="border border-[#d2d2d2] bg-white p-2 rounded-none">
                            <h4 className="font-bold text-[#5a1428] mb-2 text-sm"><AdminLocaleBlockLabel lang={lang} block="es" /></h4>
                            <div className="space-y-2">
                              <Input
                                placeholder={tKey(lang, 'adminUi.title_es')}
                                value={quizForm.title_es}
                                onChange={(e) =>
                                  setQuizForm({ ...quizForm, title_es: e.target.value })
                                }
                                required
                                className="border-[#d2d2d2] bg-white h-9"
                              />
                              <Textarea
                                placeholder={tKey(lang, 'adminUi.description_es_2')}
                                value={quizForm.description_es}
                                onChange={(e) =>
                                  setQuizForm({ ...quizForm, description_es: e.target.value })
                                }
                                rows={2}
                                className="border-[#d2d2d2] bg-white"
                              />
                              <Textarea
                                placeholder={tKey(lang, 'adminUi.instructions')}
                                value={quizForm.instructions_es}
                                onChange={(e) =>
                                  setQuizForm({ ...quizForm, instructions_es: e.target.value })
                                }
                                rows={2}
                                className="border-[#d2d2d2] bg-white"
                              />
                            </div>
                          </div>
                        </div>
                          </>
                        )}

                        {/* Question Builder */}
                        {quizCreateModalStep === 'questions' && (
                        <div className="border border-[#d2d2d2] bg-white p-2 rounded-none">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <h4 className="font-bold text-[#5a1428] text-sm">
                              📝 {tKey(lang, 'adminUi.questions')}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#5b5b5b]">
                                {tKey(lang, 'adminUi.total')}:
                              </span>
                              <Input
                                type="number"
                                min={1}
                                max={60}
                                value={questionCount}
                                onChange={(e) => onChangeQuestionCount(e.target.value)}
                                className="w-20 h-8 border-[#d2d2d2] bg-white"
                              />
                              <span className="text-xs text-[#5b5b5b]">
                                {tKey(lang, 'adminUi.q')} {currentQuestionIndex + 1}/
                                {questionCount}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {questionDrafts.slice(0, questionCount).map((_, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setCurrentQuestionIndex(idx)}
                                className={`h-7 w-7 text-xs font-bold rounded-sm border transition-colors ${idx === currentQuestionIndex ? 'border-[#7a2038] bg-[#f5d6df] text-[#6b1b31]' : 'border-[#bcbcbc] bg-white text-[#5f5f5f] hover:bg-[#f0f0f0]'}`}
                              >
                                {idx + 1}
                              </button>
                            ))}
                          </div>
                          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                            <div className="border border-[#d2d2d2] bg-[#f9f9f9] p-2 rounded-none">
                              <h5 className="font-semibold text-[#5a1428] mb-2 text-sm">
                                <AdminLocaleBlockLabel lang={lang} block="vi" />
                              </h5>
                              <div className="space-y-3">
                                <Textarea
                                  placeholder={tKey(lang, 'adminUi.question_text_vietnamese')}
                                  value={currentQuestionDraft.question_text_vi}
                                  onChange={(e) =>
                                    updateCurrentQuestionField('question_text_vi', e.target.value)
                                  }
                                  rows={2}
                                  required
                                  className="border-[#d2d2d2] bg-white"
                                />
                                <Textarea
                                  placeholder={tKey(lang, 'adminUi.explanation_vietnamese')}
                                  value={currentQuestionDraft.explanation_vi}
                                  onChange={(e) =>
                                    updateCurrentQuestionField('explanation_vi', e.target.value)
                                  }
                                  rows={2}
                                  className="border-[#d2d2d2] bg-white"
                                />
                                <div className="space-y-2.5 pt-1">
                                  <Input
                                    placeholder={tKey(lang, 'adminUi.answer_a_vietnamese')}
                                    value={currentQuestionDraft.answer_vi_1}
                                    onChange={(e) =>
                                      updateCurrentQuestionField('answer_vi_1', e.target.value)
                                    }
                                    required
                                    className="border-[#d2d2d2] bg-white h-9"
                                  />
                                  <Input
                                    placeholder={tKey(lang, 'adminUi.answer_b_vietnamese')}
                                    value={currentQuestionDraft.answer_vi_2}
                                    onChange={(e) =>
                                      updateCurrentQuestionField('answer_vi_2', e.target.value)
                                    }
                                    required
                                    className="border-[#d2d2d2] bg-white h-9"
                                  />
                                  <Input
                                    placeholder={tKey(lang, 'adminUi.answer_c_vietnamese')}
                                    value={currentQuestionDraft.answer_vi_3}
                                    onChange={(e) =>
                                      updateCurrentQuestionField('answer_vi_3', e.target.value)
                                    }
                                    required
                                    className="border-[#d2d2d2] bg-white h-9"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="border border-[#d2d2d2] bg-[#f9f9f9] p-2 rounded-none">
                              <h5 className="font-semibold text-[#5a1428] mb-2 text-sm">
                                <AdminLocaleBlockLabel lang={lang} block="en" />
                              </h5>
                              <div className="space-y-3">
                                <Textarea
                                  placeholder={tKey(lang, 'adminUi.question_text_english')}
                                  value={currentQuestionDraft.question_text_en}
                                  onChange={(e) =>
                                    updateCurrentQuestionField('question_text_en', e.target.value)
                                  }
                                  rows={2}
                                  className="border-[#d2d2d2] bg-white"
                                />
                                <Textarea
                                  placeholder={tKey(lang, 'adminUi.explanation_english')}
                                  value={currentQuestionDraft.explanation_en}
                                  onChange={(e) =>
                                    updateCurrentQuestionField('explanation_en', e.target.value)
                                  }
                                  rows={2}
                                  className="border-[#d2d2d2] bg-white"
                                />
                                <div className="space-y-2.5 pt-1">
                                  <Input
                                    placeholder={tKey(lang, 'adminUi.answer_a_english')}
                                    value={currentQuestionDraft.answer_en_1}
                                    onChange={(e) =>
                                      updateCurrentQuestionField('answer_en_1', e.target.value)
                                    }
                                    className="border-[#d2d2d2] bg-white h-9"
                                  />
                                  <Input
                                    placeholder={tKey(lang, 'adminUi.answer_b_english')}
                                    value={currentQuestionDraft.answer_en_2}
                                    onChange={(e) =>
                                      updateCurrentQuestionField('answer_en_2', e.target.value)
                                    }
                                    className="border-[#d2d2d2] bg-white h-9"
                                  />
                                  <Input
                                    placeholder={tKey(lang, 'adminUi.answer_c_english')}
                                    value={currentQuestionDraft.answer_en_3}
                                    onChange={(e) =>
                                      updateCurrentQuestionField('answer_en_3', e.target.value)
                                    }
                                    className="border-[#d2d2d2] bg-white h-9"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="border border-[#d2d2d2] bg-[#f9f9f9] p-2 rounded-none">
                              <h5 className="font-semibold text-[#5a1428] mb-2 text-sm">
                                <AdminLocaleBlockLabel lang={lang} block="es" />
                              </h5>
                              <div className="space-y-3">
                                <Textarea
                                  placeholder={tKey(lang, 'adminUi.question_text_spanish')}
                                  value={currentQuestionDraft.question_text_es}
                                  onChange={(e) =>
                                    updateCurrentQuestionField('question_text_es', e.target.value)
                                  }
                                  rows={2}
                                  required
                                  className="border-[#d2d2d2] bg-white"
                                />
                                <Textarea
                                  placeholder={tKey(lang, 'adminUi.explanation_spanish')}
                                  value={currentQuestionDraft.explanation_es}
                                  onChange={(e) =>
                                    updateCurrentQuestionField('explanation_es', e.target.value)
                                  }
                                  rows={2}
                                  className="border-[#d2d2d2] bg-white"
                                />
                                <div className="space-y-2.5 pt-1">
                                  <Input
                                    placeholder={tKey(lang, 'adminUi.answer_a_spanish')}
                                    value={currentQuestionDraft.answer_es_1}
                                    onChange={(e) =>
                                      updateCurrentQuestionField('answer_es_1', e.target.value)
                                    }
                                    required
                                    className="border-[#d2d2d2] bg-white h-9"
                                  />
                                  <Input
                                    placeholder={tKey(lang, 'adminUi.answer_b_spanish')}
                                    value={currentQuestionDraft.answer_es_2}
                                    onChange={(e) =>
                                      updateCurrentQuestionField('answer_es_2', e.target.value)
                                    }
                                    required
                                    className="border-[#d2d2d2] bg-white h-9"
                                  />
                                  <Input
                                    placeholder={tKey(lang, 'adminUi.answer_c_spanish')}
                                    value={currentQuestionDraft.answer_es_3}
                                    onChange={(e) =>
                                      updateCurrentQuestionField('answer_es_3', e.target.value)
                                    }
                                    required
                                    className="border-[#d2d2d2] bg-white h-9"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                            <div>
                              <Label className="text-xs text-[#5b5b5b]">
                                {tKey(lang, 'adminUi.correct_answer')}
                              </Label>
                              <Select
                                value={currentQuestionDraft.correct_index}
                                onValueChange={(v) =>
                                  updateCurrentQuestionField('correct_index', v)
                                }
                              >
                                <SelectTrigger className="border-[#d2d2d2] bg-white h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">A</SelectItem>
                                  <SelectItem value="2">B</SelectItem>
                                  <SelectItem value="3">C</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs text-[#5b5b5b]">
                                {tKey(lang, 'adminUi.image')}
                              </Label>
                              {currentQuestionImagePreview && (
                                <div className="mb-2 rounded-sm border border-[#d2d2d2] bg-white p-2">
                                  <img
                                    src={currentQuestionImagePreview}
                                    alt={tKey(lang, 'adminUi.question_image_preview')}
                                    className="h-36 w-full rounded-sm object-contain bg-[#f9f9f9]"
                                  />
                                </div>
                              )}
                              <Input
                                key={`img-${currentQuestionIndex}`}
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  updateCurrentQuestionImage(e.target.files?.[0] || null)
                                }
                                className="border-[#d2d2d2] bg-white h-9"
                              />
                              {currentQuestionImageFile && (
                                <span className="text-xs text-[#5b5b5b]">
                                  {currentQuestionImageFile.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setQuizCreateModalStep('meta')}
                            disabled={quizCreateModalStep === 'meta'}
                            className="h-9 border-[#d2d2d2] bg-white"
                          >
                            {tKey(lang, 'adminUi.back')}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setQuizCreateModalStep('questions')}
                            disabled={quizCreateModalStep === 'questions'}
                            className="h-9 border-[#d2d2d2] bg-white"
                          >
                            {tKey(lang, 'adminUi.next')}
                          </Button>
                          {quizCreateModalStep === 'questions' && (
                            <Button
                              type="submit"
                              disabled={creatingQuiz}
                              className="h-10 bg-[#7a2038] hover:bg-[#5a1428] text-white font-bold"
                            >
                              {creatingQuiz ? '⏳...' : tKey(lang, 'adminUi.create_quiz')}
                            </Button>
                          )}
                        </div>
                      </form>
                      </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}

                  {/* Quizzes List */}
                  {quizzesSubTab === 'manage' && (
                    <div className="border border-[#dbe3ee] bg-white rounded-none p-3">
                      <h3 className="mb-2 font-bold text-[#5a1428] text-base md:text-base">
                        {tKey(lang, 'adminUi.quiz_list')} (
                        {filteredAdminQuizzes.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <Label className="text-xs text-[#5b5b5b]">
                            {tKey(lang, 'adminUi.topic_group')}
                          </Label>
                          <Select
                            value={quizListFilterGroupId}
                            onValueChange={(v) => {
                              setQuizListFilterGroupId(v);
                              const gid = Number(v);
                              const scoped =
                                v === 'all' || !Number.isFinite(gid) || gid <= 0
                                  ? quizCategoriesAdmin
                                  : quizCategoriesAdmin.filter(
                                      (item) => Number(item.quiz_topic_group_id) === gid
                                    );
                              if (
                                quizListFilterCategoryId !== 'all' &&
                                !scoped.some(
                                  (item) => Number(item.id) === Number(quizListFilterCategoryId)
                                )
                              ) {
                                setQuizListFilterCategoryId('all');
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
                              {quizTopicGroupsAdmin.map((groupItem) => (
                                <SelectItem key={groupItem.id} value={String(groupItem.id)}>
                                  {getQuizTopicGroupLabel(groupItem)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="mt-1 text-[11px] leading-snug text-[#6b6570]">
                            {tKey(lang, 'adminUi.narrows_the_topic_list_beside_it_pick_all_topics_to_list')}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-[#5b5b5b]">
                            {tKey(lang, 'adminUi.quiz_topics')}
                          </Label>
                          <Select
                            value={quizListFilterCategoryId}
                            onValueChange={setQuizListFilterCategoryId}
                          >
                            <SelectTrigger className="border-[#d2d2d2] bg-white h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">
                                {tKey(lang, 'adminUi.all_topics')}
                              </SelectItem>
                              {listQuizCategoriesByGroup.map((categoryItem) => (
                                <SelectItem key={categoryItem.id} value={String(categoryItem.id)}>
                                  {getQuizCategoryLabel(categoryItem)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 mb-3">
                        <div>
                          <Label className="text-xs text-[#5b5b5b]">
                            {tKey(lang, 'adminUi.search_quizzes')}
                          </Label>
                          <Input
                            value={quizSearch}
                            onChange={(e) => setQuizSearch(e.target.value)}
                            placeholder={tKey(lang, 'adminUi.search_by_title_type_or_code')}
                            className="h-9 border-[#d2d2d2] bg-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-0 divide-y divide-[#ece2e6] border border-[#e9dfe3]">
                        {paginatedAdminQuizzes.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex flex-col gap-2 border-0 bg-white p-2 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="min-w-0">
                              <div className="font-bold text-[#5a1428]">
                                {getQuizDisplayTitle(item)}
                              </div>
                              <div className="text-xs text-[#5b5b5b] mt-0.5">
                                {getQuizDisplayDescription(item)}
                              </div>
                              <div className="mt-1 flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-[#5b5b5b]">{item.code}</span>
                                <span className="text-xs text-[#5b5b5b]">
                                  {item.total_questions} {tKey(lang, 'adminUi.qs')}
                                </span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded border ${item.is_active ? 'border-green-300 bg-green-50 text-green-700' : 'border-gray-300 bg-gray-100 text-gray-600'}`}
                                >
                                  {item.is_active ? (
                                    <Eye className="h-3 w-3 inline" />
                                  ) : (
                                    <EyeOff className="h-3 w-3 inline" />
                                  )}
                                </span>
                                {String(item.access_tier || '').toLowerCase() === 'premium' ? (
                                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-900">
                                    {tKey(lang, 'listing.content_tier_advanced')}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <AdminActionIconButton
                                onClick={() => onStartEditQuiz(item)}
                                title={tKey(lang, 'adminUi.edit_quiz')}
                                kind="edit"
                                className="h-8 w-8 px-0"
                                icon={<Edit className="h-3.5 w-3.5 shrink-0" />}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onToggleQuiz(item)}
                                className="h-8 border-[#d2d2d2] bg-white hover:bg-[#fdf5f8]"
                              >
                                {item.is_active ? (
                                  <EyeOff className="h-3.5 w-3.5" />
                                ) : (
                                  <Eye className="h-3.5 w-3.5" />
                                )}
                              </Button>
                              <AdminActionIconButton onClick={() => onDeleteQuiz(item)} title={tKey(lang, 'adminUi.delete_quiz')} kind="delete" icon={<Trash2 className="h-3.5 w-3.5" />} />
                            </div>
                            {editingQuizId === item.id && (
                              <Dialog open={editingQuizId === item.id} onOpenChange={(open) => !open && onCancelEditQuiz()}>
                                <DialogContent className="max-w-6xl">
                                  <DialogHeader>
                                    <DialogTitle className="text-[#6b1b31]">
                                      {tKey(lang, 'adminUi.edit_quiz_2')}
                                    </DialogTitle>
                                  </DialogHeader>
                              <div className="w-full rounded-none border border-[#e9dfe3] bg-[#faf7f8] p-2 md:p-2">
                                <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-[#e8c4c8] pb-2">
                                  <Edit className="h-4 w-4 shrink-0 text-[#7a2038]" aria-hidden />
                                  <span className="text-xs font-bold uppercase tracking-wide text-[#6b1b31]">
                                    {tKey(lang, 'adminUi.edit_quiz_details_questions_below')}
                                  </span>
                                </div>
                                <div className="mb-2 flex items-center justify-between gap-2">
                                  <span className="text-xs font-semibold text-[#7a2038]">
                                    {editQuizModalStep === 'meta'
                                      ? tKey(lang, 'adminUi.step_1_2_quiz_details')
                                      : tKey(lang, 'adminUi.step_2_2_questions_answers')}
                                  </span>
                                  <div className="flex gap-1">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setEditQuizModalStep('meta')}
                                      className={`h-7 border-[#d2d2d2] px-2 text-xs ${editQuizModalStep === 'meta' ? 'bg-[#f5d6df] text-[#6b1b31]' : 'bg-white'}`}
                                    >
                                      {tKey(lang, 'adminUi.details')}
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setEditQuizModalStep('questions')}
                                      className={`h-7 border-[#d2d2d2] px-2 text-xs ${editQuizModalStep === 'questions' ? 'bg-[#f5d6df] text-[#6b1b31]' : 'bg-white'}`}
                                    >
                                      {tKey(lang, 'adminUi.questions')}
                                    </Button>
                                  </div>
                                </div>
                              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                                {editQuizModalStep === 'meta' && (
                                  <>
                                <div>
                                  <Label className="text-xs text-[#5b5b5b]">
                                    {tKey(lang, 'adminUi.topic_group')}
                                  </Label>
                                  <Select
                                    value={editQuizForm.quiz_topic_group_id}
                                    onValueChange={(v) =>
                                      setEditQuizForm((prev) => ({
                                        ...prev,
                                        quiz_topic_group_id: v,
                                        category_id: '',
                                      }))
                                    }
                                  >
                                    <SelectTrigger className="h-9 border-[#d2d2d2] bg-white">
                                      <SelectValue placeholder={tKey(lang, 'adminUi.select_topic_group')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {quizTopicGroupsAdmin.map((groupItem) => (
                                        <SelectItem key={groupItem.id} value={String(groupItem.id)}>
                                          {getQuizTopicGroupLabel(groupItem)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="text-xs text-[#5b5b5b]">
                                    {tKey(lang, 'adminUi.topic')}
                                  </Label>
                                  <Select
                                    value={editQuizForm.category_id}
                                    onValueChange={(v) =>
                                      setEditQuizForm((prev) => ({ ...prev, category_id: v }))
                                    }
                                  >
                                    <SelectTrigger className="h-9 border-[#d2d2d2] bg-white">
                                      <SelectValue placeholder={tKey(lang, 'adminUi.select_topic')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {editQuizCategories.map((categoryItem) => (
                                        <SelectItem key={categoryItem.id} value={String(categoryItem.id)}>
                                          {getQuizCategoryLabel(categoryItem)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="text-xs text-[#5b5b5b]">
                                    {tKey(lang, 'adminUi.passing_score')}
                                  </Label>
                                  <Input
                                    value="10"
                                    disabled
                                    className="h-9 border-[#d2d2d2] bg-[#f2f2f2]"
                                  />
                                </div>
                                <div className="md:col-span-3 flex flex-wrap items-center gap-3 rounded-md border border-[#ece2e6] bg-white px-3 py-2">
                                  <AdminAccessTierField
                                    lang={lang}
                                    id="edit-quiz-access-tier"
                                    value={editQuizForm.access_tier}
                                    onChange={(v) =>
                                      setEditQuizForm((p) => ({ ...p, access_tier: v }))
                                    }
                                  />
                                </div>
                                <div className="md:col-span-3 grid grid-cols-1 gap-2 md:grid-cols-3">
                                  <div className="space-y-2 rounded-md border border-[#ece2e6] bg-white p-2">
                                    <p className="text-xs font-bold text-[#7a2038]"><AdminLocaleBlockLabel lang={lang} block="vi" /></p>
                                    <div>
                                      <Label className="text-xs text-[#5b5b5b]">
                                        {tKey(lang, 'adminUi.title_vi_3')}
                                      </Label>
                                      <Input
                                        value={editQuizForm.title_vi}
                                        onChange={(e) =>
                                          setEditQuizForm({ ...editQuizForm, title_vi: e.target.value })
                                        }
                                        className="h-9 border-[#d2d2d2] bg-white"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs text-[#5b5b5b]">
                                        {tKey(lang, 'adminUi.description_vi_3')}
                                      </Label>
                                      <Textarea
                                        value={editQuizForm.description_vi}
                                        onChange={(e) =>
                                          setEditQuizForm({
                                            ...editQuizForm,
                                            description_vi: e.target.value,
                                          })
                                        }
                                        rows={2}
                                        className="border-[#d2d2d2] bg-white"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs text-[#5b5b5b]">
                                        {tKey(lang, 'adminUi.instructions_vi')}
                                      </Label>
                                      <Textarea
                                        value={editQuizForm.instructions_vi}
                                        onChange={(e) =>
                                          setEditQuizForm({
                                            ...editQuizForm,
                                            instructions_vi: e.target.value,
                                          })
                                        }
                                        rows={2}
                                        className="border-[#d2d2d2] bg-white"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2 rounded-md border border-[#ece2e6] bg-white p-2">
                                    <p className="text-xs font-bold text-[#7a2038]"><AdminLocaleBlockLabel lang={lang} block="en" /></p>
                                    <div>
                                      <Label className="text-xs text-[#5b5b5b]">
                                        {tKey(lang, 'adminUi.title_en_2')}
                                      </Label>
                                      <Input
                                        value={editQuizForm.title_en}
                                        onChange={(e) =>
                                          setEditQuizForm({ ...editQuizForm, title_en: e.target.value })
                                        }
                                        className="h-9 border-[#d2d2d2] bg-white"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs text-[#5b5b5b]">
                                        {tKey(lang, 'adminUi.description_en_2')}
                                      </Label>
                                      <Textarea
                                        value={editQuizForm.description_en}
                                        onChange={(e) =>
                                          setEditQuizForm({
                                            ...editQuizForm,
                                            description_en: e.target.value,
                                          })
                                        }
                                        rows={2}
                                        className="border-[#d2d2d2] bg-white"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs text-[#5b5b5b]">
                                        {tKey(lang, 'adminUi.instructions_en')}
                                      </Label>
                                      <Textarea
                                        value={editQuizForm.instructions_en}
                                        onChange={(e) =>
                                          setEditQuizForm({
                                            ...editQuizForm,
                                            instructions_en: e.target.value,
                                          })
                                        }
                                        rows={2}
                                        className="border-[#d2d2d2] bg-white"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2 rounded-md border border-[#ece2e6] bg-white p-2">
                                    <p className="text-xs font-bold text-[#7a2038]"><AdminLocaleBlockLabel lang={lang} block="es" /></p>
                                    <div>
                                      <Label className="text-xs text-[#5b5b5b]">
                                        {tKey(lang, 'adminUi.title_es_2')}
                                      </Label>
                                      <Input
                                        value={editQuizForm.title_es}
                                        onChange={(e) =>
                                          setEditQuizForm({ ...editQuizForm, title_es: e.target.value })
                                        }
                                        className="h-9 border-[#d2d2d2] bg-white"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs text-[#5b5b5b]">
                                        {tKey(lang, 'adminUi.description_es_2')}
                                      </Label>
                                      <Textarea
                                        value={editQuizForm.description_es}
                                        onChange={(e) =>
                                          setEditQuizForm({
                                            ...editQuizForm,
                                            description_es: e.target.value,
                                          })
                                        }
                                        rows={2}
                                        className="border-[#d2d2d2] bg-white"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs text-[#5b5b5b]">
                                        {tKey(lang, 'adminUi.instructions_es')}
                                      </Label>
                                      <Textarea
                                        value={editQuizForm.instructions_es}
                                        onChange={(e) =>
                                          setEditQuizForm({
                                            ...editQuizForm,
                                            instructions_es: e.target.value,
                                          })
                                        }
                                        rows={2}
                                        className="border-[#d2d2d2] bg-white"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="md:col-span-3">
                                  <Label className="text-xs text-[#5b5b5b]">
                                    {tKey(lang, 'adminUi.status')}
                                  </Label>
                                  <Select
                                    value={editQuizForm.is_active ? 'active' : 'hidden'}
                                    onValueChange={(v) =>
                                      setEditQuizForm({
                                        ...editQuizForm,
                                        is_active: v === 'active',
                                      })
                                    }
                                  >
                                    <SelectTrigger className="h-9 border-[#d2d2d2] bg-white">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="active">
                                        {tKey(lang, 'adminUi.visible')}
                                      </SelectItem>
                                      <SelectItem value="hidden">
                                        {tKey(lang, 'adminUi.hidden_3')}
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                  </>
                                )}
                                {editQuizModalStep === 'questions' && (
                                <div className="md:col-span-3 border border-[#d2d2d2] bg-white rounded-sm p-3 space-y-3">
                                  {loadingEditQuizDetail ? (
                                    <div className="text-xs text-[#5b5b5b]">
                                      {tKey(lang, 'adminUi.loading_quiz_details')}
                                    </div>
                                  ) : (
                                    <div className="space-y-3">
                                      <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="text-xs font-semibold text-[#5a1428]">
                                          {fillTemplate(tKey(lang, 'adminUi.question_list_with_count'), {
                                            n: editQuizQuestions.length,
                                          })}
                                        </span>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={onAddEditQuestion}
                                          className="h-7 border-[#d2d2d2] bg-white px-2 text-xs"
                                        >
                                          {tKey(lang, 'adminUi.add_question')}
                                        </Button>
                                      </div>

                                      {editQuizQuestions.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                          {editQuizQuestions.map((_, idx) => (
                                            <button
                                              key={`edit-q-${idx}`}
                                              type="button"
                                              onClick={() => setCurrentEditQuestionIndex(idx)}
                                              title={fillTemplate(tKey(lang, 'adminUi.question_number_label'), {
                                                n: idx + 1,
                                              })}
                                              className={`h-8 w-8 rounded-sm border text-xs font-bold transition-colors ${idx === currentEditQuestionIndex ? 'border-[#7a2038] bg-[#f5d6df] text-[#6b1b31]' : 'border-[#bcbcbc] bg-white text-[#5f5f5f] hover:bg-[#f0f0f0]'}`}
                                            >
                                              {idx + 1}
                                            </button>
                                          ))}
                                        </div>
                                      )}

                                      {editQuizQuestions.length === 0 && (
                                        <div className="rounded-sm border border-dashed border-[#e1c8d0] bg-[#fff9fb] px-3 py-2 text-xs text-[#7a2038]">
                                          {tKey(lang, 'adminUi.this_quiz_has_no_questions_yet_click_add_question_to_sta')}
                                        </div>
                                      )}

                                      {currentEditQuestion && (
                                        <div
                                          key={`edit-question-${currentEditQuestion.id ?? currentEditQuestionIndex}`}
                                          className="border border-[#d2d2d2] rounded-sm p-2 bg-[#fcfcfc]"
                                        >
                                          <div className="text-xs font-bold text-[#7a2038] mb-1">
                                            {fillTemplate(tKey(lang, 'adminUi.question_number_label'), {
                                              n: currentEditQuestionIndex + 1,
                                            })}
                                          </div>

                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                            <div className="space-y-1.5 rounded-sm border border-[#edd5dc] bg-[#fff9fb] p-2">
                                              <div className="space-y-0.5">
                                                <Label className="block text-xs font-bold text-[#7a2038]">
                                                  <AdminLocaleBlockLabel lang={lang} block="vi" />
                                                </Label>
                                                <Label className="block text-[11px] text-[#5b5b5b]">
                                                  {tKey(lang, 'adminUi.question_vi')}
                                                </Label>
                                              </div>
                                              <Textarea
                                                value={currentEditQuestion.question_text_vi}
                                                onChange={(e) =>
                                                  updateEditQuestionField(
                                                    currentEditQuestionIndex,
                                                    'question_text_vi',
                                                    e.target.value
                                                  )
                                                }
                                                rows={1}
                                                className="border-[#d2d2d2] bg-white"
                                              />
                                              <Label className="text-[11px] text-[#5b5b5b]">
                                                {tKey(lang, 'adminUi.explanation_vi')}
                                              </Label>
                                              <Textarea
                                                value={currentEditQuestion.explanation_vi}
                                                onChange={(e) =>
                                                  updateEditQuestionField(
                                                    currentEditQuestionIndex,
                                                    'explanation_vi',
                                                    e.target.value
                                                  )
                                                }
                                                rows={1}
                                                placeholder={
                                                  tKey(lang, 'adminUi.explanation_vi')
                                                }
                                                className="border-[#d2d2d2] bg-white"
                                              />
                                            </div>

                                            <div className="space-y-1.5 rounded-sm border border-[#edd5dc] bg-[#fff9fb] p-2">
                                              <div className="space-y-0.5">
                                                <Label className="block text-xs font-bold text-[#7a2038]">
                                                  <AdminLocaleBlockLabel lang={lang} block="en" />
                                                </Label>
                                                <Label className="block text-[11px] text-[#5b5b5b]">
                                                  {tKey(lang, 'adminUi.question_en')}
                                                </Label>
                                              </div>
                                              <Textarea
                                                value={currentEditQuestion.question_text_en}
                                                onChange={(e) =>
                                                  updateEditQuestionField(
                                                    currentEditQuestionIndex,
                                                    'question_text_en',
                                                    e.target.value
                                                  )
                                                }
                                                rows={1}
                                                className="border-[#d2d2d2] bg-white"
                                              />
                                              <Label className="text-[11px] text-[#5b5b5b]">
                                                {tKey(lang, 'adminUi.explanation_en')}
                                              </Label>
                                              <Textarea
                                                value={currentEditQuestion.explanation_en}
                                                onChange={(e) =>
                                                  updateEditQuestionField(
                                                    currentEditQuestionIndex,
                                                    'explanation_en',
                                                    e.target.value
                                                  )
                                                }
                                                rows={1}
                                                placeholder={
                                                  tKey(lang, 'adminUi.explanation_en')
                                                }
                                                className="border-[#d2d2d2] bg-white"
                                              />
                                            </div>

                                            <div className="space-y-1.5 rounded-sm border border-[#edd5dc] bg-[#fff9fb] p-2">
                                              <div className="space-y-0.5">
                                                <Label className="block text-xs font-bold text-[#7a2038]">
                                                  <AdminLocaleBlockLabel lang={lang} block="es" />
                                                </Label>
                                                <Label className="block text-[11px] text-[#5b5b5b]">
                                                  {tKey(lang, 'adminUi.question_es')}
                                                </Label>
                                              </div>
                                              <Textarea
                                                value={currentEditQuestion.question_text_es}
                                                onChange={(e) =>
                                                  updateEditQuestionField(
                                                    currentEditQuestionIndex,
                                                    'question_text_es',
                                                    e.target.value
                                                  )
                                                }
                                                rows={1}
                                                className="border-[#d2d2d2] bg-white"
                                              />
                                              <Label className="text-[11px] text-[#5b5b5b]">
                                                {tKey(lang, 'adminUi.explanation_es')}
                                              </Label>
                                              <Textarea
                                                value={currentEditQuestion.explanation_es}
                                                onChange={(e) =>
                                                  updateEditQuestionField(
                                                    currentEditQuestionIndex,
                                                    'explanation_es',
                                                    e.target.value
                                                  )
                                                }
                                                rows={1}
                                                placeholder={
                                                  tKey(lang, 'adminUi.explanation_es')
                                                }
                                                className="border-[#d2d2d2] bg-white"
                                              />
                                            </div>
                                          </div>

                                          <div className="mt-2 space-y-1.5">
                                            <div className="hidden md:grid md:grid-cols-[44px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_44px] gap-2 text-[11px] font-semibold text-[#7a2038]">
                                              <div>{tKey(lang, 'adminUi.ans')}</div>
                                              <div>
                                                {tKey(lang, 'adminUi.answer_text_vi')}
                                              </div>
                                              <div>
                                                {tKey(lang, 'adminUi.answer_text_en')}
                                              </div>
                                              <div>
                                                {tKey(lang, 'adminUi.answer_text_es')}
                                              </div>
                                              <div className="text-right">
                                                {tKey(lang, 'adminUi.ok')}
                                              </div>
                                            </div>
                                            {(currentEditQuestion.answers || []).map(
                                              (answer: any, answerIndex: number) => (
                                                <div
                                                  key={`edit-answer-${currentEditQuestionIndex}-${answer.id ?? answerIndex}`}
                                                  className="rounded-sm border border-[#ead9de] bg-white p-2 md:grid md:grid-cols-[44px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_44px] md:gap-2 md:border-0 md:bg-transparent md:p-0 space-y-2 md:space-y-0"
                                                >
                                                  <div className="text-xs font-semibold text-[#7a2038] flex items-center md:min-h-9">
                                                    {String.fromCharCode(65 + answerIndex)}
                                                  </div>
                                                  <div className="space-y-1 md:space-y-0">
                                                    <Label className="text-[11px] text-[#5b5b5b] md:hidden">
                                                      {tKey(lang, 'adminUi.answer_text_vi')}
                                                    </Label>
                                                  <Input
                                                    value={answer.answer_text_vi}
                                                    onChange={(e) =>
                                                      updateEditAnswerField(
                                                        currentEditQuestionIndex,
                                                        answerIndex,
                                                        'answer_text_vi',
                                                        e.target.value
                                                      )
                                                    }
                                                    placeholder={fillTemplate(tKey(lang, 'adminUi.answer_ph_vi'), {
                                                      letter: String.fromCharCode(65 + answerIndex),
                                                    })}
                                                    className="h-9 border-[#d2d2d2] bg-white"
                                                  />
                                                  </div>
                                                  <div className="space-y-1 md:space-y-0">
                                                    <Label className="text-[11px] text-[#5b5b5b] md:hidden">
                                                      {tKey(lang, 'adminUi.answer_text_en')}
                                                    </Label>
                                                  <Input
                                                    value={answer.answer_text_en}
                                                    onChange={(e) =>
                                                      updateEditAnswerField(
                                                        currentEditQuestionIndex,
                                                        answerIndex,
                                                        'answer_text_en',
                                                        e.target.value
                                                      )
                                                    }
                                                    placeholder={fillTemplate(tKey(lang, 'adminUi.answer_ph_en'), {
                                                      letter: String.fromCharCode(65 + answerIndex),
                                                    })}
                                                    className="h-9 border-[#d2d2d2] bg-white"
                                                  />
                                                  </div>
                                                  <div className="space-y-1 md:space-y-0">
                                                    <Label className="text-[11px] text-[#5b5b5b] md:hidden">
                                                      {tKey(lang, 'adminUi.answer_text_es')}
                                                    </Label>
                                                  <Input
                                                    value={answer.answer_text_es}
                                                    onChange={(e) =>
                                                      updateEditAnswerField(
                                                        currentEditQuestionIndex,
                                                        answerIndex,
                                                        'answer_text_es',
                                                        e.target.value
                                                      )
                                                    }
                                                    placeholder={fillTemplate(tKey(lang, 'adminUi.answer_ph_es'), {
                                                      letter: String.fromCharCode(65 + answerIndex),
                                                    })}
                                                    className="h-9 border-[#d2d2d2] bg-white"
                                                  />
                                                  </div>
                                                  <div className="flex items-center justify-end gap-2 md:gap-0">
                                                    <Label className="text-[11px] text-[#5b5b5b] md:hidden">
                                                      {tKey(lang, 'adminUi.mark_correct')}
                                                    </Label>
                                                    <input
                                                      type="radio"
                                                      checked={answer.is_correct}
                                                      onChange={() =>
                                                        setEditCorrectAnswer(
                                                          currentEditQuestionIndex,
                                                          answerIndex
                                                        )
                                                      }
                                                      className="h-4 w-4 accent-[#7a2038]"
                                                    />
                                                  </div>
                                                </div>
                                              )
                                            )}
                                          </div>

                                          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                                            <div>
                                              <Label className="text-xs text-[#5b5b5b]">
                                                {tKey(lang, 'adminUi.question_image')}
                                              </Label>
                                              {currentEditQuestionImagePreview && (
                                                <div className="mb-2 rounded-sm border border-[#d2d2d2] bg-white p-2">
                                                  <img
                                                    src={currentEditQuestionImagePreview}
                                                    alt={tKey(lang, 'adminUi.new_image_preview')}
                                                    className="h-28 w-full rounded-sm object-contain bg-[#f9f9f9]"
                                                  />
                                                </div>
                                              )}
                                              {currentEditQuestion.image_url && (
                                                <div className="mb-2 rounded-sm border border-[#d2d2d2] bg-white p-2">
                                                  <img
                                                    src={resolveMediaUrl(currentEditQuestion.image_url)}
                                                    alt={tKey(lang, 'adminUi.question_image')}
                                                    className="h-28 w-full rounded-sm object-contain bg-[#f9f9f9]"
                                                  />
                                                </div>
                                              )}
                                              <Input
                                                key={`edit-img-${currentEditQuestionIndex}`}
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) =>
                                                  updateEditQuestionImage(
                                                    currentEditQuestionIndex,
                                                    e.target.files?.[0] || null
                                                  )
                                                }
                                                className="h-9 border-[#d2d2d2] bg-white"
                                              />
                                              {currentEditQuestionImageFile && (
                                                <div className="mt-1 text-xs text-[#5b5b5b]">
                                                  {currentEditQuestionImageFile.name}
                                                </div>
                                              )}
                                              {currentEditQuestion.image_url && (
                                                <Button
                                                  type="button"
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() =>
                                                    updateEditQuestionField(
                                                      currentEditQuestionIndex,
                                                      'image_url',
                                                      ''
                                                    )
                                                  }
                                                  className="mt-2 h-8 border-[#d2d2d2] bg-white"
                                                >
                                                  {tKey(lang, 'adminUi.remove_image')}
                                                </Button>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                                )}
                                <div className="md:col-span-2 flex gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditQuizModalStep('questions')}
                                    disabled={editQuizModalStep === 'questions'}
                                    className="h-9 border-[#d2d2d2] bg-white"
                                  >
                                    {tKey(lang, 'adminUi.next')}
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => onSaveEditQuiz(item)}
                                    className="h-9 bg-[#7a2038] hover:bg-[#5a1428] text-white"
                                    disabled={loadingEditQuizDetail || savingEditQuizDetail}
                                  >
                                    {savingEditQuizDetail
                                      ? tKey(lang, 'adminUi.saving')
                                      : tKey(lang, 'adminUi.save')}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={onCancelEditQuiz}
                                    className="h-9 border-[#d2d2d2] bg-white"
                                    disabled={savingEditQuizDetail}
                                  >
                                    {tKey(lang, 'adminUi.cancel')}
                                  </Button>
                                </div>
                              </div>
                              </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        ))}
                        <AdminListPaginationControls
                          lang={lang}
                          page={adminQuizzesPage}
                          pageSize={ADMIN_LIST_PAGE_SIZE}
                          total={filteredAdminQuizzes.length}
                          onPageChange={setAdminQuizzesListPage}
                        />
                      </div>
                    </div>
                  )}
                </AdminQuizzesTabShell>
  );
}
