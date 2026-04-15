import { adminHiddenLabelSuffix } from '@/features/admin/admin.lang';
import type { AdminSubject, Language, Subject } from '@/lib/api/types';

type AnyRecord = Record<string, any>;

/** Gói Premium còn hạn (theo `premium_plan` + `premium_until` từ API admin users). */
export function isAdminUserPremiumActive(item: AnyRecord): boolean {
  const plan = String(item.premium_plan ?? 'none');
  const untilRaw = item.premium_until;
  const untilMs = untilRaw != null && String(untilRaw).trim() !== '' ? new Date(String(untilRaw)).getTime() : NaN;
  return plan !== 'none' && Number.isFinite(untilMs) && untilMs > Date.now();
}

/** Danh sách quản lý tài khoản chỉ dành cho học viên (ẩn quản trị viên). */
export function isAdminUsersListLearner(item: AnyRecord): boolean {
  return String(item.role || '').toLowerCase() === 'student';
}

/** Map API admin → dạng Subject (theo lang) cho dropdown Tài liệu trong Admin — luôn khớp `adminSubjects`, không phụ thuộc cache public. */
export function mapAdminSubjectsToSubjectShape(
  adminSubjects: AdminSubject[],
  lang: Language
): Subject[] {
  return adminSubjects.map((s) => ({
    id: s.id,
    code: s.code,
    material_topic_group_id: s.material_topic_group_id,
    material_topic_group_code: s.material_topic_group_code ?? null,
    material_topic_group_name:
      lang === 'vi'
        ? s.material_topic_group_name_vi
        : lang === 'en'
          ? s.material_topic_group_name_en ?? s.material_topic_group_name_es
          : s.material_topic_group_name_es,
    material_topic_group_description:
      lang === 'vi'
        ? s.material_topic_group_description_vi
        : lang === 'en'
          ? s.material_topic_group_description_en ?? s.material_topic_group_description_es
          : s.material_topic_group_description_es,
    name: (() => {
      const base =
        lang === 'vi' ? s.name_vi : lang === 'en' ? s.name_en ?? s.name_es : s.name_es;
      const label = String(base ?? '');
      return s.is_active === false ? `${label}${adminHiddenLabelSuffix(lang)}` : label;
    })(),
    is_active: s.is_active,
    description:
      lang === 'vi'
        ? s.description_vi
        : lang === 'en'
          ? s.description_en ?? s.description_es
          : s.description_es,
    created_at: s.created_at,
  }));
}

function toSearchText(values: unknown[]) {
  return values
    .map((value) => String(value || ''))
    .join(' ')
    .toLowerCase();
}

export function filterByGroupId<T extends AnyRecord>(
  items: T[],
  groupId: string,
  key: keyof T
) {
  if (groupId === 'all') return items;
  const gid = Number(groupId);
  if (!Number.isFinite(gid) || gid <= 0) return items;
  return items.filter((item) => Number(item[key]) === gid);
}

export function searchByKeyword<T>(items: T[], keyword: string, toFields: (item: T) => unknown[]) {
  const k = keyword.trim().toLowerCase();
  if (!k) return items;
  return items.filter((item) => toSearchText(toFields(item)).includes(k));
}

export function mapTopicGroupsForLanguage(
  groups: Array<{
    id: number;
    name_vi?: string;
    name_es?: string;
    name_en?: string;
    is_active?: boolean;
  }>,
  lang: Language,
  options?: { markInactive?: boolean }
) {
  const markInactive = options?.markInactive ?? true;
  return groups
    .map((g) => {
      const base =
        (lang === 'vi' ? g.name_vi : lang === 'en' ? g.name_en || g.name_es : g.name_es) ||
        `Group #${g.id}`;
      const name =
        markInactive && g.is_active === false ? `${base}${adminHiddenLabelSuffix(lang)}` : base;
      return { id: g.id, name };
    })
    .sort((a, b) => a.id - b.id);
}

export function computeUserQuickStats(
  users: Array<{
    is_active?: boolean;
    created_at?: unknown;
    premium_plan?: unknown;
    premium_until?: unknown;
  }>,
  parseDateSafe: (value: unknown) => Date | null
) {
  const total = users.length;
  const active = users.filter((u) => u.is_active).length;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const newToday = users.filter((u) => {
    const ca = parseDateSafe(u.created_at);
    return ca != null && ca >= start && ca <= end;
  }).length;
  const premiumActive = users.filter((u) => isAdminUserPremiumActive(u)).length;
  return { total, active, inactive: total - active, newToday, premiumActive };
}

export function paginateItems<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function clampPage(page: number, totalItems: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  return { totalPages, safePage };
}

export function filterAdminQuizzes(params: {
  adminQuizzes: AnyRecord[];
  selectedQuizTypeFilter: string;
  quizListFilterGroupId: string;
  quizListFilterCategoryId: string;
  quizCategoriesAdmin: AnyRecord[];
  quizSearch: string;
  getQuizTypeFilterKey: (item: AnyRecord) => string;
  getQuizTypeDisplayName: (item: AnyRecord) => string;
}) {
  const {
    adminQuizzes,
    selectedQuizTypeFilter,
    quizListFilterGroupId,
    quizListFilterCategoryId,
    quizCategoriesAdmin,
    quizSearch,
    getQuizTypeFilterKey,
    getQuizTypeDisplayName,
  } = params;

  const byType =
    selectedQuizTypeFilter === 'all'
      ? adminQuizzes
      : adminQuizzes.filter((quizItem) => getQuizTypeFilterKey(quizItem) === selectedQuizTypeFilter);

  /** Giống tài liệu: loại chủ đề thu hẹp “phạm vi” chủ đề; “Tất cả chủ đề” = mọi bài thuộc các chủ đề trong loại đó. */
  let scoped = byType;
  if (quizListFilterCategoryId !== 'all') {
    scoped = byType.filter((item) => Number(item.category_id) === Number(quizListFilterCategoryId));
  } else if (quizListFilterGroupId !== 'all') {
    const gid = Number(quizListFilterGroupId);
    const categoryIdsInGroup = new Set(
      quizCategoriesAdmin
        .filter((c) => Number(c.quiz_topic_group_id) === gid)
        .map((c) => Number(c.id))
    );
    scoped = byType.filter((item) => categoryIdsInGroup.has(Number(item.category_id)));
  }

  return searchByKeyword(scoped, quizSearch, (item) => [
    item.id,
    item.title_vi,
    item.title_es,
    item.title_en,
    getQuizTypeDisplayName(item),
  ]);
}

export function filterAndSortUsers(params: {
  users: AnyRecord[];
  userSearch: string;
  userCreatedFrom: string;
  userCreatedTo: string;
  userCreatedSort: 'asc' | 'desc';
  userStatusFilter: 'all' | 'active' | 'inactive';
  /** Học viên thường (không Premium còn hạn) vs học viên nâng cao (Premium còn hạn). */
  userLearnerTypeFilter: 'all' | 'standard' | 'premium';
  parseDateSafe: (value: unknown) => Date | null;
}) {
  const {
    users,
    userSearch,
    userCreatedFrom,
    userCreatedTo,
    userCreatedSort,
    userStatusFilter,
    userLearnerTypeFilter,
    parseDateSafe,
  } = params;

  const keyword = userSearch.trim().toLowerCase();
  const fromDate = userCreatedFrom ? new Date(`${userCreatedFrom}T00:00:00`) : null;
  const toDate = userCreatedTo ? new Date(`${userCreatedTo}T23:59:59`) : null;

  const filtered = users.filter((item) => {
    if (userStatusFilter === 'active' && !item.is_active) return false;
    if (userStatusFilter === 'inactive' && item.is_active) return false;

    const vipActive = isAdminUserPremiumActive(item);
    if (userLearnerTypeFilter === 'standard' && vipActive) return false;
    if (userLearnerTypeFilter === 'premium' && !vipActive) return false;

    const matchesKeyword = keyword
      ? [item.username, item.email, item.full_name, item.role]
          .map((value) => String(value || ''))
          .join(' ')
          .toLowerCase()
          .includes(keyword)
      : true;
    if (!matchesKeyword) return false;

    const createdAt = parseDateSafe(item.created_at);
    if (!createdAt) return true;
    if (fromDate && createdAt < fromDate) return false;
    if (toDate && createdAt > toDate) return false;
    return true;
  });

  return filtered.sort((a, b) => {
    const aTime = parseDateSafe(a.created_at)?.getTime() ?? 0;
    const bTime = parseDateSafe(b.created_at)?.getTime() ?? 0;
    return userCreatedSort === 'desc' ? bTime - aTime : aTime - bTime;
  });
}
