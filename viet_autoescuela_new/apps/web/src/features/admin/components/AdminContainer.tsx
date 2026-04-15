import type { ReactNode } from 'react';
import { Navbar } from '@/components/layout';
import type { AdminNoticeState, AdminTabKey } from '@/features/admin/hooks/useAdminPageState';
import {
  AdminNoticeBanner,
  AdminPageHeader,
  AdminSidebarTabs,
} from '@/features/admin/admin.layout-components';
import { BookOpen, FileText, Medal, Users, CheckCircle2, XCircle } from 'lucide-react';

type Lang = 'vi' | 'es' | 'en';
type TabButtons = Array<{
  id: AdminTabKey;
  label: string;
  desc: string;
  iconKey: AdminTabKey;
}>;

type AdminContainerProps = {
  lang: Lang;
  notice: AdminNoticeState;
  tabButtons: TabButtons;
  activeTab: AdminTabKey;
  onTabChange: (tab: AdminTabKey) => void;
  children: ReactNode;
  customCssText: string;
  footer?: ReactNode;
};

export function AdminContainer({
  lang,
  notice,
  tabButtons,
  activeTab,
  onTabChange,
  children,
  customCssText,
  footer = null,
}: AdminContainerProps) {
  const tabIconMap = {
    users: Users,
    materials: BookOpen,
    quizzes: FileText,
    premium_requests: Medal,
  } as const;

  return (
    <div className="app-page admin-redesign min-h-screen flex flex-col bg-[radial-gradient(circle_at_12%_10%,rgba(122,32,56,0.10),transparent_36%),radial-gradient(circle_at_88%_0%,rgba(244,114,182,0.08),transparent_34%),linear-gradient(180deg,#fdf9fa_0%,#f8f1f4_46%,#f4edf1_100%)]">
      <style>{customCssText}</style>
      <Navbar />
      <main className="flex-1 px-0 py-0">
        <div className="w-full min-h-full p-0">
          <AdminNoticeBanner notice={notice} SuccessIcon={CheckCircle2} ErrorIcon={XCircle} />
          <div className="overflow-hidden border border-[#e3d7dc] bg-white shadow-sm">
            <AdminPageHeader lang={lang} embedded />
            <div className="flex flex-col divide-y divide-[#e3d7dc] sm:flex-row sm:divide-y-0 sm:divide-x">
              <AdminSidebarTabs
                lang={lang}
                tabButtons={tabButtons}
                tabIconMap={tabIconMap}
                activeTab={activeTab}
                onTabChange={onTabChange}
              />
              <div className="min-h-0 min-w-0 flex-1 overflow-auto bg-white">{children}</div>
            </div>
          </div>
        </div>
      </main>
      {footer}
    </div>
  );
}
