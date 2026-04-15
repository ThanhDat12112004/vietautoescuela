export function createInitialEditUserForm() {
  return {
    username: '',
    email: '',
    full_name: '',
    is_active: true,
    password: '',
    premium_plan: 'none',
    premium_until: '',
  };
}

export function createInitialMaterialTopicGroupForm() {
  return {
    name_vi: '',
    name_en: '',
    name_es: '',
    description_vi: '',
    description_en: '',
    description_es: '',
    access_tier: 'free' as 'free' | 'premium',
  };
}

export function createInitialEditMaterialTopicGroupForm() {
  return {
    code: '',
    name_vi: '',
    name_en: '',
    name_es: '',
    description_vi: '',
    description_en: '',
    description_es: '',
    is_active: true,
    access_tier: 'free' as 'free' | 'premium',
  };
}

export function createInitialSubjectForm() {
  return {
    material_topic_group_id: 1,
    name_vi: '',
    name_en: '',
    name_es: '',
    description_vi: '',
    description_en: '',
    description_es: '',
    is_active: true,
    access_tier: 'free' as 'free' | 'premium',
  };
}

export function createInitialEditMaterialForm() {
  return {
    subject_id: '',
    title_vi: '',
    title_en: '',
    title_es: '',
    excerpt_vi: '',
    excerpt_en: '',
    excerpt_es: '',
    body_html_vi: '',
    body_html_es: '',
    body_html_en: '',
    access_tier: 'free' as 'free' | 'premium',
    is_published: true,
    sort_order: '0',
  };
}

export function createInitialUploadState() {
  return { vi: false, en: false, es: false };
}

export function createInitialPickedFileNameState() {
  return { vi: '', en: '', es: '' };
}

export function createInitialMaterialForm() {
  return {
    title_vi: '',
    title_en: '',
    title_es: '',
    excerpt_vi: '',
    excerpt_en: '',
    excerpt_es: '',
    body_html_vi: '',
    body_html_es: '',
    body_html_en: '',
    access_tier: 'free' as 'free' | 'premium',
    is_published: true,
    sort_order: '0',
  };
}

export function createInitialQuizForm(defaultQuizTypeCode: string) {
  return {
    quiz_topic_group_id: '',
    category_id: '',
    quiz_type: defaultQuizTypeCode,
    title_vi: '',
    title_en: '',
    title_es: '',
    description_vi: '',
    description_en: '',
    description_es: '',
    instructions_vi: '',
    instructions_en: '',
    instructions_es: '',
    access_tier: 'free' as 'free' | 'premium',
  };
}

export function createInitialQuizTopicGroupForm() {
  return {
    name_vi: '',
    name_en: '',
    name_es: '',
    description_vi: '',
    description_en: '',
    description_es: '',
    allow_random_quiz: false,
    access_tier: 'free' as 'free' | 'premium',
  };
}

export function createInitialEditQuizTopicGroupForm() {
  return {
    code: '',
    name_vi: '',
    name_en: '',
    name_es: '',
    description_vi: '',
    description_en: '',
    description_es: '',
    is_active: true,
    allow_random_quiz: false,
    access_tier: 'free' as 'free' | 'premium',
  };
}

export function createInitialQuizTypeForm() {
  return {
    quiz_topic_group_id: '',
    name_vi: '',
    name_en: '',
    name_es: '',
    description_vi: '',
    description_en: '',
    description_es: '',
    access_tier: 'free' as 'free' | 'premium',
  };
}

export function createInitialEditQuizTypeForm() {
  return {
    quiz_topic_group_id: '',
    name_vi: '',
    name_en: '',
    name_es: '',
    description_vi: '',
    description_en: '',
    description_es: '',
    is_active: true,
    access_tier: 'free' as 'free' | 'premium',
  };
}

export function createInitialQuizCategoryForm() {
  return {
    quiz_topic_group_id: '',
    name_vi: '',
    name_en: '',
    name_es: '',
    description_vi: '',
    description_en: '',
    description_es: '',
    access_tier: 'free' as 'free' | 'premium',
    allow_random_quiz: false,
  };
}

export function createInitialEditQuizCategoryForm() {
  return {
    quiz_topic_group_id: '',
    name_vi: '',
    name_en: '',
    name_es: '',
    slug: '',
    description_vi: '',
    description_en: '',
    description_es: '',
    is_active: true,
    access_tier: 'free' as 'free' | 'premium',
    allow_random_quiz: false,
  };
}

export function createInitialEditQuizForm(defaultQuizTypeCode: string) {
  return {
    quiz_topic_group_id: '',
    category_id: '',
    quiz_type: defaultQuizTypeCode,
    title_vi: '',
    title_en: '',
    title_es: '',
    description_vi: '',
    description_en: '',
    description_es: '',
    instructions_vi: '',
    instructions_en: '',
    instructions_es: '',
    is_active: true,
    access_tier: 'free' as 'free' | 'premium',
  };
}
