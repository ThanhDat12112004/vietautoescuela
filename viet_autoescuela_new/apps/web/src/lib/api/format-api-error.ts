import type { Language } from '@/lib/api/types';
import { fillTemplate, tKey, type I18nKey } from '@viet/i18n';

/** Thông điệp cố định từ backend / client → khóa i18n (apiErrors.*). */
const API_ERROR_MESSAGE_TO_KEY: Record<string, I18nKey> = {
  Unauthorized: 'apiErrors.unauthorized',
  Forbidden: 'apiErrors.forbidden',
  'Invalid token': 'apiErrors.invalid_token',
  'Account is not available': 'apiErrors.account_unavailable',
  'Session expired on this device': 'apiErrors.session_expired',
  'Invalid id': 'apiErrors.invalid_id',
  'Not found': 'apiErrors.not_found',
  'Request not found': 'apiErrors.not_found',
  'Bill file not found': 'apiErrors.bill_not_found',
  'Invalid post id': 'apiErrors.invalid_post_id',
  'title_vi and title_es are required': 'apiErrors.titles_vi_es_required',
  'subject_id (or material_type_id) is required': 'apiErrors.subject_id_required',
  'avatar_url is required': 'apiErrors.avatar_required',
  'bill image (field: bill) is required': 'apiErrors.bill_image_required',
  'bill_media_key is required': 'apiErrors.bill_media_key_required',
  'Server misconfiguration': 'apiErrors.server_misconfiguration',
  'Google sign-in is not configured': 'apiErrors.google_oauth_not_configured',
  'Only 30-question random quiz is supported': 'apiErrors.quiz_random_20_only',
  'Free account can use random quiz only once per day': 'apiErrors.forbidden',
  'title_vi, title_es, passing_score are required': 'apiErrors.quiz_meta_required',
  'Invalid attempt id': 'apiErrors.invalid_attempt_id',
  'Invalid user id': 'apiErrors.invalid_user_id',
  'Invalid quiz id': 'apiErrors.invalid_quiz_id',
  'Invalid user id or quiz id': 'apiErrors.invalid_user_quiz_ids',
  'Invalid user id or attempt id': 'apiErrors.invalid_user_attempt_ids',
  'Endpoint not found': 'apiErrors.endpoint_not_found',
  'File too large': 'apiErrors.file_too_large',
  'Internal server error': 'apiErrors.internal_error',
  'Username or email already exists': 'apiErrors.username_or_email_taken',
  'Cannot lock your own account': 'apiErrors.cannot_lock_self',
  'Cannot delete your own account': 'apiErrors.cannot_delete_self',
  'User not found': 'apiErrors.user_not_found',
  'Invalid credentials': 'apiErrors.invalid_credentials',
  'Account is disabled': 'apiErrors.account_disabled',
  'This account uses Google sign-in': 'apiErrors.google_signin_only',
  'Topic group code already exists': 'apiErrors.topic_group_code_exists',
  'Topic group not found': 'apiErrors.topic_group_not_found',
  'Cannot delete topic group because it is being used': 'apiErrors.topic_group_in_use',
  'Type already exists': 'apiErrors.type_exists',
  'Quiz topic group not found': 'apiErrors.quiz_topic_group_missing',
  'Type not found': 'apiErrors.type_not_found',
  'Cannot delete type because it is being used': 'apiErrors.type_in_use',
  'Category slug already exists': 'apiErrors.category_slug_exists',
  'Category not found': 'apiErrors.category_not_found',
  'Cannot delete category because it is being used': 'apiErrors.category_in_use',
  'Quiz not found': 'apiErrors.quiz_not_found',
  'No questions found for selected filters': 'apiErrors.quiz_no_questions',
  'Quiz already exists': 'apiErrors.quiz_exists',
  'Subject not found': 'apiErrors.subject_not_found',
  'Cannot delete subject because it is being used': 'apiErrors.subject_in_use',
  'Post not found': 'apiErrors.post_not_found',
  'plan_code must be 1m or 3m': 'apiErrors.premium_plan_invalid',
  'Only image files are allowed for bill': 'apiErrors.bill_images_only',
  'Question not found': 'apiErrors.question_not_found',
  'Answer not found': 'apiErrors.answer_not_found',
  'Current password is incorrect': 'apiErrors.wrong_current_password',
  'Unable to generate subject code': 'apiErrors.subject_code_failed',
  'Not signed in': 'apiErrors.not_signed_in',
  'Vui long dang nhap': 'apiErrors.login_required_client',
  'Tep khong phai anh hop le': 'apiErrors.invalid_image_file',
  'Anh vuot qua gioi han 20MB': 'apiErrors.image_too_large',
  'Error loading data': 'apiErrors.admin_load_data',
  'Error loading materials': 'apiErrors.admin_load_materials',
  Error: 'apiErrors.generic',
  'no_user': 'apiErrors.oauth_no_user',
  'Username must be at least 3 characters': 'apiErrors.validation_username_min',
  'Username must be at most 50 characters': 'apiErrors.validation_username_max',
  'Username may only contain letters, numbers, dot, underscore and hyphen':
    'apiErrors.validation_username_chars',
  'Invalid email address': 'apiErrors.validation_email_invalid',
  'Passwords do not match': 'apiErrors.validation_passwords_mismatch',
  'Login is required': 'apiErrors.validation_login_required',
  'Password is required': 'apiErrors.validation_password_required',
  'Password must include at least one letter and one number': 'apiErrors.validation_password_policy',
  'Chưa có nhóm chủ đề tương ứng. Hãy tạo nhóm tài liệu (lớp cha) trong Admin trước, rồi chọn đúng nhóm khi tạo chủ đề.':
    'apiErrors.materials_parent_group_create',
  'Nhóm chủ đề không tồn tại hoặc đã bị xóa. Chọn nhóm tài liệu khác hoặc tạo nhóm mới.':
    'apiErrors.materials_parent_group_pick_other',
  'Chưa có nhóm chủ đề tương ứng. Hãy tạo nhóm tài liệu (lớp cha) trong Admin trước, rồi chọn đúng nhóm.':
    'apiErrors.materials_parent_group_update',
};

function stripTrailingHttpStatus(raw: string): { base: string; status: string | null } {
  const m = /^(.*) \((\d+)\)$/.exec(raw);
  if (m) return { base: m[1].trim(), status: m[2] };
  return { base: raw, status: null };
}

/**
 * Chuẩn hóa thông báo lỗi (API / Error) theo ngôn ngữ giao diện.
 */
export function formatUserFacingApiError(lang: Language, err: unknown): string {
  const raw =
    err instanceof Error ? err.message.trim() : typeof err === 'string' ? err.trim() : '';
  if (!raw) return tKey(lang, 'apiErrors.generic');

  const direct = API_ERROR_MESSAGE_TO_KEY[raw];
  if (direct) return tKey(lang, direct);

  const reqFail = /^Request failed \((\d+)\)$/.exec(raw);
  if (reqFail) {
    return fillTemplate(tKey(lang, 'apiErrors.request_failed'), { status: reqFail[1] });
  }

  const presigned = /^Presigned upload failed \((\d+)\)$/.exec(raw);
  if (presigned) {
    return fillTemplate(tKey(lang, 'apiErrors.upload_presigned_failed'), { status: presigned[1] });
  }

  const pdfMb = /^Tệp PDF vượt quá giới hạn (\d+) MB$/.exec(raw);
  if (pdfMb) {
    return fillTemplate(tKey(lang, 'apiErrors.pdf_too_large'), { mb: pdfMb[1] });
  }

  const pwdMin = /^Password must be at least (\d+) characters$/.exec(raw);
  if (pwdMin) {
    return fillTemplate(tKey(lang, 'apiErrors.validation_password_min_n'), { n: pwdMin[1] });
  }

  const pwdMax = /^Password must be at most (\d+) characters$/.exec(raw);
  if (pwdMax) {
    return fillTemplate(tKey(lang, 'apiErrors.validation_password_max_n'), { n: pwdMax[1] });
  }

  const { base, status } = stripTrailingHttpStatus(raw);
  if (status) {
    const k = API_ERROR_MESSAGE_TO_KEY[base];
    if (k) return tKey(lang, k);
    return fillTemplate(tKey(lang, 'apiErrors.http_error_generic'), { status });
  }

  return tKey(lang, 'apiErrors.generic');
}
