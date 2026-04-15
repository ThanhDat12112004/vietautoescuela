import { useCallback } from 'react';
import { pushTimedNotice, showErrorNotice } from '@/features/admin/admin.notice.helpers';
import type { AdminNoticeState } from '@/features/admin/hooks/useAdminPageState';
import { formatUserFacingApiError } from '@/lib/api/format-api-error';
import type { Language } from '@/lib/api/types';
import type { Dispatch, SetStateAction } from 'react';
import { tKey, type I18nKey } from '@viet/i18n';

type SetNotice = Dispatch<SetStateAction<AdminNoticeState>>;

export function useAdminActions(lang: Language, setNotice: SetNotice) {
  const showError = useCallback(
    (message: string | unknown) => {
      showErrorNotice(setNotice, formatUserFacingApiError(lang, message));
    },
    [lang, setNotice]
  );

  const showSuccess = useCallback(
    (key: I18nKey) => {
      pushTimedNotice(setNotice, { text: tKey(lang, key), type: 'success' });
    },
    [lang, setNotice]
  );

  /** Thông báo đã dịch sẵn (validation form, v.v.) — không map qua apiErrors. */
  const showFormError = useCallback(
    (message: string) => {
      showErrorNotice(setNotice, message);
    },
    [setNotice]
  );

  return { showError, showFormError, showSuccess };
}
