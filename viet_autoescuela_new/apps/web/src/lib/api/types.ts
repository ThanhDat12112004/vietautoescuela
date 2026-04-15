import type { AuthUser } from '@/lib/auth';

export type Language = 'vi' | 'es' | 'en';

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export type QuizListItem = {
  id: number;
  code: string;
  quiz_type?: string | null;
  quiz_topic_group_name?: string | null;
  quiz_topic_group_description?: string | null;
  /** Mô tả chủ đề con (quiz category) theo ngôn ngữ. */
  category_description?: string | null;
  /** Backend: topic group allows “random quiz” pool for this row. */
  quiz_topic_group_allow_random?: boolean | number | null;
  /** Backend: quiz category (topic) opted into random pool; both group + category must allow. */
  category_allow_random?: boolean | number | null;
  /** Backend: `free` | `premium` — random pool only uses premium groups. */
  quiz_topic_group_access_tier?: string | null;
  /** Backend: `free` | `premium` — tier của chủ đề (category), không gồm chỉ-đề premium. */
  category_access_tier?: string | null;
  /** Backend: tier trực tiếp của quiz row. */
  access_tier?: 'free' | 'premium' | string | null;
  requires_premium?: boolean | number | null;
  duration_minutes: number;
  total_questions: number;
  passing_score: number;
  title: string;
  description: string | null;
  category_name: string | null;
  has_completed?: boolean;
  best_percentage?: number | null;
  best_score?: number | null;
};

export type QuizAnswer = {
  id: number;
  order_number: number;
  answer_text: string;
  is_correct?: boolean;
  answer_text_vi?: string | null;
  answer_text_es?: string | null;
  answer_text_en?: string | null;
};

export type QuizQuestion = {
  id: number;
  order_number: number;
  points: number;
  image_url: string | null;
  question_text: string;
  explanation: string | null;
  answers: QuizAnswer[];
  question_text_vi?: string | null;
  question_text_es?: string | null;
  question_text_en?: string | null;
  explanation_vi?: string | null;
  explanation_es?: string | null;
  explanation_en?: string | null;
};

export type QuizDetail = {
  id: number;
  code: string;
  duration_minutes: number;
  total_questions: number;
  passing_score: number;
  title: string;
  description: string | null;
  instructions: string | null;
  questions: QuizQuestion[];
  /** Server: đề premium, user chưa mua — chỉ metadata, không có câu hỏi. */
  content_locked?: boolean;
  requires_premium?: boolean;
};

export type CheckQuestionResult = {
  attempt_id: number;
  question_id: number;
  selected_answer_id: number;
  correct_answer_id: number | null;
  is_correct: boolean;
  points_earned: number;
};

export type SubmitAttemptResult = {
  attempt_id: number;
  score: number;
  total_points: number;
  correct_count: number;
  total_questions: number;
  percentage: number;
  /** Giây làm bài (server: started_at → completed_at). */
  duration_seconds?: number;
  details: CheckQuestionResult[];
};

export type LeaderboardUser = {
  id: number;
  rank?: number;
  username: string;
  full_name: string;
  avatar_url: string | null;
  total_score: number;
  total_quizzes: number;
  total_correct: number;
  total_questions: number;
  average_percentage: number;
};

export type LeaderboardPeriod = 'all' | 'week' | 'month';

export type MyLeaderboardRank = {
  rank: number;
  total_score: number;
  total_quizzes: number;
  average_percentage: number;
};

export type HomeSummary = {
  total_questions: number;
  /** Tổng đề trắc nghiệm đang hiển thị công khai (khớp danh sách /api/quizzes). */
  total_quizzes?: number;
  total_students: number;
  pass_rate: number;
  total_attempts: number;
};

export type QuizCategory = {
  id: number;
  slug: string | null;
  name: string;
  description: string | null;
};

/** Tóm tắt theo từng đề: điểm cao nhất + số lần đã làm. */
export type QuizHistorySummary = {
  quiz_id: number;
  quiz_title: string;
  best_attempt_id: number;
  best_score: number;
  best_percentage: number;
  best_correct_count: number;
  best_total_questions: number;
  best_completed_at: string | null;
  best_duration_seconds: number | null;
  attempt_count: number;
};

export type QuizAttemptListItem = {
  id: number;
  score: number;
  percentage: number;
  correct_count: number;
  total_questions: number;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
};

export type AttemptReviewAnswer = {
  id: number;
  answer_text: string;
  is_correct: boolean;
};

export type AttemptReviewQuestion = {
  id: number;
  order_number: number;
  question_text: string;
  image_url: string | null;
  explanation: string | null;
  selected_answer_id: number | null;
  is_correct: boolean | null;
  answers: AttemptReviewAnswer[];
};

export type AttemptReviewResponse = {
  attempt: {
    id: number;
    quiz_id: number;
    quiz_title: string;
    score: number;
    percentage: number;
    correct_count: number;
    total_questions: number;
    started_at: string;
    completed_at: string | null;
    duration_seconds: number | null;
  };
  questions: AttemptReviewQuestion[];
};

export type DashboardResponse = {
  stats: LeaderboardUser;
  /** Một dòng mỗi quiz — điểm tốt nhất (mở rộng xem mọi lần làm). */
  quiz_summaries?: QuizHistorySummary[];
  history: Array<{
    id: number;
    quiz_id: number;
    quiz_code: string;
    quiz_title: string;
    score: number;
    percentage: number;
    correct_count: number;
    total_questions: number;
    status: string;
    started_at: string;
    completed_at: string | null;
    duration_seconds: number | null;
  }>;
};

/** Per-subject file count from public `GET /materials/subjects/material-counts`. */
export type MaterialSubjectCountRow = {
  subject_id: number;
  total: number;
};

export type Subject = {
  id: number;
  code: string;
  material_topic_group_id?: number;
  material_topic_group_code?: string | null;
  material_topic_group_name?: string | null;
  material_topic_group_description?: string | null;
  /** Backend: `free` | `premium` — tier nhóm chủ đề (không suy từ chủ đề con premium). */
  material_topic_group_access_tier?: string | null;
  name: string;
  requires_premium?: boolean | number | null;
  /** Set when mapped from admin API; used in admin UI only. */
  is_active?: boolean;
  description: string | null;
  created_at: string;
};

export type AdminSubject = {
  id: number;
  code: string;
  material_topic_group_id?: number;
  material_topic_group_code?: string | null;
  material_topic_group_name_vi?: string | null;
  material_topic_group_name_es?: string | null;
  material_topic_group_name_en?: string | null;
  material_topic_group_description_vi?: string | null;
  material_topic_group_description_es?: string | null;
  material_topic_group_description_en?: string | null;
  name_vi: string;
  name_es: string;
  name_en?: string;
  description_vi: string | null;
  description_es: string | null;
  description_en?: string | null;
  access_tier?: 'free' | 'premium' | string | null;
  is_active?: boolean;
  created_at: string;
};

export type AdminQuizCategory = {
  id: number;
  quiz_topic_group_id?: number;
  quiz_topic_group_code?: string | null;
  quiz_topic_group_name_vi?: string | null;
  quiz_topic_group_name_es?: string | null;
  quiz_topic_group_name_en?: string | null;
  name_vi: string;
  name_es: string;
  name_en?: string;
  slug: string | null;
  description_vi: string | null;
  description_es: string | null;
  description_en?: string | null;
  access_tier?: 'free' | 'premium' | string | null;
  allow_random_quiz?: boolean | number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminTopicGroup = {
  id: number;
  code: string;
  name_vi: string;
  name_es: string;
  name_en?: string;
  description_vi: string | null;
  description_es: string | null;
  description_en?: string | null;
  allow_random_quiz?: boolean | number | null;
  access_tier?: 'free' | 'premium' | string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type QuizType = {
  id: number;
  code: string;
  name: string;
  description: string | null;
};

export type AdminQuizType = {
  id: number;
  code: string;
  quiz_topic_group_id?: number;
  quiz_topic_group_code?: string | null;
  quiz_topic_group_name_vi?: string | null;
  quiz_topic_group_name_es?: string | null;
  quiz_topic_group_name_en?: string | null;
  name_vi: string;
  name_es: string;
  name_en?: string;
  description_vi: string | null;
  description_es: string | null;
  description_en?: string | null;
  access_tier?: 'free' | 'premium' | string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminQuizDetailAnswer = {
  id: number;
  question_id: number;
  order_number: number;
  is_correct: boolean;
  answer_text_vi: string;
  answer_text_es: string;
  answer_text_en?: string;
};

export type AdminQuizDetailQuestion = {
  id: number;
  order_number: number;
  points: number;
  question_text_vi: string;
  question_text_es: string;
  question_text_en?: string;
  explanation_vi: string | null;
  explanation_es: string | null;
  explanation_en?: string | null;
  image_url: string | null;
  answers: AdminQuizDetailAnswer[];
};

export type AdminQuizDetail = {
  id: number;
  category_id: number | null;
  quiz_type: string;
  access_tier?: 'free' | 'premium' | string | null;
  title_vi: string;
  title_es: string;
  title_en?: string;
  description_vi: string | null;
  description_es: string | null;
  description_en?: string | null;
  instructions_vi: string | null;
  instructions_es: string | null;
  instructions_en?: string | null;
  duration_minutes: number;
  total_questions: number;
  passing_score: number;
  is_active: boolean;
  created_at: string;
  questions: AdminQuizDetailQuestion[];
};

/** Published material post in list (no HTML body). */
export type MaterialPostListItem = {
  id: number;
  subject_id: number;
  title: string;
  description: string | null;
  /** Chủ đề thuộc nhóm premium (theo server). */
  subject_requires_premium?: boolean;
  /** User hiện tại chỉ xem được preview (không có body). */
  content_locked?: boolean;
  requires_premium?: boolean | number | null;
  title_vi: string;
  title_es: string;
  title_en?: string;
  excerpt_vi?: string | null;
  excerpt_es?: string | null;
  excerpt_en?: string | null;
  access_tier?: 'free' | 'premium' | string | null;
  uploaded_at: string;
};

export type MaterialPostDetail = {
  id: number;
  subject_id: number;
  title: string;
  excerpt: string | null;
  body_html: string;
  requires_premium: boolean;
  subject_requires_premium?: boolean;
  /** true: body_html rỗng, chỉ hiển thị tiêu đề/mô tả + CTA gói nâng cao. */
  content_locked?: boolean;
  updated_at: string;
  /** Tên loại chủ đề (theo ngôn ngữ giao diện). */
  topic_group_name?: string | null;
  /** Tên chủ đề / mục tài liệu (theo ngôn ngữ giao diện). */
  subject_name?: string | null;
};

/** Admin row: full i18n + HTML bodies. */
export type MaterialPostAdminRow = {
  id: number;
  subject_id: number;
  title_vi: string;
  title_es: string;
  title_en?: string;
  excerpt_vi: string | null;
  excerpt_es: string | null;
  excerpt_en: string | null;
  body_html_vi: string;
  body_html_es: string;
  body_html_en: string;
  access_tier?: string | null;
  is_published: boolean;
  sort_order: number;
  uploaded_at: string;
  created_at?: string;
};

/** @deprecated Use MaterialPostListItem — kept alias for gradual migration */
export type MaterialItem = MaterialPostListItem;

export type UploadedFileMeta = {
  key: string;
  cdn_url: string;
  size: number;
  page_count?: number;
};
