'use client';

import { Footer } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/hooks/useLanguage';
import {
  ADMIN_LIST_PAGE_SIZE,
  ADMIN_REDESIGN_CSS,
  ADMIN_USER_STATUS_FILTER_OPTIONS,
  AdminActionIconButton,
  AdminContainer,
  AdminListPaginationControls,
  AdminMaterialsSection,
  AdminPremiumRequestsTab,
  AdminQuizzesSection,
  AdminUsersTab,
  adminHiddenLabelSuffix,
  adminTrilingualField,
  buildStoredMediaPath,
  clampPage,
  createEmptyEditQuestionDraft,
  createEmptyQuestionDraft,
  createInitialEditMaterialTopicGroupForm,
  createInitialEditQuizCategoryForm,
  createInitialEditQuizForm,
  createInitialEditQuizTopicGroupForm,
  createInitialEditQuizTypeForm,
  createInitialEditUserForm,
  createInitialMaterialTopicGroupForm,
  createInitialQuizCategoryForm,
  createInitialQuizForm,
  createInitialQuizTopicGroupForm,
  createInitialQuizTypeForm,
  createInitialSubjectForm,
  filterByGroupId,
  formatDateTime as formatDateTimeHelper,
  formatUserRole,
  getAdminTabButtons,
  getMaterialsSubtabs,
  getQuizDisplayDescription as getQuizDisplayDescriptionHelper,
  getQuizDisplayTitle as getQuizDisplayTitleHelper,
  getQuizTypeDisplayName as getQuizTypeDisplayNameHelper,
  getQuizTypeFilterKey as getQuizTypeFilterKeyHelper,
  getQuizTypeLabel as getQuizTypeLabelHelper,
  getQuizzesSubtabs,
  isQuizzesSubtabActive,
  mapAdminSubjectsToSubjectShape,
  mapTopicGroupsForLanguage,
  parseDateSafe,
  premiumUntilForDatetimeLocal,
  premiumUntilFromDatetimeLocal,
  resolveMaterialsSubtabState,
  resolveQuizzesSubtabState,
  searchByKeyword,
  useAdminActions,
  useAdminMaterials,
  useAdminPageState,
  useAdminQuizzes,
  useAdminShell,
  useAdminUsers,
  type AdminMaterialsSubTab,
} from '@/features/admin';
import { fillTemplate, tKey } from '@viet/i18n';
import { formatUserFacingApiError } from '@/lib/api/format-api-error';
import type { MaterialPostAdminRow } from '@/lib/api/types';
import { localePath } from '@/lib/i18n-routing';
import { resolveMediaUrl, uploadQuestionImage } from '@/lib/api/upload';
import {
  createAdminMaterialTopicGroup,
  createAdminQuizCategory,
  createAdminQuizTopicGroup,
  createAdminQuizType,
  createAdminSubject,
  createManualQuiz,
  deleteAdminMaterialTopicGroup,
  deleteAdminMaterialPost,
  deleteAdminQuiz,
  deleteAdminQuizCategory,
  deleteAdminQuizTopicGroup,
  deleteAdminQuizType,
  deleteAdminSubject,
  deleteAdminUser,
  getAdminMaterialTopicGroups,
  getAdminQuizCategories,
  getAdminQuizTopicGroups,
  getAdminQuizTypes,
  getAdminQuizzes,
  getAdminQuizDetail,
  getAdminSubjects,
  getAdminMaterialPostsBySubject,
  getAdminUserDashboard,
  getAdminUsers,
  lockAdminUser,
  unlockAdminUser,
  updateAdminMaterialTopicGroup,
  updateAdminQuiz,
  updateAdminQuizCategory,
  updateAdminQuizTopicGroup,
  updateAdminQuizDetail,
  updateAdminQuizType,
  updateAdminSubject,
  updateAdminUser,
  type AdminQuizCategory,
  type AdminQuizType,
  type AdminSubject,
  type AdminTopicGroup,
  type DashboardResponse,
} from '@/lib/api/admin';
import {
  CalendarDays,
  Download,
  Edit,
  Eye,
  EyeOff,
  Lock,
  Trash2,
  Unlock,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const DEFAULT_QUIZ_TYPE_CODE = 'general';

export default function Admin() {
  const queryClient = useQueryClient();
  const { lang, t, tk } = useLanguage();
  const {
    notice,
    setNotice,
    activeTab,
    setActiveTab,
    materialsSubTab,
    setMaterialsSubTab,
    quizzesSubTab,
    setQuizzesSubTab,
    quizzesHierarchyTab,
    setQuizzesHierarchyTab,
  } = useAdminPageState();
  const searchParams = useSearchParams();
  const { showError, showFormError, showSuccess } = useAdminActions(lang, setNotice);
  const { auth, isAdmin, invalidateHomeQueries } = useAdminShell(queryClient);

  useEffect(() => {
    const tab = searchParams.get('tab');
    const materialsSub = searchParams.get('materialsSub');
    if (tab !== 'materials') return;
    setActiveTab('materials');
    if (
      materialsSub === 'topic_groups' ||
      materialsSub === 'subjects' ||
      materialsSub === 'manage'
    ) {
      setMaterialsSubTab(materialsSub as AdminMaterialsSubTab);
    }
  }, [searchParams, setActiveTab, setMaterialsSubTab]);

  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userCreatedFrom, setUserCreatedFrom] = useState('');
  const [userCreatedTo, setUserCreatedTo] = useState('');
  const [userCreatedSort, setUserCreatedSort] = useState<'desc' | 'asc'>('desc');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [userLearnerTypeFilter, setUserLearnerTypeFilter] = useState<'all' | 'standard' | 'premium'>(
    'all'
  );
  const [adminUsersListPage, setAdminUsersListPage] = useState(1);
  const [adminMaterialsListPage, setAdminMaterialsListPage] = useState(1);
  const [adminQuizzesListPage, setAdminQuizzesListPage] = useState(1);
  const [materialSearch, setMaterialSearch] = useState('');
  const [quizSearch, setQuizSearch] = useState('');
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [viewingUserId, setViewingUserId] = useState<number | null>(null);
  const [viewingUserDashboard, setViewingUserDashboard] = useState<DashboardResponse | null>(null);
  const [viewingUserLoading, setViewingUserLoading] = useState(false);
  const [viewingUserError, setViewingUserError] = useState('');
  const [editUserForm, setEditUserForm] = useState(createInitialEditUserForm);

  const [adminSubjects, setAdminSubjects] = useState<AdminSubject[]>([]);
  const [materialTopicGroupsAdmin, setMaterialTopicGroupsAdmin] = useState<AdminTopicGroup[]>([]);
  const [newMaterialTopicGroup, setNewMaterialTopicGroup] = useState(
    createInitialMaterialTopicGroupForm
  );
  const [editingMaterialTopicGroupId, setEditingMaterialTopicGroupId] = useState<number | null>(null);
  const [editMaterialTopicGroupForm, setEditMaterialTopicGroupForm] = useState(
    createInitialEditMaterialTopicGroupForm
  );
  const [editingSubjectId, setEditingSubjectId] = useState<number | null>(null);
  const [subjectForm, setSubjectForm] = useState(createInitialSubjectForm);
  const [editSubjectForm, setEditSubjectForm] = useState(createInitialSubjectForm);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  /** Danh sách tài liệu: một chủ đề hoặc "tất cả" trong phạm vi bộ lọc loại chủ đề */
  const [materialListSubjectId, setMaterialListSubjectId] = useState<number | 'all' | null>(null);
  const [materials, setMaterials] = useState<MaterialPostAdminRow[]>([]);
  const [quizCreateDialogOpen, setQuizCreateDialogOpen] = useState(false);
  const [quizCreateModalStep, setQuizCreateModalStep] = useState<'meta' | 'questions'>('meta');
  const [materialTopicGroupCreateDialogOpen, setMaterialTopicGroupCreateDialogOpen] = useState(false);
  const [materialSubjectCreateDialogOpen, setMaterialSubjectCreateDialogOpen] = useState(false);
  const [quizTopicGroupCreateDialogOpen, setQuizTopicGroupCreateDialogOpen] = useState(false);
  const [quizCategoryCreateDialogOpen, setQuizCategoryCreateDialogOpen] = useState(false);
  const [questionCount, setQuestionCount] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionDrafts, setQuestionDrafts] = useState([createEmptyQuestionDraft()]);
  const [questionImageFiles, setQuestionImageFiles] = useState<(File | null)[]>([null]);
  const [currentQuestionImagePreview, setCurrentQuestionImagePreview] = useState('');
  const [creatingQuiz, setCreatingQuiz] = useState(false);
  const [quizForm, setQuizForm] = useState(() => createInitialQuizForm(DEFAULT_QUIZ_TYPE_CODE));
  const [quizTypes, setQuizTypes] = useState<AdminQuizType[]>([]);
  const [quizCategoriesAdmin, setQuizCategoriesAdmin] = useState<AdminQuizCategory[]>([]);
  const [quizTopicGroupsAdmin, setQuizTopicGroupsAdmin] = useState<AdminTopicGroup[]>([]);
  const [newQuizTopicGroup, setNewQuizTopicGroup] = useState(createInitialQuizTopicGroupForm);
  const [editingQuizTopicGroupId, setEditingQuizTopicGroupId] = useState<number | null>(null);
  const [editQuizTopicGroupForm, setEditQuizTopicGroupForm] = useState(
    createInitialEditQuizTopicGroupForm
  );
  const [newQuizType, setNewQuizType] = useState(createInitialQuizTypeForm);
  const [editingQuizTypeId, setEditingQuizTypeId] = useState<number | null>(null);
  const [editQuizTypeValue, setEditQuizTypeValue] = useState(createInitialEditQuizTypeForm);
  const [newQuizCategory, setNewQuizCategory] = useState(createInitialQuizCategoryForm);
  const [editingQuizCategoryId, setEditingQuizCategoryId] = useState<number | null>(null);
  const [editQuizCategoryForm, setEditQuizCategoryForm] = useState(createInitialEditQuizCategoryForm);
  const [materialSubjectFilterGroupId, setMaterialSubjectFilterGroupId] = useState<string>('all');
  const [materialListFilterGroupId, setMaterialListFilterGroupId] = useState<string>('all');
  const [materialTopicGroupSearch, setMaterialTopicGroupSearch] = useState('');
  const [materialSubjectSearch, setMaterialSubjectSearch] = useState('');
  const [quizCategoryFilterGroupId, setQuizCategoryFilterGroupId] = useState<string>('all');
  const [quizListFilterGroupId, setQuizListFilterGroupId] = useState<string>('all');
  const [quizListFilterCategoryId, setQuizListFilterCategoryId] = useState<string>('all');
  const [quizTopicGroupSearch, setQuizTopicGroupSearch] = useState('');
  const [quizCategorySearch, setQuizCategorySearch] = useState('');
  const [adminQuizzes, setAdminQuizzes] = useState<any[]>([]);
  const [selectedQuizTypeFilter, setSelectedQuizTypeFilter] = useState<string>('all');
  const [editingQuizId, setEditingQuizId] = useState<number | null>(null);
  const [editQuizForm, setEditQuizForm] = useState(() =>
    createInitialEditQuizForm(DEFAULT_QUIZ_TYPE_CODE)
  );
  const [editQuizQuestions, setEditQuizQuestions] = useState<any[]>([]);
  const [editQuizQuestionImageFiles, setEditQuizQuestionImageFiles] = useState<(File | null)[]>([]);
  const [editQuizModalStep, setEditQuizModalStep] = useState<'meta' | 'questions'>('meta');
  const [currentEditQuestionIndex, setCurrentEditQuestionIndex] = useState(0);
  const [currentEditQuestionImagePreview, setCurrentEditQuestionImagePreview] = useState('');
  const [loadingEditQuizDetail, setLoadingEditQuizDetail] = useState(false);
  const [savingEditQuizDetail, setSavingEditQuizDetail] = useState(false);

  const currentQuestionDraft = questionDrafts[currentQuestionIndex] || createEmptyQuestionDraft();
  const currentQuestionImageFile = questionImageFiles[currentQuestionIndex] || null;
  const currentEditQuestion = editQuizQuestions[currentEditQuestionIndex] || null;
  const currentEditQuestionImageFile = editQuizQuestionImageFiles[currentEditQuestionIndex] || null;

  useEffect(() => {
    if (!currentQuestionImageFile) {
      setCurrentQuestionImagePreview('');
      return;
    }

    const previewUrl = URL.createObjectURL(currentQuestionImageFile);
    setCurrentQuestionImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [currentQuestionImageFile]);

  useEffect(() => {
    setCurrentEditQuestionIndex((prev) => {
      if (!editQuizQuestions.length) return 0;
      return Math.min(prev, editQuizQuestions.length - 1);
    });
  }, [editQuizQuestions.length]);

  useEffect(() => {
    if (!currentEditQuestionImageFile) {
      setCurrentEditQuestionImagePreview('');
      return;
    }

    const previewUrl = URL.createObjectURL(currentEditQuestionImageFile);
    setCurrentEditQuestionImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [currentEditQuestionImageFile]);

  const activeQuizTypes = useMemo(() => quizTypes.filter((item) => item.is_active), [quizTypes]);

  function getQuizTypeLabel(typeItem: AdminQuizType) {
    return getQuizTypeLabelHelper(typeItem, lang);
  }

  function getQuizTopicGroupLabel(group: AdminTopicGroup) {
    const base = adminTrilingualField(lang, group.name_vi, group.name_es, group.name_en);
    return group.is_active ? base : `${base}${adminHiddenLabelSuffix(lang)}`;
  }

  function getQuizCategoryLabel(category: AdminQuizCategory) {
    const base = adminTrilingualField(lang, category.name_vi, category.name_es, category.name_en);
    return category.is_active ? base : `${base}${adminHiddenLabelSuffix(lang)}`;
  }

  function getQuizCategoryParentGroupLabel(category: AdminQuizCategory) {
    const gid = category.quiz_topic_group_id;
    if (gid != null) {
      const group = quizTopicGroupsAdmin.find((g) => g.id === gid);
      if (group) return getQuizTopicGroupLabel(group);
    }
    return adminTrilingualField(
      lang,
      category.quiz_topic_group_name_vi || '-',
      category.quiz_topic_group_name_es || '-',
      category.quiz_topic_group_name_en
    );
  }

  function getQuizTypeFilterKey(item: any) {
    return getQuizTypeFilterKeyHelper(item, quizTypes);
  }

  function getQuizTypeDisplayName(item: any) {
    return getQuizTypeDisplayNameHelper(item, lang, quizTypes);
  }

  function getQuizDisplayTitle(item: any) {
    return getQuizDisplayTitleHelper(item, lang);
  }

  function getQuizDisplayDescription(item: any) {
    return getQuizDisplayDescriptionHelper(item, lang);
  }

  function formatDateTime(value: unknown) {
    const locale = lang === 'vi' ? 'vi-VN' : lang === 'en' ? 'en-US' : 'es-ES';
    return formatDateTimeHelper(value, locale);
  }

  function ensureQuizTypeSelected() {
    if (!activeQuizTypes.length) return;
    const hasQuizFormType = activeQuizTypes.some((item) => item.code === quizForm.quiz_type);
    if (!hasQuizFormType) {
      setQuizForm((prev) => ({ ...prev, quiz_type: activeQuizTypes[0].code }));
    }
    const hasEditQuizType = activeQuizTypes.some((item) => item.code === editQuizForm.quiz_type);
    if (!hasEditQuizType) {
      setEditQuizForm((prev) => ({ ...prev, quiz_type: activeQuizTypes[0].code }));
    }
  }

  const materialSubjectsForAdminUi = useMemo(
    () => mapAdminSubjectsToSubjectShape(adminSubjects, lang),
    [adminSubjects, lang]
  );
  const selectedSubject = useMemo(
    () => materialSubjectsForAdminUi.find((item) => item.id === selectedSubjectId) || null,
    [materialSubjectsForAdminUi, selectedSubjectId]
  );
  const materialTopicGroups = useMemo(() => {
    return mapTopicGroupsForLanguage(materialTopicGroupsAdmin, lang, { markInactive: true });
  }, [materialTopicGroupsAdmin, lang]);
  const materialTopicGroupsCreatePick = useMemo(() => {
    return mapTopicGroupsForLanguage(
      materialTopicGroupsAdmin.filter((g) => g.is_active),
      lang,
      { markInactive: false }
    );
  }, [materialTopicGroupsAdmin, lang]);
  const materialSubjectFilterResolved = useMemo(() => {
    const chosen = materialSubjectFilterGroupId;
    if (chosen === 'all' || chosen === '') return 'all';
    if (materialTopicGroupsAdmin.some((g) => String(g.id) === chosen)) return chosen;
    return 'all';
  }, [materialTopicGroupsAdmin, materialSubjectFilterGroupId]);
  const filteredAdminSubjectsByGroup = useMemo(() => {
    return filterByGroupId(adminSubjects, materialSubjectFilterResolved, 'material_topic_group_id');
  }, [adminSubjects, materialSubjectFilterResolved]);
  const filteredMaterialTopicGroups = useMemo(() => {
    return searchByKeyword(materialTopicGroupsAdmin, materialTopicGroupSearch, (item) => [
      item.code,
      item.name_vi,
      item.name_en,
      item.name_es,
      item.description_vi,
      item.description_en,
      item.description_es,
    ]);
  }, [materialTopicGroupsAdmin, materialTopicGroupSearch]);
  const filteredAdminSubjects = useMemo(() => {
    return searchByKeyword(filteredAdminSubjectsByGroup, materialSubjectSearch, (item) => [
      item.code,
      item.name_vi,
      item.name_en,
      item.name_es,
      item.description_vi,
      item.description_en,
      item.description_es,
      item.material_topic_group_name_vi,
      item.material_topic_group_name_en,
      item.material_topic_group_name_es,
    ]);
  }, [filteredAdminSubjectsByGroup, materialSubjectSearch]);
  const listSubjectsByGroup = useMemo(() => {
    return filterByGroupId(
      materialSubjectsForAdminUi as any[],
      materialListFilterGroupId,
      'material_topic_group_id'
    );
  }, [materialSubjectsForAdminUi, materialListFilterGroupId]);
  const filteredQuizCategoriesByGroup = useMemo(() => {
    return filterByGroupId(quizCategoriesAdmin, quizCategoryFilterGroupId, 'quiz_topic_group_id');
  }, [quizCategoriesAdmin, quizCategoryFilterGroupId]);
  const filteredQuizTopicGroups = useMemo(() => {
    return searchByKeyword(quizTopicGroupsAdmin, quizTopicGroupSearch, (item) => [
      item.code,
      item.name_vi,
      item.name_en,
      item.name_es,
      item.description_vi,
      item.description_en,
      item.description_es,
    ]);
  }, [quizTopicGroupsAdmin, quizTopicGroupSearch]);
  const filteredQuizCategories = useMemo(() => {
    return searchByKeyword(filteredQuizCategoriesByGroup, quizCategorySearch, (item) => [
      item.name_vi,
      item.name_en,
      item.name_es,
      item.description_vi,
      item.description_en,
      item.description_es,
    ]);
  }, [filteredQuizCategoriesByGroup, quizCategorySearch]);
  const listQuizCategoriesByGroup = useMemo(() => {
    return filterByGroupId(quizCategoriesAdmin, quizListFilterGroupId, 'quiz_topic_group_id');
  }, [quizCategoriesAdmin, quizListFilterGroupId]);
  const createQuizCategories = useMemo(() => {
    return filterByGroupId(
      quizCategoriesAdmin,
      String(quizForm.quiz_topic_group_id || ''),
      'quiz_topic_group_id'
    );
  }, [quizCategoriesAdmin, quizForm.quiz_topic_group_id]);
  const createQuizCategoriesActive = useMemo(
    () => createQuizCategories.filter((c) => c.is_active !== false),
    [createQuizCategories]
  );
  const quizTopicGroupsPickActive = useMemo(
    () => quizTopicGroupsAdmin.filter((g) => g.is_active),
    [quizTopicGroupsAdmin]
  );
  const editQuizCategories = useMemo(() => {
    return filterByGroupId(
      quizCategoriesAdmin,
      String(editQuizForm.quiz_topic_group_id || ''),
      'quiz_topic_group_id'
    );
  }, [quizCategoriesAdmin, editQuizForm.quiz_topic_group_id]);
  const {
    adminUserQuickStats,
    learnerUsers,
    filteredUsers,
    adminUsersTotalPages,
    adminUsersPage,
    paginatedUsers,
  } = useAdminUsers({
    users,
    userSearch,
    userCreatedFrom,
    userCreatedTo,
    userCreatedSort,
    userStatusFilter,
    userLearnerTypeFilter,
    parseDateSafe,
    adminUsersListPage,
    setAdminUsersListPage,
    pageSize: ADMIN_LIST_PAGE_SIZE,
  });

  const { filteredMaterials, adminMaterialsTotalPages, adminMaterialsPage, paginatedMaterials } =
    useAdminMaterials({
      materials,
      materialSearch,
      materialListSubjectId,
      adminMaterialsListPage,
      setAdminMaterialsListPage,
      pageSize: ADMIN_LIST_PAGE_SIZE,
    });

  const {
    filteredAdminQuizzes,
    adminQuizzesTotalPages,
    adminQuizzesPage,
    paginatedAdminQuizzes,
  } = useAdminQuizzes({
    adminQuizzes,
    selectedQuizTypeFilter,
    quizListFilterGroupId,
    quizListFilterCategoryId,
    quizCategoriesAdmin,
    quizSearch,
    getQuizTypeFilterKey,
    getQuizTypeDisplayName,
    adminQuizzesListPage,
    setAdminQuizzesListPage,
    pageSize: ADMIN_LIST_PAGE_SIZE,
  });

  useEffect(() => {
    if (!auth?.token || !isAdmin) return;
    loadAll();
  }, [auth?.token, isAdmin, lang]); // eslint-disable-line react-hooks/exhaustive-deps -- loadAll: sync theo auth/lang, không đưa hàm vào deps

  useEffect(() => {
    ensureQuizTypeSelected();
  }, [activeQuizTypes]); // eslint-disable-line react-hooks/exhaustive-deps -- ensureQuizTypeSelected: sync khi catalog đổi

  async function loadAll(options?: { bustPublicMaterialsCache?: boolean }) {
    const bust = options?.bustPublicMaterialsCache ?? false;
    try {
      const [
        userRows,
        quizRows,
        adminSubjectRows,
        adminQuizTypesRows,
        adminQuizCategoriesRows,
        materialTopicGroupRows,
        quizTopicGroupRows,
      ] = await Promise.all([
        getAdminUsers(),
        getAdminQuizzes(),
        getAdminSubjects(),
        getAdminQuizTypes(),
        getAdminQuizCategories(),
        getAdminMaterialTopicGroups(),
        getAdminQuizTopicGroups(),
      ]);
      setUsers(userRows);
      setAdminQuizzes(quizRows);
      setAdminSubjects(adminSubjectRows);
      setQuizTypes(adminQuizTypesRows);
      setQuizCategoriesAdmin(adminQuizCategoriesRows);
      setMaterialTopicGroupsAdmin(materialTopicGroupRows);
      setQuizTopicGroupsAdmin(quizTopicGroupRows);
      if (materialTopicGroupRows.length > 0) {
        const firstMatGroup = materialTopicGroupRows.find((g) => g.is_active) || materialTopicGroupRows[0];
        const firstGroupId = Number(firstMatGroup.id);
        setSubjectForm((prev) => ({
          ...prev,
          material_topic_group_id: prev.material_topic_group_id || firstGroupId,
        }));
      }
      if (quizTopicGroupRows.length > 0) {
        const firstQuizGroup = quizTopicGroupRows.find((g) => g.is_active) || quizTopicGroupRows[0];
        const firstQuizGroupId = Number(firstQuizGroup.id);
        setNewQuizCategory((prev) => ({
          ...prev,
          quiz_topic_group_id: prev.quiz_topic_group_id || String(firstQuizGroupId),
        }));
      }
      const firstActiveSubject = adminSubjectRows.find((s) => s.is_active !== false) || adminSubjectRows[0];
      if (!selectedSubjectId && adminSubjectRows.length && firstActiveSubject) {
        setSelectedSubjectId(firstActiveSubject.id);
      }
      if (materialListSubjectId === null && adminSubjectRows.length) {
        setMaterialListSubjectId('all');
      }
      if (bust) {
        const scopedRows = filterByGroupId(
          mapAdminSubjectsToSubjectShape(adminSubjectRows, lang) as any[],
          materialListFilterGroupId,
          'material_topic_group_id'
        );
        const scopedIds = scopedRows.map((s: { id: number }) => s.id);
        if (materialListSubjectId === 'all') {
          await loadMaterialsForSubjectIds(scopedIds, { bustCache: true });
        } else if (materialListSubjectId != null) {
          await loadMaterials(materialListSubjectId, { bustCache: true });
        } else if (selectedSubjectId) {
          await loadMaterials(selectedSubjectId, { bustCache: true });
        }
        await invalidateHomeQueries();
      }
    } catch (error) {
      showError(error instanceof Error ? error : 'Error loading data');
    }
  }

  async function loadMaterials(subjectId: number, options?: { bustCache?: boolean }) {
    try {
      const rows = await getAdminMaterialPostsBySubject(subjectId, {
        bustCache: options?.bustCache ?? false,
      });
      setMaterials(rows);
    } catch (error) {
      showError(error instanceof Error ? error : 'Error loading materials');
    }
  }

  async function loadMaterialsForSubjectIds(subjectIds: number[], options?: { bustCache?: boolean }) {
    if (!subjectIds.length) {
      setMaterials([]);
      return;
    }
    try {
      const bust = options?.bustCache ?? false;
      const rows = await Promise.all(
        subjectIds.map((id) => getAdminMaterialPostsBySubject(id, { bustCache: bust }))
      );
      setMaterials(rows.flat());
    } catch (error) {
      showError(error instanceof Error ? error : 'Error loading materials');
    }
  }

  async function refreshMaterialsList(options?: { bustCache?: boolean }) {
    const scoped = filterByGroupId(
      materialSubjectsForAdminUi as any[],
      materialListFilterGroupId,
      'material_topic_group_id'
    );
    const ids = scoped.map((s: { id: number }) => s.id);
    if (materialListSubjectId === 'all') {
      await loadMaterialsForSubjectIds(ids, options);
    } else if (materialListSubjectId != null) {
      await loadMaterials(materialListSubjectId, options);
    }
  }

  useEffect(() => {
    if (!auth?.token || !isAdmin) return;
    if (materialListSubjectId === null) return;
    void refreshMaterialsList();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional reload when list scope changes
  }, [materialListSubjectId, materialListFilterGroupId, auth?.token, isAdmin, materialSubjectsForAdminUi]);

  function onStartEditUser(item: any) {
    setEditingUserId(item.id);
    setEditUserForm({
      username: item.username || '',
      email: item.email || '',
      full_name: item.full_name || '',
      is_active: Boolean(item.is_active),
      password: '',
      premium_plan: (item.premium_plan || 'none') as 'none' | '1m' | '3m',
      premium_until: premiumUntilForDatetimeLocal(item.premium_until),
    });
  }

  function onCancelEditUser() {
    setEditingUserId(null);
    setEditUserForm(createInitialEditUserForm());
  }

  async function onSaveEditUser(item: any) {
    try {
      await updateAdminUser(item.id, {
        username: editUserForm.username,
        email: editUserForm.email,
        full_name: editUserForm.full_name,
        is_active: editUserForm.is_active,
        password: editUserForm.password ? editUserForm.password : undefined,
        premium_plan: editUserForm.premium_plan,
        premium_until:
          editUserForm.premium_plan === 'none'
            ? null
            : premiumUntilFromDatetimeLocal(editUserForm.premium_until),
      });
      await loadAll();
      onCancelEditUser();
      showSuccess('adminUi.toast_user_updated');
    } catch (error) {
      showError(error instanceof Error ? error : 'Error');
    }
  }

  async function onToggleLockUser(item: any) {
    try {
      if (item.is_active) {
        await lockAdminUser(item.id);
      } else {
        await unlockAdminUser(item.id);
      }
      await loadAll();
    } catch (error) {
      showError(error instanceof Error ? error : 'Error');
    }
  }

  async function onDeleteUser(item: any) {
    if (!window.confirm(`Xóa user ${item.username}?`)) return;
    try {
      await deleteAdminUser(item.id);
      await loadAll();
    } catch (error) {
      showError(error instanceof Error ? error : 'Error');
    }
  }

  function onCloseUserDashboard() {
    setViewingUserId(null);
    setViewingUserDashboard(null);
    setViewingUserError('');
  }

  function onViewUserDashboard(item: any) {
    if (viewingUserId === item.id) {
      onCloseUserDashboard();
      return;
    }
    setViewingUserId(item.id);
    setViewingUserDashboard(null);
    setViewingUserError('');
  }

  useEffect(() => {
    if (viewingUserId == null) return;
    const uid = viewingUserId;
    let cancelled = false;
    (async () => {
      setViewingUserLoading(true);
      setViewingUserError('');
      try {
        const data = await getAdminUserDashboard(uid, lang);
        if (!cancelled) {
          setViewingUserDashboard(data);
        }
      } catch (error) {
        if (!cancelled) {
          setViewingUserError(
            error instanceof Error
              ? formatUserFacingApiError(lang, error)
              : tKey(lang, 'adminUi.could_not_load_profile')
          );
        }
      } finally {
        if (!cancelled) {
          setViewingUserLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [viewingUserId, lang]);

  async function onCreateMaterialTopicGroup(event: React.FormEvent) {
    event.preventDefault();
    if (!newMaterialTopicGroup.name_vi.trim() || !newMaterialTopicGroup.name_es.trim()) {
      showFormError(
        tKey(lang, 'adminUi.enter_names_in_vietnamese_and_spanish_2')
      );
      return;
    }
    try {
      await createAdminMaterialTopicGroup({ ...newMaterialTopicGroup, is_active: true });
      setNewMaterialTopicGroup(createInitialMaterialTopicGroupForm());
      setMaterialTopicGroupCreateDialogOpen(false);
      await loadAll({ bustPublicMaterialsCache: true });
      showSuccess('adminUi.toast_material_topic_group_added');
    } catch (error) {
      showError(error instanceof Error ? error : 'Error');
    }
  }

  function onStartEditMaterialTopicGroup(item: AdminTopicGroup) {
    setEditingMaterialTopicGroupId(item.id);
    setEditMaterialTopicGroupForm({
      code: item.code || '',
      name_vi: item.name_vi || '',
      name_en: item.name_en || '',
      name_es: item.name_es || '',
      description_vi: item.description_vi || '',
      description_en: item.description_en || '',
      description_es: item.description_es || '',
      is_active: Boolean(item.is_active),
      access_tier: item.access_tier === 'premium' ? 'premium' : 'free',
    });
  }

  async function onSaveEditMaterialTopicGroup(item: AdminTopicGroup) {
    try {
      await updateAdminMaterialTopicGroup(item.id, {
        ...editMaterialTopicGroupForm,
        code: item.code,
        is_active: item.is_active,
      });
      setEditingMaterialTopicGroupId(null);
      await loadAll({ bustPublicMaterialsCache: true });
      showSuccess('adminUi.toast_material_topic_group_updated');
    } catch (error) {
      showError(error instanceof Error ? error : 'Error');
    }
  }

  async function onDeleteMaterialTopicGroup(item: AdminTopicGroup) {
    if (
      !window.confirm(
        `${tKey(lang, 'adminUi.delete_parent_group')} ${item.code}?`
      )
    ) {
      return;
    }
    try {
      await deleteAdminMaterialTopicGroup(item.id);
      await loadAll({ bustPublicMaterialsCache: true });
      showSuccess('adminUi.toast_material_topic_group_deleted');
    } catch (error) {
      showError(error instanceof Error ? error : 'Error');
    }
  }

  async function onToggleMaterialTopicGroupActive(item: AdminTopicGroup) {
    try {
      await updateAdminMaterialTopicGroup(item.id, {
        code: item.code,
        name_vi: item.name_vi,
        name_en: item.name_en || '',
        name_es: item.name_es,
        description_vi: item.description_vi || '',
        description_en: item.description_en || '',
        description_es: item.description_es || '',
        is_active: !item.is_active,
        access_tier: item.access_tier === 'premium' ? 'premium' : 'free',
      });
      await loadAll({ bustPublicMaterialsCache: true });
    } catch (error) {
      showError(error instanceof Error ? error : 'Error');
    }
  }

  async function onCreateSubject(event: React.FormEvent) {
    event.preventDefault();
    try {
      await createAdminSubject(subjectForm);
      setSubjectForm({
        material_topic_group_id: subjectForm.material_topic_group_id || 1,
        name_vi: '',
        name_en: '',
        name_es: '',
        description_vi: '',
        description_en: '',
        description_es: '',
        is_active: true,
        access_tier: subjectForm.access_tier === 'premium' ? 'premium' : 'free',
      });
      setMaterialSubjectCreateDialogOpen(false);
      await loadAll({ bustPublicMaterialsCache: true });
      showSuccess('adminUi.toast_material_topic_added');
    } catch (error) {
      showError(error instanceof Error ? error : 'Error');
    }
  }

  function onStartEditSubject(item: AdminSubject) {
    setEditingSubjectId(item.id);
    setEditSubjectForm({
      material_topic_group_id: Number(item.material_topic_group_id || 1),
      name_vi: item.name_vi || '',
      name_en: item.name_en || '',
      name_es: item.name_es || '',
      description_vi: item.description_vi || '',
      description_en: item.description_en || '',
      description_es: item.description_es || '',
      is_active: item.is_active !== false,
      access_tier: item.access_tier === 'premium' ? 'premium' : 'free',
    });
  }

  function onCancelEditSubject() {
    setEditingSubjectId(null);
    setEditSubjectForm(createInitialSubjectForm());
  }

  async function onSaveEditSubject(item: AdminSubject) {
    try {
      await updateAdminSubject(item.id, {
        ...editSubjectForm,
        is_active: item.is_active !== false,
      });
      await loadAll({ bustPublicMaterialsCache: true });
      onCancelEditSubject();
      showSuccess('adminUi.toast_material_topic_updated');
    } catch (error) {
      showError(error instanceof Error ? error : 'Error');
    }
  }

  async function onDeleteSubject(item: AdminSubject) {
    if (!window.confirm(`Xóa chủ đề ${item.code}?`)) return;
    try {
      await deleteAdminSubject(item.id);
      await loadAll({ bustPublicMaterialsCache: true });
      showSuccess('adminUi.toast_material_topic_deleted');
    } catch (error) {
      showError(error instanceof Error ? error : 'Error');
    }
  }

  async function onToggleMaterialSubjectActive(item: AdminSubject) {
    const active = item.is_active !== false;
    try {
      await updateAdminSubject(item.id, {
        material_topic_group_id: Number(item.material_topic_group_id || 1),
        name_vi: item.name_vi,
        name_en: item.name_en || '',
        name_es: item.name_es,
        description_vi: item.description_vi || '',
        description_en: item.description_en || '',
        description_es: item.description_es || '',
        is_active: !active,
        access_tier: item.access_tier === 'premium' ? 'premium' : 'free',
      });
      await loadAll({ bustPublicMaterialsCache: true });
    } catch (error) {
      showError(error instanceof Error ? error : 'Error');
    }
  }

  async function onDeleteMaterial(item: MaterialPostAdminRow) {
    const materialName = getQuizDisplayTitleHelper(item, lang) || item.id;
    if (
      !window.confirm(
        fillTemplate(tKey(lang, 'adminUi.confirm_delete_material'), { name: materialName })
      )
    ) {
      return;
    }
    try {
      await deleteAdminMaterialPost(item.id);
      await refreshMaterialsList({ bustCache: true });
      await invalidateHomeQueries();
    } catch (error) {
      showError(error instanceof Error ? error : 'Error');
    }
  }

  function updateCurrentQuestionField(field: string, value: string) {
    setQuestionDrafts((prev) => {
      const next = [...prev];
      next[currentQuestionIndex] = { ...next[currentQuestionIndex], [field]: value };
      return next;
    });
  }

  function updateCurrentQuestionImage(file: File | null) {
    setQuestionImageFiles((prev) => {
      const next = [...prev];
      next[currentQuestionIndex] = file;
      return next;
    });
  }

  function onChangeQuestionCount(rawValue: string) {
    const parsed = Number(rawValue);
    const nextCount = Number.isFinite(parsed) ? Math.max(1, Math.min(60, parsed)) : 1;
    setQuestionCount(nextCount);
    setQuestionDrafts((prev) => {
      const next = prev.slice(0, nextCount);
      while (next.length < nextCount) next.push(createEmptyQuestionDraft());
      return next;
    });
    setQuestionImageFiles((prev) => {
      const next = prev.slice(0, nextCount);
      while (next.length < nextCount) next.push(null);
      return next;
    });
    setCurrentQuestionIndex((prev) => Math.min(prev, nextCount - 1));
  }

  async function onCreateQuiz(event: React.FormEvent) {
    event.preventDefault();
    if (creatingQuiz) return;
    const source = questionDrafts.slice(0, questionCount);
    for (let index = 0; index < source.length; index++) {
      const draft = source[index];
      const miss = [
        draft.question_text_vi,
        draft.question_text_es,
        draft.answer_vi_1,
        draft.answer_vi_2,
        draft.answer_vi_3,
        draft.answer_es_1,
        draft.answer_es_2,
        draft.answer_es_3,
      ].some((value) => !String(value || '').trim());
      if (miss) {
        setCurrentQuestionIndex(index);
        showFormError(
          fillTemplate(tKey(lang, 'adminUi.validate_new_quiz_q_incomplete'), { n: index + 1 })
        );
        return;
      }
    }
    setCreatingQuiz(true);
    try {
      const questions: any[] = [];
      for (let index = 0; index < source.length; index++) {
        const draft = source[index];
        const file = questionImageFiles[index];
        let imageUrl: string | null = null;
        if (file) {
          const uploaded = await uploadQuestionImage(file);
          imageUrl = buildStoredMediaPath(uploaded) || null;
        }
        const correctIndex = Number(draft.correct_index);
        const answers = [1, 2, 3].map((answerIndex) => ({
          answer_text_vi: draft[`answer_vi_${answerIndex}` as keyof typeof draft],
          answer_text_en: draft[`answer_en_${answerIndex}` as keyof typeof draft],
          answer_text_es: draft[`answer_es_${answerIndex}` as keyof typeof draft],
          is_correct: answerIndex === correctIndex,
        }));
        questions.push({
          question_text_vi: draft.question_text_vi,
          question_text_en: draft.question_text_en,
          question_text_es: draft.question_text_es,
          explanation_vi: draft.explanation_vi,
          explanation_en: draft.explanation_en,
          explanation_es: draft.explanation_es,
          image_url: imageUrl,
          answers,
        });
      }
      await createManualQuiz(
        {
          ...quizForm,
          category_id: quizForm.category_id ? Number(quizForm.category_id) : null,
          duration_minutes: 0,
          passing_score: 10,
          access_tier: quizForm.access_tier === 'premium' ? 'premium' : 'free',
          questions,
        },
        lang
      );
      setQuizForm(createInitialQuizForm(DEFAULT_QUIZ_TYPE_CODE));
      setQuestionCount(1);
      setCurrentQuestionIndex(0);
      setQuestionDrafts([createEmptyQuestionDraft()]);
      setQuestionImageFiles([null]);
      setQuizCreateModalStep('meta');
      setQuizCreateDialogOpen(false);
      await loadAll();
      showSuccess('adminUi.toast_quiz_created');
    } catch (error) {
      showError(error instanceof Error ? error : 'Error');
    } finally {
      setCreatingQuiz(false);
    }
  }

  function mapEditDetailQuestions(detailQuestions: any[] = []) {
    return detailQuestions.map((question: any) => ({
      id: question.id,
      order_number: question.order_number,
      question_text_vi: question.question_text_vi || '',
      question_text_en: question.question_text_en || '',
      question_text_es: question.question_text_es || '',
      explanation_vi: question.explanation_vi || '',
      explanation_en: question.explanation_en || '',
      explanation_es: question.explanation_es || '',
      image_url: question.image_url || '',
      answers: [...(question.answers || [])]
        .sort((a: any, b: any) => Number(a.order_number) - Number(b.order_number))
        .map((answer: any) => ({
          id: answer.id,
          order_number: answer.order_number,
          answer_text_vi: answer.answer_text_vi || '',
          answer_text_en: answer.answer_text_en || '',
          answer_text_es: answer.answer_text_es || '',
          is_correct: Boolean(answer.is_correct),
        })),
    }));
  }

  function updateEditQuestionField(questionIndex: number, field: string, value: string) {
    setEditQuizQuestions((prev) => {
      const next = [...prev];
      next[questionIndex] = { ...next[questionIndex], [field]: value };
      return next;
    });
  }

  function updateEditAnswerField(
    questionIndex: number,
    answerIndex: number,
    field: string,
    value: string
  ) {
    setEditQuizQuestions((prev) => {
      const next = [...prev];
      const answers = [...(next[questionIndex]?.answers || [])];
      answers[answerIndex] = { ...answers[answerIndex], [field]: value };
      next[questionIndex] = { ...next[questionIndex], answers };
      return next;
    });
  }

  function setEditCorrectAnswer(questionIndex: number, correctAnswerIndex: number) {
    setEditQuizQuestions((prev) => {
      const next = [...prev];
      const answers = [...(next[questionIndex]?.answers || [])].map((answer, index) => ({
        ...answer,
        is_correct: index === correctAnswerIndex,
      }));
      next[questionIndex] = { ...next[questionIndex], answers };
      return next;
    });
  }

  function updateEditQuestionImage(questionIndex: number, file: File | null) {
    setEditQuizQuestionImageFiles((prev) => {
      const next = [...prev];
      next[questionIndex] = file;
      return next;
    });
  }

  function onAddEditQuestion() {
    setEditQuizQuestions((prev) => {
      const next = [...prev, createEmptyEditQuestionDraft()];
      setCurrentEditQuestionIndex(next.length - 1);
      return next;
    });
    setEditQuizQuestionImageFiles((prev) => [...prev, null]);
  }

  async function onStartEditQuiz(item: any) {
    const initialCategoryId = item.category_id ? String(item.category_id) : '';
    const initialCategory = quizCategoriesAdmin.find((c) => String(c.id) === initialCategoryId);
    setEditingQuizId(item.id);
    setEditQuizModalStep('meta');
    setEditQuizForm({
      quiz_topic_group_id: initialCategory?.quiz_topic_group_id
        ? String(initialCategory.quiz_topic_group_id)
        : '',
      category_id: initialCategoryId,
      quiz_type: item.quiz_type || 'general',
      title_vi: item.title_vi || '',
      title_en: item.title_en || '',
      title_es: item.title_es || '',
      description_vi: item.description_vi || '',
      description_en: item.description_en || '',
      description_es: item.description_es || '',
      instructions_vi: item.instructions_vi || '',
      instructions_en: item.instructions_en || '',
      instructions_es: item.instructions_es || '',
      access_tier: item.access_tier === 'premium' ? 'premium' : 'free',
      is_active: Boolean(item.is_active),
    });
    setLoadingEditQuizDetail(true);
    setEditQuizQuestions([]);
    setEditQuizQuestionImageFiles([]);
    setCurrentEditQuestionIndex(0);

    try {
      const detail = await getAdminQuizDetail(item.id);
      setEditQuizForm({
        quiz_topic_group_id: detail.category_id
          ? String(
              quizCategoriesAdmin.find((c) => Number(c.id) === Number(detail.category_id))
                ?.quiz_topic_group_id || ''
            )
          : '',
        category_id: detail.category_id ? String(detail.category_id) : '',
        quiz_type: String(detail.quiz_type || item.quiz_type || 'general'),
        title_vi: detail.title_vi || '',
        title_en: detail.title_en || '',
        title_es: detail.title_es || '',
        description_vi: detail.description_vi || '',
        description_en: detail.description_en || '',
        description_es: detail.description_es || '',
        instructions_vi: detail.instructions_vi || '',
        instructions_en: detail.instructions_en || '',
        instructions_es: detail.instructions_es || '',
        access_tier: detail.access_tier === 'premium' ? 'premium' : 'free',
        is_active: Boolean(detail.is_active),
      });
      const mappedQuestions = mapEditDetailQuestions(detail.questions || []);
      setEditQuizQuestions(mappedQuestions);
      setEditQuizQuestionImageFiles(Array(mappedQuestions.length).fill(null));
      setCurrentEditQuestionIndex(0);
    } catch (error) {
      showError(error instanceof Error ? error : 'Error');
    } finally {
      setLoadingEditQuizDetail(false);
    }
  }

  function onCancelEditQuiz() {
    setEditingQuizId(null);
    setEditQuizModalStep('meta');
    setEditQuizForm(createInitialEditQuizForm(DEFAULT_QUIZ_TYPE_CODE));
    setEditQuizQuestions([]);
    setEditQuizQuestionImageFiles([]);
    setCurrentEditQuestionIndex(0);
    setLoadingEditQuizDetail(false);
    setSavingEditQuizDetail(false);
  }

  async function onSaveEditQuiz(item: any) {
    if (savingEditQuizDetail) return;

    try {
      setSavingEditQuizDetail(true);

      if (!editQuizQuestions.length) {
        await updateAdminQuiz(item.id, {
          ...item,
          quiz_type: editQuizForm.quiz_type,
          title_vi: editQuizForm.title_vi,
          title_en: editQuizForm.title_en,
          title_es: editQuizForm.title_es,
          description_vi: editQuizForm.description_vi,
          description_en: editQuizForm.description_en,
          description_es: editQuizForm.description_es,
          instructions_vi: editQuizForm.instructions_vi,
          instructions_en: editQuizForm.instructions_en,
          instructions_es: editQuizForm.instructions_es,
          passing_score: 10,
          is_active: editQuizForm.is_active,
        });
        await loadAll();
        onCancelEditQuiz();
        showSuccess('adminUi.toast_quiz_updated');
        return;
      }

      for (let questionIndex = 0; questionIndex < editQuizQuestions.length; questionIndex += 1) {
        const question = editQuizQuestions[questionIndex];
        if (!String(question.question_text_vi || '').trim() || !String(question.question_text_es || '').trim()) {
          showFormError(
            fillTemplate(tKey(lang, 'adminUi.validate_edit_q_missing_text'), { n: questionIndex + 1 })
          );
          return;
        }

        const answers = question.answers || [];
        if (answers.length !== 3) {
          showFormError(
            fillTemplate(tKey(lang, 'adminUi.validate_edit_q_three_answers'), { n: questionIndex + 1 })
          );
          return;
        }

        const hasMissingAnswer = answers.some(
          (answer: any) =>
            !String(answer.answer_text_vi || '').trim() || !String(answer.answer_text_es || '').trim()
        );
        if (hasMissingAnswer) {
          showFormError(
            fillTemplate(tKey(lang, 'adminUi.validate_edit_q_missing_answers'), { n: questionIndex + 1 })
          );
          return;
        }

        const correctCount = answers.filter((answer: any) => answer.is_correct).length;
        if (correctCount !== 1) {
          showFormError(
            fillTemplate(tKey(lang, 'adminUi.validate_edit_q_one_correct'), { n: questionIndex + 1 })
          );
          return;
        }
      }

      const preparedQuestions: any[] = [];
      for (let questionIndex = 0; questionIndex < editQuizQuestions.length; questionIndex += 1) {
        const question = editQuizQuestions[questionIndex];
        const imageFile = editQuizQuestionImageFiles[questionIndex] || null;
        let imageUrl = question.image_url || null;

        if (imageFile) {
          const uploaded = await uploadQuestionImage(imageFile);
          imageUrl = buildStoredMediaPath(uploaded) || null;
        }

        const preparedQuestion: any = {
          question_text_vi: question.question_text_vi,
          question_text_en: question.question_text_en,
          question_text_es: question.question_text_es,
          explanation_vi: question.explanation_vi || null,
          explanation_en: question.explanation_en || null,
          explanation_es: question.explanation_es || null,
          image_url: imageUrl || null,
          answers: (question.answers || []).map((answer: any) => {
            const preparedAnswer: any = {
              answer_text_vi: answer.answer_text_vi,
              answer_text_en: answer.answer_text_en,
              answer_text_es: answer.answer_text_es,
              is_correct: Boolean(answer.is_correct),
            };

            if (Number.isInteger(Number(answer.id)) && Number(answer.id) > 0) {
              preparedAnswer.id = Number(answer.id);
            }

            return preparedAnswer;
          }),
        };

        if (Number.isInteger(Number(question.id)) && Number(question.id) > 0) {
          preparedQuestion.id = Number(question.id);
        }

        preparedQuestions.push(preparedQuestion);
      }

      await updateAdminQuizDetail(item.id, {
        category_id: editQuizForm.category_id ? Number(editQuizForm.category_id) : null,
        quiz_type: editQuizForm.quiz_type,
        title_vi: editQuizForm.title_vi,
        title_en: editQuizForm.title_en,
        title_es: editQuizForm.title_es,
        description_vi: editQuizForm.description_vi || null,
        description_en: editQuizForm.description_en || null,
        description_es: editQuizForm.description_es || null,
        instructions_vi: editQuizForm.instructions_vi || null,
        instructions_en: editQuizForm.instructions_en || null,
        instructions_es: editQuizForm.instructions_es || null,
        passing_score: 10,
        is_active: editQuizForm.is_active,
        access_tier: editQuizForm.access_tier === 'premium' ? 'premium' : 'free',
        questions: preparedQuestions,
      });

      await loadAll();
      onCancelEditQuiz();
      showSuccess('adminUi.toast_quiz_updated');
    } catch (error) {
      showError(error instanceof Error ? error : 'Error');
    } finally {
      setSavingEditQuizDetail(false);
    }
  }

  async function onToggleQuiz(item: any) {
    try {
      await updateAdminQuiz(item.id, {
        ...item,
        is_active: !item.is_active,
      });
      await loadAll();
    } catch (error) {
      showError(error instanceof Error ? error : 'Error');
    }
  }

  async function onDeleteQuiz(item: any) {
    if (
      !window.confirm(
        fillTemplate(tKey(lang, 'adminUi.confirm_delete_quiz'), { code: item.code })
      )
    )
      return;
    try {
      await deleteAdminQuiz(item.id);
      await loadAll();
    } catch (error) {
      showError(error instanceof Error ? error : 'Error');
    }
  }

  async function onCreateQuizTopicGroup(event: React.FormEvent) {
    event.preventDefault();
    if (!newQuizTopicGroup.name_vi.trim() || !newQuizTopicGroup.name_es.trim()) {
      showFormError(
        tKey(lang, 'adminUi.enter_names_in_vietnamese_and_spanish_2')
      );
      return;
    }
    try {
      await createAdminQuizTopicGroup({ ...newQuizTopicGroup, is_active: true });
      setNewQuizTopicGroup(createInitialQuizTopicGroupForm());
      setQuizTopicGroupCreateDialogOpen(false);
      await loadAll();
      showSuccess('adminUi.toast_quiz_topic_group_added');
    } catch (error) {
      showError(error instanceof Error ? error : 'Error');
    }
  }

  function onStartEditQuizTopicGroup(item: AdminTopicGroup) {
    setEditingQuizTopicGroupId(item.id);
    setEditQuizTopicGroupForm({
      code: item.code || '',
      name_vi: item.name_vi || '',
      name_en: item.name_en || '',
      name_es: item.name_es || '',
      description_vi: item.description_vi || '',
      description_en: item.description_en || '',
      description_es: item.description_es || '',
      is_active: Boolean(item.is_active),
      allow_random_quiz: Boolean(item.allow_random_quiz),
      access_tier: item.access_tier === 'premium' ? 'premium' : 'free',
    });
  }

  async function onSaveEditQuizTopicGroup(item: AdminTopicGroup) {
    try {
      await updateAdminQuizTopicGroup(item.id, {
        ...editQuizTopicGroupForm,
        code: item.code,
        is_active: editQuizTopicGroupForm.is_active,
      });
      setEditingQuizTopicGroupId(null);
      await loadAll();
      showSuccess('adminUi.toast_quiz_topic_group_updated');
    } catch (error) {
      showError(error instanceof Error ? error : 'Error');
    }
  }

  async function onToggleQuizTopicGroupActive(item: AdminTopicGroup) {
    try {
      await updateAdminQuizTopicGroup(item.id, {
        code: item.code,
        name_vi: item.name_vi,
        name_en: item.name_en || '',
        name_es: item.name_es,
        description_vi: item.description_vi || '',
        description_en: item.description_en || '',
        description_es: item.description_es || '',
        is_active: !item.is_active,
        allow_random_quiz: Boolean(item.allow_random_quiz),
        access_tier: item.access_tier === 'premium' ? 'premium' : 'free',
      });
      await loadAll();
    } catch (error) {
      showError(error instanceof Error ? error : 'Error');
    }
  }

  async function onDeleteQuizTopicGroup(item: AdminTopicGroup) {
    if (
      !window.confirm(
        `${tKey(lang, 'adminUi.delete_parent_group')} ${item.code}?`
      )
    )
      return;
    try {
      await deleteAdminQuizTopicGroup(item.id);
      await loadAll();
      showSuccess('adminUi.toast_quiz_topic_group_deleted');
    } catch (error) {
      showError(error instanceof Error ? error : 'Error');
    }
  }

  async function onCreateQuizType(event: React.FormEvent) {
    event.preventDefault();
    const topicGroupId = Number(newQuizType.quiz_topic_group_id);
    if (!Number.isFinite(topicGroupId) || topicGroupId <= 0) {
      showFormError(
        tKey(lang, 'adminUi.please_select_a_topic_group')
      );
      return;
    }
    if (!newQuizType.name_vi.trim() || !newQuizType.name_es.trim()) {
      showFormError(
        tKey(lang, 'adminUi.enter_names_in_vietnamese_and_spanish')
      );
      return;
    }

    try {
      await createAdminQuizType({
        quiz_topic_group_id: topicGroupId,
        name_vi: newQuizType.name_vi,
        name_en: newQuizType.name_en,
        name_es: newQuizType.name_es,
        description_vi: newQuizType.description_vi,
        description_en: newQuizType.description_en,
        description_es: newQuizType.description_es,
        access_tier: newQuizType.access_tier === 'premium' ? 'premium' : 'free',
        is_active: true,
      });
      setNewQuizType(createInitialQuizTypeForm());
      await loadAll();
      showSuccess('adminUi.toast_quiz_type_created');
    } catch (error) {
      showError(error instanceof Error ? error : 'Error');
    }
  }

  function onStartEditQuizType(item: AdminQuizType) {
    setEditingQuizTypeId(item.id);
    setEditQuizTypeValue({
      quiz_topic_group_id: item.quiz_topic_group_id ? String(item.quiz_topic_group_id) : '',
      name_vi: item.name_vi || '',
      name_en: item.name_en || '',
      name_es: item.name_es || '',
      description_vi: item.description_vi || '',
      description_en: item.description_en || '',
      description_es: item.description_es || '',
      is_active: Boolean(item.is_active),
      access_tier: item.access_tier === 'premium' ? 'premium' : 'free',
    });
  }

  async function onSaveEditQuizType(typeId: number) {
    const topicGroupId = Number(editQuizTypeValue.quiz_topic_group_id);
    if (!Number.isFinite(topicGroupId) || topicGroupId <= 0) {
      showFormError(
        tKey(lang, 'adminUi.please_select_a_topic_group')
      );
      return;
    }
    if (!editQuizTypeValue.name_vi.trim() || !editQuizTypeValue.name_es.trim()) {
      showFormError(
        tKey(lang, 'adminUi.enter_names_in_vietnamese_and_spanish')
      );
      return;
    }

    try {
      await updateAdminQuizType(typeId, {
        quiz_topic_group_id: topicGroupId,
        name_vi: editQuizTypeValue.name_vi,
        name_en: editQuizTypeValue.name_en,
        name_es: editQuizTypeValue.name_es,
        description_vi: editQuizTypeValue.description_vi,
        description_en: editQuizTypeValue.description_en,
        description_es: editQuizTypeValue.description_es,
        access_tier: editQuizTypeValue.access_tier === 'premium' ? 'premium' : 'free',
        is_active: editQuizTypeValue.is_active,
      });
      setEditingQuizTypeId(null);
      setEditQuizTypeValue(createInitialEditQuizTypeForm());
      await loadAll();
      showSuccess('adminUi.toast_quiz_type_updated');
    } catch (error) {
      showError(error instanceof Error ? error : 'Error');
    }
  }

  async function onDeleteQuizType(item: AdminQuizType) {
    if (
      !window.confirm(
        `${tKey(lang, 'adminUi.delete_quiz_type')} ${item.code}?`
      )
    )
      return;
    try {
      await deleteAdminQuizType(item.id);
      await loadAll();
      if (quizForm.quiz_type === item.code) {
        setQuizForm((prev) => ({ ...prev, quiz_type: DEFAULT_QUIZ_TYPE_CODE }));
      }
      if (editQuizForm.quiz_type === item.code) {
        setEditQuizForm((prev) => ({ ...prev, quiz_type: DEFAULT_QUIZ_TYPE_CODE }));
      }
      showSuccess('adminUi.toast_quiz_type_deleted');
    } catch (error) {
      showError(error instanceof Error ? error : 'Error');
    }
  }

  async function onCreateQuizCategory(event: React.FormEvent) {
    event.preventDefault();
    const topicGroupId = Number(newQuizCategory.quiz_topic_group_id);
    if (!Number.isFinite(topicGroupId) || topicGroupId <= 0) {
      showFormError(
        tKey(lang, 'adminUi.please_select_a_topic_group')
      );
      return;
    }
    if (!newQuizCategory.name_vi.trim() || !newQuizCategory.name_es.trim()) {
      showFormError(
        tKey(lang, 'adminUi.enter_names_in_vietnamese_and_spanish')
      );
      return;
    }
    try {
      await createAdminQuizCategory({
        quiz_topic_group_id: topicGroupId,
        name_vi: newQuizCategory.name_vi,
        name_en: newQuizCategory.name_en,
        name_es: newQuizCategory.name_es,
        description_vi: newQuizCategory.description_vi,
        description_en: newQuizCategory.description_en,
        description_es: newQuizCategory.description_es,
        access_tier: newQuizCategory.access_tier === 'premium' ? 'premium' : 'free',
        allow_random_quiz: Boolean(newQuizCategory.allow_random_quiz),
        is_active: true,
      });
      setNewQuizCategory((prev) => ({
        ...createInitialQuizCategoryForm(),
        quiz_topic_group_id: prev.quiz_topic_group_id,
      }));
      setQuizCategoryCreateDialogOpen(false);
      await loadAll();
      showSuccess('adminUi.toast_quiz_topic_created');
    } catch (error) {
      showError(error instanceof Error ? error : 'Error');
    }
  }

  function onStartEditQuizCategory(item: AdminQuizCategory) {
    setEditingQuizCategoryId(item.id);
    setEditQuizCategoryForm({
      quiz_topic_group_id: item.quiz_topic_group_id ? String(item.quiz_topic_group_id) : '',
      name_vi: item.name_vi || '',
      name_en: item.name_en || '',
      name_es: item.name_es || '',
      slug: item.slug || '',
      description_vi: item.description_vi || '',
      description_en: item.description_en || '',
      description_es: item.description_es || '',
      is_active: Boolean(item.is_active),
      access_tier: item.access_tier === 'premium' ? 'premium' : 'free',
      allow_random_quiz: Boolean(item.allow_random_quiz),
    });
  }

  async function onSaveEditQuizCategory(item: AdminQuizCategory) {
    const topicGroupId = Number(editQuizCategoryForm.quiz_topic_group_id);
    if (!Number.isFinite(topicGroupId) || topicGroupId <= 0) {
      showFormError(
        tKey(lang, 'adminUi.please_select_a_topic_group')
      );
      return;
    }
    if (!editQuizCategoryForm.name_vi.trim() || !editQuizCategoryForm.name_es.trim()) {
      showFormError(
        tKey(lang, 'adminUi.enter_names_in_vietnamese_and_spanish')
      );
      return;
    }
    try {
      await updateAdminQuizCategory(item.id, {
        quiz_topic_group_id: topicGroupId,
        name_vi: editQuizCategoryForm.name_vi,
        name_en: editQuizCategoryForm.name_en,
        name_es: editQuizCategoryForm.name_es,
        slug: editQuizCategoryForm.slug || undefined,
        description_vi: editQuizCategoryForm.description_vi,
        description_en: editQuizCategoryForm.description_en,
        description_es: editQuizCategoryForm.description_es,
        access_tier: editQuizCategoryForm.access_tier === 'premium' ? 'premium' : 'free',
        allow_random_quiz: Boolean(editQuizCategoryForm.allow_random_quiz),
        is_active: item.is_active !== false,
      });
      setEditingQuizCategoryId(null);
      await loadAll();
      showSuccess('adminUi.toast_quiz_topic_updated');
    } catch (error) {
      showError(error instanceof Error ? error : 'Error');
    }
  }

  async function onDeleteQuizCategory(item: AdminQuizCategory) {
    const quizCatName = adminTrilingualField(lang, item.name_vi, item.name_es, item.name_en);
    if (
      !window.confirm(
        fillTemplate(tKey(lang, 'adminUi.confirm_delete_quiz_topic'), { name: quizCatName })
      )
    )
      return;
    try {
      await deleteAdminQuizCategory(item.id);
      await loadAll();
      showSuccess('adminUi.toast_quiz_topic_deleted');
    } catch (error) {
      showError(error instanceof Error ? error : 'Error');
    }
  }

  async function onToggleQuizCategoryActive(item: AdminQuizCategory) {
    const topicGroupId = Number(item.quiz_topic_group_id);
    if (!Number.isFinite(topicGroupId) || topicGroupId <= 0) {
      showFormError(
        tKey(lang, 'adminUi.topic_has_no_valid_topic_group')
      );
      return;
    }
    try {
      await updateAdminQuizCategory(item.id, {
        quiz_topic_group_id: topicGroupId,
        name_vi: item.name_vi,
        name_en: item.name_en || '',
        name_es: item.name_es,
        slug: item.slug || undefined,
        description_vi: item.description_vi || '',
        description_en: item.description_en || '',
        description_es: item.description_es || '',
        access_tier: item.access_tier === 'premium' ? 'premium' : 'free',
        allow_random_quiz: Boolean(item.allow_random_quiz),
        is_active: !(item.is_active !== false),
      });
      await loadAll();
    } catch (error) {
      showError(error instanceof Error ? error : 'Error');
    }
  }

  if (!isAdmin) return null;

  const tabButtons = getAdminTabButtons(lang);

  return (
    <AdminContainer
      lang={lang}
      notice={notice}
      tabButtons={tabButtons}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      customCssText={ADMIN_REDESIGN_CSS}
      footer={<Footer />}
    >
              {activeTab === 'users' && (
                <AdminUsersTab
                  lang={lang}
                  tk={tk}
                  users={learnerUsers}
                  filteredUsers={filteredUsers}
                  adminUserQuickStats={adminUserQuickStats}
                  userSearch={userSearch}
                  setUserSearch={setUserSearch}
                  userStatusFilter={userStatusFilter}
                  setUserStatusFilter={setUserStatusFilter}
                  userLearnerTypeFilter={userLearnerTypeFilter}
                  setUserLearnerTypeFilter={setUserLearnerTypeFilter}
                  userCreatedSort={userCreatedSort}
                  setUserCreatedSort={setUserCreatedSort}
                  userCreatedFrom={userCreatedFrom}
                  setUserCreatedFrom={setUserCreatedFrom}
                  userCreatedTo={userCreatedTo}
                  setUserCreatedTo={setUserCreatedTo}
                  paginatedUsers={paginatedUsers}
                  formatUserRole={formatUserRole}
                  formatDateTime={formatDateTime}
                  onViewUserDashboard={onViewUserDashboard}
                  onCloseUserDashboard={onCloseUserDashboard}
                  viewingUserId={viewingUserId}
                  viewingUserLoading={viewingUserLoading}
                  viewingUserError={viewingUserError}
                  viewingUserDashboard={viewingUserDashboard}
                  editingUserId={editingUserId}
                  onStartEditUser={onStartEditUser}
                  onToggleLockUser={onToggleLockUser}
                  onDeleteUser={onDeleteUser}
                  onCancelEditUser={onCancelEditUser}
                  editUserForm={editUserForm}
                  setEditUserForm={setEditUserForm}
                  onSaveEditUser={onSaveEditUser}
                  adminUsersPage={adminUsersPage}
                  setAdminUsersListPage={setAdminUsersListPage}
                />
              )}

              {activeTab === 'materials' && (
                <AdminMaterialsSection
                  {...{
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
                    subjects: materialSubjectsForAdminUi,
                    selectedSubjectId,
                    setSelectedSubjectId,
                    materialListSubjectId,
                    setMaterialListSubjectId,
                    localePath,
                    filteredMaterials,
                    materialListFilterGroupId,
                    setMaterialListFilterGroupId,
                    listSubjectsByGroup,
                    selectedSubject,
                    materialSearch,
                    setMaterialSearch,
                    paginatedMaterials,
                    onDeleteMaterial,
                    adminMaterialsPage,
                    setAdminMaterialsListPage,
                  }}
                />
              )}
              {activeTab === 'quizzes' && (
                <AdminQuizzesSection
                  {...{
                    adminQuizzesPage,
                    createQuizCategories: createQuizCategoriesActive,
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
                    quizTopicGroupSearch,
                    quizTopicGroupsPickActive,
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
                  }}
                />
              )}
              {activeTab === 'premium_requests' && (
                <AdminPremiumRequestsTab
                  lang={lang}
                  tk={tk}
                  formatDateTime={formatDateTime}
                  showError={showError}
                  showSuccess={showSuccess}
                />
              )}
    </AdminContainer>
  );
}
