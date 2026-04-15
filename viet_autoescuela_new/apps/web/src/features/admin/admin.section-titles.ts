import { tKey } from '@viet/i18n';
import type { Language } from '@/lib/api/types';

export function getMaterialsHierarchyTitle(
  lang: Language,
  materialsSubTab: 'topic_groups' | 'subjects' | 'manage'
) {
  if (materialsSubTab === 'topic_groups') {
    return tKey(lang, 'adminUi.materials_hierarchy_topic_groups_title');
  }
  if (materialsSubTab === 'subjects') {
    return tKey(lang, 'adminUi.materials_hierarchy_subjects_title');
  }
  return '';
}

export function getQuizzesHierarchyTitle(
  lang: Language,
  quizzesHierarchyTab: 'topic_groups' | 'types'
) {
  if (quizzesHierarchyTab === 'topic_groups') {
    return tKey(lang, 'adminUi.quizzes_hierarchy_topic_groups_title');
  }
  return tKey(lang, 'adminUi.quizzes_hierarchy_types_title');
}
