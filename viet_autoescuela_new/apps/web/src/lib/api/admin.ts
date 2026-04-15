import { getStoredAuth } from '@/lib/auth';
import { apiRequest, withNgrokHeaders } from './client';
import type {
  AdminQuizCategory,
  AdminQuizDetail,
  AdminQuizType,
  AdminSubject,
  AdminTopicGroup,
  AttemptReviewResponse,
  DashboardResponse,
  Language,
  MaterialPostAdminRow,
  QuizAttemptListItem,
} from './types';

export type AdminUserRecord = Record<string, unknown>;
export type AdminQuizRecord = Record<string, unknown>;

export type QuizDetailUpdatePayload = {
  category_id?: number | null;
  quiz_type: string | number;
  title_vi: string;
  title_en?: string;
  title_es: string;
  description_vi?: string | null;
  description_en?: string | null;
  description_es?: string | null;
  instructions_vi?: string | null;
  instructions_en?: string | null;
  instructions_es?: string | null;
  passing_score: number;
  access_tier?: 'free' | 'premium';
  is_active: boolean;
  questions: Array<{
    id: number;
    question_text_vi: string;
    question_text_en?: string;
    question_text_es: string;
    explanation_vi?: string | null;
    explanation_en?: string | null;
    explanation_es?: string | null;
    image_url?: string | null;
    answers: Array<{
      id: number;
      answer_text_vi: string;
      answer_text_en?: string;
      answer_text_es: string;
      is_correct: boolean;
    }>;
  }>;
};

export async function getAdminUserDashboard(userId: number, lang: Language) {
  return apiRequest<DashboardResponse>(`/stats/users/${userId}/dashboard?lang=${lang}`, {
    auth: true,
  });
}

export async function getAdminUserQuizAttempts(userId: number, quizId: number) {
  return apiRequest<QuizAttemptListItem[]>(
    `/stats/users/${userId}/quizzes/${quizId}/attempts`,
    {
      auth: true,
    }
  );
}

export async function getAdminUserAttemptReview(
  userId: number,
  attemptId: number,
  lang: Language
) {
  return apiRequest<AttemptReviewResponse>(
    `/stats/users/${userId}/attempts/${attemptId}/review?lang=${lang}`,
    {
      auth: true,
    }
  );
}

export async function getAdminSubjects() {
  return apiRequest<AdminSubject[]>('/materials-api/admin/subjects', { auth: true });
}

/** Admin list of material posts (HTML) for a subject — includes drafts. */
export async function getAdminMaterialPostsBySubject(subjectId: number, options?: { bustCache?: boolean }) {
  const params = new URLSearchParams();
  if (options?.bustCache) {
    params.set('bust', String(Date.now()));
  }
  const q = params.toString();
  return apiRequest<MaterialPostAdminRow[]>(
    `/materials-api/admin/subjects/${subjectId}/posts${q ? `?${q}` : ''}`,
    {
      auth: true,
      ...(options?.bustCache ? { cache: { skip: true } } : {}),
    }
  );
}

/** @deprecated Use getAdminMaterialPostsBySubject */
export async function getAdminMaterialsBySubject(
  subjectId: number,
  _lang: Language,
  options?: { bustCache?: boolean }
) {
  return getAdminMaterialPostsBySubject(subjectId, options);
}

export async function getAdminMaterialTopicGroups() {
  return apiRequest<AdminTopicGroup[]>('/materials-api/admin/topic-groups', { auth: true });
}

export async function createAdminMaterialTopicGroup(payload: {
  code?: string;
  name_vi: string;
  name_en?: string;
  name_es: string;
  description_vi?: string;
  description_en?: string;
  description_es?: string;
  is_active?: boolean;
  access_tier?: 'free' | 'premium';
}) {
  return apiRequest<{ id: number }>('/materials-api/admin/topic-groups', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export async function updateAdminMaterialTopicGroup(
  id: number,
  payload: {
    code: string;
    name_vi: string;
    name_en?: string;
    name_es: string;
    description_vi?: string;
    description_en?: string;
    description_es?: string;
    is_active?: boolean;
    access_tier?: 'free' | 'premium';
  }
) {
  return apiRequest<{ id: number }>(`/materials-api/admin/topic-groups/${id}`, {
    method: 'PATCH',
    body: payload,
    auth: true,
  });
}

export async function deleteAdminMaterialTopicGroup(id: number) {
  return apiRequest<{ id: number }>(`/materials-api/admin/topic-groups/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}

export async function createAdminSubject(payload: {
  material_topic_group_id?: number;
  name_vi: string;
  name_en?: string;
  name_es: string;
  description_vi?: string;
  description_en?: string;
  description_es?: string;
  access_tier?: 'free' | 'premium';
}) {
  return apiRequest<{ id: number; code: string }>('/materials-api/admin/subjects', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export async function updateAdminSubject(
  id: number,
  payload: {
    material_topic_group_id?: number;
    name_vi: string;
    name_en?: string;
    name_es: string;
    description_vi?: string;
    description_en?: string;
    description_es?: string;
    is_active?: boolean;
    access_tier?: 'free' | 'premium';
  }
) {
  return apiRequest<{ id: number }>(`/materials-api/admin/subjects/${id}`, {
    method: 'PATCH',
    body: payload,
    auth: true,
  });
}

export async function deleteAdminSubject(id: number) {
  return apiRequest<{ id: number }>(`/materials-api/admin/subjects/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}

export async function getAdminUsers() {
  return apiRequest<AdminUserRecord[]>('/auth/admin/users', { auth: true });
}

export async function updateAdminUser(
  id: number,
  payload: {
    username?: string;
    email?: string;
    full_name?: string;
    is_active?: boolean;
    password?: string;
    premium_plan?: 'none' | '1m' | '3m' | string;
    premium_until?: string | null;
  }
) {
  return apiRequest<{ message: string }>(`/auth/admin/users/${id}`, {
    method: 'PATCH',
    body: payload,
    auth: true,
  });
}

export async function lockAdminUser(id: number) {
  return apiRequest<{ message: string }>(`/auth/admin/users/${id}/lock`, {
    method: 'POST',
    auth: true,
  });
}

export async function unlockAdminUser(id: number) {
  return apiRequest<{ message: string }>(`/auth/admin/users/${id}/unlock`, {
    method: 'POST',
    auth: true,
  });
}

export async function deleteAdminUser(id: number) {
  return apiRequest<{ message: string }>(`/auth/admin/users/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}

export async function getAdminQuizzes() {
  return apiRequest<AdminQuizRecord[]>('/api/admin/quizzes', { auth: true });
}

export async function getAdminQuizCategories() {
  return apiRequest<AdminQuizCategory[]>('/api/admin/categories', { auth: true });
}

export async function getAdminQuizTypes() {
  return apiRequest<AdminQuizType[]>('/api/admin/types', { auth: true });
}

export async function getAdminQuizTopicGroups() {
  return apiRequest<AdminTopicGroup[]>('/api/admin/topic-groups', { auth: true });
}

export async function createAdminQuizTopicGroup(payload: {
  code?: string;
  name_vi: string;
  name_en?: string;
  name_es: string;
  description_vi?: string;
  description_en?: string;
  description_es?: string;
  is_active?: boolean;
  allow_random_quiz?: boolean;
  access_tier?: 'free' | 'premium';
}) {
  return apiRequest<{ id: number }>('/api/admin/topic-groups', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export async function updateAdminQuizTopicGroup(
  id: number,
  payload: {
    code: string;
    name_vi: string;
    name_en?: string;
    name_es: string;
    description_vi?: string;
    description_en?: string;
    description_es?: string;
    is_active?: boolean;
    allow_random_quiz?: boolean;
    access_tier?: 'free' | 'premium';
  }
) {
  return apiRequest<{ id: number }>(`/api/admin/topic-groups/${id}`, {
    method: 'PATCH',
    body: payload,
    auth: true,
  });
}

export async function deleteAdminQuizTopicGroup(id: number) {
  return apiRequest<{ id: number }>(`/api/admin/topic-groups/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}

export async function createAdminQuizType(payload: {
  code?: string;
  quiz_topic_group_id?: number;
  name_vi: string;
  name_en?: string;
  name_es: string;
  description_vi?: string;
  description_en?: string;
  description_es?: string;
  is_active?: boolean;
  access_tier?: 'free' | 'premium';
}) {
  return apiRequest<{ id: number; code: string }>('/api/admin/types', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export async function updateAdminQuizType(
  id: number,
  payload: {
    code?: string;
    quiz_topic_group_id?: number;
    name_vi: string;
    name_en?: string;
    name_es: string;
    description_vi?: string;
    description_en?: string;
    description_es?: string;
    is_active?: boolean;
    access_tier?: 'free' | 'premium';
  }
) {
  return apiRequest<{ id: number; code: string }>(`/api/admin/types/${id}`, {
    method: 'PATCH',
    body: payload,
    auth: true,
  });
}

export async function deleteAdminQuizType(id: number) {
  return apiRequest<{ id: number }>(`/api/admin/types/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}

export async function createAdminQuizCategory(payload: {
  quiz_topic_group_id?: number;
  name_vi: string;
  name_en?: string;
  name_es: string;
  slug?: string;
  description_vi?: string;
  description_en?: string;
  description_es?: string;
  is_active?: boolean;
  access_tier?: 'free' | 'premium';
  allow_random_quiz?: boolean;
}) {
  return apiRequest<{ id: number }>('/api/admin/categories', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export async function updateAdminQuizCategory(
  id: number,
  payload: {
    quiz_topic_group_id?: number;
    name_vi: string;
    name_en?: string;
    name_es: string;
    slug?: string;
    description_vi?: string;
    description_en?: string;
    description_es?: string;
    is_active?: boolean;
    access_tier?: 'free' | 'premium';
    allow_random_quiz?: boolean;
  }
) {
  return apiRequest<{ id: number }>(`/api/admin/categories/${id}`, {
    method: 'PATCH',
    body: payload,
    auth: true,
  });
}

export async function deleteAdminQuizCategory(id: number) {
  return apiRequest<{ id: number }>(`/api/admin/categories/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}

export async function createManualQuiz(payload: Record<string, unknown>, _lang: Language) {
  return apiRequest<{ id: number }>('/api/quizzes', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export async function updateAdminQuiz(id: number, payload: Record<string, unknown>) {
  return apiRequest<{ message: string }>(`/api/admin/quizzes/${id}`, {
    method: 'PATCH',
    body: payload,
    auth: true,
  });
}

export async function getAdminQuizDetail(id: number) {
  return apiRequest<AdminQuizDetail>(`/api/admin/quizzes/${id}/detail`, {
    auth: true,
  });
}

export async function updateAdminQuizDetail(id: number, payload: QuizDetailUpdatePayload) {
  return apiRequest<{ id: number }>(`/api/admin/quizzes/${id}/detail`, {
    method: 'PATCH',
    body: payload,
    auth: true,
  });
}

export async function deleteAdminQuiz(id: number) {
  return apiRequest<{ message: string }>(`/api/admin/quizzes/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}

export async function updateAdminMaterialPost(id: number, payload: Record<string, unknown>) {
  return apiRequest<{ id: number }>(`/materials-api/admin/posts/${id}`, {
    method: 'PATCH',
    body: payload,
    auth: true,
  });
}

export async function deleteAdminMaterialPost(id: number) {
  return apiRequest<{ id: number }>(`/materials-api/admin/posts/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}

export async function createAdminMaterialPost(subjectId: number, payload: Record<string, unknown>) {
  return apiRequest<{ id: number }>(`/materials-api/admin/subjects/${subjectId}/posts`, {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

/** @deprecated Use updateAdminMaterialPost */
export async function updateAdminMaterial(id: number, payload: Record<string, unknown>) {
  return updateAdminMaterialPost(id, payload);
}

/** @deprecated Use deleteAdminMaterialPost */
export async function deleteAdminMaterial(id: number) {
  return deleteAdminMaterialPost(id);
}

/** @deprecated Use createAdminMaterialPost */
export async function createBilingualMaterial(subjectId: number, payload: Record<string, unknown>) {
  return createAdminMaterialPost(subjectId, payload);
}

export type AdminPremiumRequestRow = {
  id: number;
  user_id: number;
  plan_code: string;
  payer_note: string | null;
  bill_storage_path: string;
  bill_cdn_url: string | null;
  status: string;
  admin_note: string | null;
  reviewed_at: string | null;
  reviewed_by_id: number | null;
  created_at: string;
  username: string;
  email: string;
  full_name: string | null;
};

export async function getAdminPremiumRequests(params?: {
  status?: 'pending' | 'approved' | 'rejected';
  limit?: number;
  offset?: number;
  username?: string;
  plan_code?: '1m' | '3m';
  date_from?: string;
  date_to?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  if (params?.limit != null) qs.set('limit', String(params.limit));
  if (params?.offset != null) qs.set('offset', String(params.offset));
  const u = String(params?.username || '').trim();
  if (u) qs.set('username', u);
  if (params?.plan_code) qs.set('plan_code', params.plan_code);
  const df = String(params?.date_from || '').trim();
  const dt = String(params?.date_to || '').trim();
  if (df) qs.set('date_from', df);
  if (dt) qs.set('date_to', dt);
  const suffix = qs.toString() ? `?${qs}` : '';
  return apiRequest<{ items: AdminPremiumRequestRow[] }>(`/auth/admin/premium-requests${suffix}`, {
    auth: true,
  });
}

export async function approveAdminPremiumRequest(id: number, admin_note?: string | null) {
  return apiRequest<{ ok: boolean }>(`/auth/admin/premium-requests/${id}/approve`, {
    method: 'POST',
    body: { admin_note: admin_note ?? null },
    auth: true,
  });
}

export async function rejectAdminPremiumRequest(id: number, admin_note?: string | null) {
  return apiRequest<{ ok: boolean }>(`/auth/admin/premium-requests/${id}/reject`, {
    method: 'POST',
    body: { admin_note: admin_note ?? null },
    auth: true,
  });
}

export async function deleteAdminPremiumRequest(id: number) {
  return apiRequest<{ ok: boolean }>(`/auth/admin/premium-requests/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}

/** Ảnh biên lai — chỉ admin, Bearer JWT (không dùng URL /media/static public cho premium-bills). */
export async function fetchAdminPremiumBillBlob(id: number): Promise<Blob> {
  const token = getStoredAuth()?.token;
  if (!token) {
    throw new Error('Not signed in');
  }
  const res = await fetch(`/auth/admin/premium-requests/${id}/bill`, {
    headers: withNgrokHeaders({ Authorization: `Bearer ${token}` }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.blob();
}

export type {
  AdminQuizCategory,
  AdminQuizDetail,
  AdminQuizType,
  AdminSubject,
  AdminTopicGroup,
  DashboardResponse,
};
