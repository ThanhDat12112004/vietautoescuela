import type { I18nKey } from '@viet/i18n';

export const ADMIN_LIST_PAGE_SIZE = 50;

/** Chỉ áp dụng cho học viên (đã loại quản trị): thường vs gói nâng cao còn hạn. */
export const ADMIN_USER_LEARNER_TYPE_FILTER_OPTIONS: ReadonlyArray<{
  id: 'all' | 'standard' | 'premium';
  labelKey: I18nKey;
}> = [
  { id: 'all', labelKey: 'adminUi.learner_type_filter_all' },
  { id: 'standard', labelKey: 'adminUi.learner_type_filter_standard' },
  { id: 'premium', labelKey: 'adminUi.learner_type_filter_premium' },
];

export const ADMIN_USER_STATUS_FILTER_OPTIONS: ReadonlyArray<{
  id: 'all' | 'active' | 'inactive';
  labelKey: I18nKey;
}> = [
  { id: 'all', labelKey: 'adminUi.status_filter_all' },
  { id: 'active', labelKey: 'adminUi.status_filter_active' },
  { id: 'inactive', labelKey: 'adminUi.status_filter_locked' },
];
