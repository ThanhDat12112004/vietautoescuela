import { tKey } from '@viet/i18n';
import type { Language } from '@/lib/api/types';

export type AdminTabId = 'users' | 'materials' | 'quizzes' | 'premium_requests';
export type AdminTabIconKey = 'users' | 'materials' | 'quizzes' | 'premium_requests';

export function getAdminTabButtons(lang: Language) {
  return [
    {
      id: 'users' as const,
      label: tKey(lang, 'adminUi.admin_tab_users_label'),
      desc: tKey(lang, 'adminUi.admin_tab_users_desc'),
      iconKey: 'users' as const,
    },
    {
      id: 'materials' as const,
      label: tKey(lang, 'adminUi.admin_tab_materials_label'),
      desc: tKey(lang, 'adminUi.admin_tab_materials_desc'),
      iconKey: 'materials' as const,
    },
    {
      id: 'quizzes' as const,
      label: tKey(lang, 'adminUi.admin_tab_quizzes_label'),
      desc: tKey(lang, 'adminUi.admin_tab_quizzes_desc'),
      iconKey: 'quizzes' as const,
    },
    {
      id: 'premium_requests' as const,
      label: tKey(lang, 'adminUi.admin_tab_premium_label'),
      desc: tKey(lang, 'adminUi.admin_tab_premium_desc'),
      iconKey: 'premium_requests' as const,
    },
  ];
}
