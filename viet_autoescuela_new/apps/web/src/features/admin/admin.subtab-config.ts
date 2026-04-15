import { tKey } from '@viet/i18n';
import type { Language } from '@/lib/api/types';

export function getMaterialsSubtabs(lang: Language) {
  return [
    {
      id: 'topic_groups' as const,
      label: tKey(lang, 'adminUi.materials_subtab_topic_group_label'),
    },
    {
      id: 'subjects' as const,
      label: tKey(lang, 'adminUi.materials_subtab_subject_label'),
    },
    {
      id: 'manage' as const,
      label: tKey(lang, 'adminUi.materials_subtab_manage_label'),
    },
  ];
}

export function resolveMaterialsSubtabState(tabId: 'topic_groups' | 'subjects' | 'manage') {
  return tabId;
}

export function getQuizzesSubtabs(lang: Language) {
  return [
    {
      id: 'topic_groups' as const,
      label: tKey(lang, 'adminUi.quizzes_subtab_topic_group_label'),
    },
    {
      id: 'types' as const,
      label: tKey(lang, 'adminUi.quizzes_subtab_types_label'),
    },
    {
      id: 'manage' as const,
      label: tKey(lang, 'adminUi.quizzes_subtab_manage_label'),
    },
  ];
}

export function isQuizzesSubtabActive(
  tabId: 'topic_groups' | 'types' | 'manage',
  quizzesSubTab: 'types' | 'manage',
  quizzesHierarchyTab: 'topic_groups' | 'types'
) {
  if (tabId === 'topic_groups') {
    return quizzesSubTab === 'types' && quizzesHierarchyTab === 'topic_groups';
  }
  if (tabId === 'types') {
    return quizzesSubTab === 'types' && quizzesHierarchyTab === 'types';
  }
  return quizzesSubTab === 'manage';
}

export function resolveQuizzesSubtabState(tabId: 'topic_groups' | 'types' | 'manage') {
  if (tabId === 'topic_groups' || tabId === 'types') {
    return {
      quizzesSubTab: 'types' as const,
      quizzesHierarchyTab: tabId,
    };
  }
  return {
    quizzesSubTab: 'manage' as const,
    quizzesHierarchyTab: null,
  };
}
