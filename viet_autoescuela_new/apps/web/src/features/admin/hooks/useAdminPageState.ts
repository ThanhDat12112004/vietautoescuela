import { useState } from 'react';

export type AdminNoticeState = { text: string; type: 'error' | 'success' };
export type AdminTabKey = 'users' | 'materials' | 'quizzes' | 'premium_requests';
export type AdminMaterialsSubTab = 'topic_groups' | 'subjects' | 'manage';
export type AdminQuizzesSubTab = 'types' | 'manage';
export type AdminQuizzesHierarchyTab = 'topic_groups' | 'types';

export function useAdminPageState() {
  const [notice, setNotice] = useState<AdminNoticeState>({ text: '', type: 'error' });
  const [activeTab, setActiveTab] = useState<AdminTabKey>('users');
  const [materialsSubTab, setMaterialsSubTab] = useState<AdminMaterialsSubTab>('topic_groups');
  const [quizzesSubTab, setQuizzesSubTab] = useState<AdminQuizzesSubTab>('types');
  const [quizzesHierarchyTab, setQuizzesHierarchyTab] =
    useState<AdminQuizzesHierarchyTab>('topic_groups');

  return {
    notice,
    setNotice,
    activeTab,
    setActiveTab,
    materialsSubTab,
    setMaterialsSubTab,
    quizzesSubTab,
    setQuizzesSubTab,
    quizzesHierarchyTab,
    setQuizzesHierarchyTab,
  };
}
