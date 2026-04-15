import type { AdminNoticeState } from '@/features/admin/hooks/useAdminPageState';
import type { Dispatch, SetStateAction } from 'react';

type NoticeType = 'error' | 'success';

type SetNotice = Dispatch<SetStateAction<AdminNoticeState>>;

export function pushTimedNotice(
  setNotice: SetNotice,
  payload: { text: string; type: NoticeType },
  timeoutMs = 5000
) {
  setNotice(payload);
  window.setTimeout(() => setNotice({ text: '', type: 'error' }), timeoutMs);
}

export function showErrorNotice(setNotice: SetNotice, message: string) {
  pushTimedNotice(setNotice, { text: message, type: 'error' });
}
