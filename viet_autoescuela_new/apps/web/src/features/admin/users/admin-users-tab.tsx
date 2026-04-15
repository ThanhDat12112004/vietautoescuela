import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProfileQuizHistory } from '@/features/profile';
import {
  ADMIN_LIST_PAGE_SIZE,
  ADMIN_USER_LEARNER_TYPE_FILTER_OPTIONS,
  ADMIN_USER_STATUS_FILTER_OPTIONS,
} from '@/features/admin/admin.constants';
import { buildManualPremiumBoost } from '@/features/admin/admin.datetime';
import { isAdminUserPremiumActive } from '@/features/admin/admin.selectors';
import { getAdminUserAttemptReview, getAdminUserQuizAttempts } from '@/lib/api/admin';
import { tKey } from '@viet/i18n';
import { AdminActionIconButton, AdminListPaginationControls } from '@/features/admin/admin.shared-components';
import {
  Ban,
  CalendarDays,
  CheckCircle2,
  Edit,
  Eye,
  Lock,
  Trash2,
  Unlock,
  Users,
  Sparkles,
} from 'lucide-react';

export function AdminUsersTab(props: any) {
  const {
    lang,
    tk,
    users,
    filteredUsers,
    adminUserQuickStats,
    userSearch,
    setUserSearch,
    userStatusFilter,
    setUserStatusFilter,
    userLearnerTypeFilter,
    setUserLearnerTypeFilter,
    userCreatedSort,
    setUserCreatedSort,
    userCreatedFrom,
    setUserCreatedFrom,
    userCreatedTo,
    setUserCreatedTo,
    setUserSearch: _setUserSearch,
    setUserStatusFilter: _setUserStatusFilter,
    setUserLearnerTypeFilter: _setUserLearnerTypeFilter,
    paginatedUsers,
    formatUserRole,
    formatDateTime,
    onViewUserDashboard,
    onCloseUserDashboard,
    viewingUserId,
    viewingUserLoading,
    viewingUserError,
    viewingUserDashboard,
    editingUserId,
    onStartEditUser,
    onToggleLockUser,
    onDeleteUser,
    onCancelEditUser,
    editUserForm,
    setEditUserForm,
    onSaveEditUser,
    adminUsersPage,
    setAdminUsersListPage,
  } = props;

  return (
    <div className="space-y-2 p-3">
      <div className="space-y-2">
        <div className="border border-[#dbe3ee] bg-white px-3 py-2">
          <h3 className="font-bold text-[#5a1428] text-base md:text-lg">
            {tKey(lang, 'adminUi.account_list')} (
            {filteredUsers.length}
            {filteredUsers.length !== users.length ? ` / ${users.length}` : ''})
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-md border border-[#e5d9de] sm:grid-cols-2 lg:grid-cols-4">
          <div className="border border-[#e5dde0] bg-[linear-gradient(180deg,#fff_0%,#fdf8fa_100%)] px-3 py-3 shadow-sm">
            <div className="flex items-center gap-2 text-[#7a2038]">
              <Users className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              <span className="text-[11px] font-bold uppercase tracking-wide">
                {tKey(lang, 'adminUi.total_accounts')}
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold tabular-nums text-[#5a1428]">
              {adminUserQuickStats.total}
            </p>
          </div>
          <div className="border border-[#dbe3ee] bg-white px-3 py-3 shadow-sm">
            <div className="flex items-center gap-2 text-[#5b5b73]">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600/90" aria-hidden />
              <span className="text-[11px] font-bold uppercase tracking-wide">
                {tKey(lang, 'adminUi.active_2')}
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold tabular-nums text-[#5a1428]">
              {adminUserQuickStats.active}
              <span className="text-sm font-normal text-[#8a7a80]">
                {' '}
                ({adminUserQuickStats.inactive} {tKey(lang, 'adminUi.locked_2')})
              </span>
            </p>
          </div>
          <div className="border border-[#dbe3ee] bg-white px-3 py-3 shadow-sm">
            <div className="flex items-center gap-2 text-[#5b5b73]">
              <CalendarDays className="h-4 w-4 shrink-0 text-[#7a2038]/80" aria-hidden />
              <span className="text-[11px] font-bold uppercase tracking-wide">
                {tKey(lang, 'adminUi.new_today')}
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold tabular-nums text-[#5a1428]">
              {adminUserQuickStats.newToday}
            </p>
          </div>
          <div className="border border-[#dbe3ee] bg-[linear-gradient(180deg,#fffdfb_0%,#fff8f0_100%)] px-3 py-3 shadow-sm">
            <div className="flex items-center gap-2 text-[#92400e]">
              <Sparkles className="h-4 w-4 shrink-0 text-amber-600/90" aria-hidden />
              <span className="text-[11px] font-bold uppercase tracking-wide">
                {tKey(lang, 'adminUi.user_stat_premium_active')}
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold tabular-nums text-[#5a1428]">
              {adminUserQuickStats.premiumActive}
            </p>
          </div>
        </div>

        <div className="sticky top-0 z-10 space-y-2 rounded-md border border-[#e5d9de] bg-white p-3">
          <div>
            <Label className="text-[11px] font-semibold uppercase tracking-wide text-[#7a2038]/90">
              {tKey(lang, 'adminUi.learner_type_filter_label')}
            </Label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {ADMIN_USER_LEARNER_TYPE_FILTER_OPTIONS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setUserLearnerTypeFilter(tab.id)}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    userLearnerTypeFilter === tab.id
                      ? tab.id === 'premium'
                        ? 'border-amber-700/50 bg-amber-100/90 text-amber-950 shadow-sm'
                        : 'border-[#7a2038] bg-[#f5d6df]/80 text-[#5a1428] shadow-sm'
                      : 'border-[#d2c8cc] bg-white text-[#5f5f5f] hover:bg-[#faf7f8]'
                  }`}
                >
                  {tKey(lang, tab.labelKey)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <Input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder={tKey(lang, 'adminUi.search_by_username_email_or_full_name')}
                className="h-9 border-[#d2d2d2] bg-white"
              />
            </div>
            <Select
              value={userStatusFilter}
              onValueChange={(value: 'all' | 'active' | 'inactive') =>
                setUserStatusFilter(value)
              }
            >
              <SelectTrigger className="h-9 border-[#d2d2d2] bg-white">
                <SelectValue
                  placeholder={tKey(lang, 'adminUi.account_status')}
                />
              </SelectTrigger>
              <SelectContent>
                {ADMIN_USER_STATUS_FILTER_OPTIONS.map((statusOption) => (
                  <SelectItem key={statusOption.id} value={statusOption.id}>
                    {tKey(lang, statusOption.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={userCreatedSort}
              onValueChange={(value: 'asc' | 'desc') => setUserCreatedSort(value)}
            >
              <SelectTrigger className="h-9 border-[#d2d2d2] bg-white">
                <SelectValue
                  placeholder={tKey(lang, 'adminUi.sort_by_signup_date')}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">
                  {tKey(lang, 'adminUi.newest_first')}
                </SelectItem>
                <SelectItem value="asc">
                  {tKey(lang, 'adminUi.oldest_first')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2 min-w-0">
              <Input
                type="date"
                value={userCreatedFrom}
                onChange={(e) => setUserCreatedFrom(e.target.value)}
                aria-label={tKey(lang, 'adminUi.registered_from')}
                className="h-9 border-[#d2d2d2] bg-white"
              />
              <Input
                type="date"
                value={userCreatedTo}
                onChange={(e) => setUserCreatedTo(e.target.value)}
                aria-label={tKey(lang, 'adminUi.registered_until')}
                className="h-9 border-[#d2d2d2] bg-white"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-9 shrink-0 border-[#d2d2d2] bg-white hover:bg-[#fdf5f8]"
              onClick={() => {
                setUserCreatedFrom('');
                setUserCreatedTo('');
                setUserCreatedSort('desc');
                _setUserSearch('');
                _setUserStatusFilter('all');
                _setUserLearnerTypeFilter('all');
              }}
            >
              {tKey(lang, 'adminUi.reset_filters')}
            </Button>
          </div>
        </div>

        <div className="space-y-0 overflow-hidden rounded-md border border-[#d8cfd3] divide-y divide-[#e7dde1]">
          {paginatedUsers.map((item: any, rowIdx: number) => {
            const zebra = rowIdx % 2 === 1;
            return (
              <div
                key={item.id}
                className={`rounded-none p-2 transition-colors ${zebra ? 'bg-[#f9fafb]' : 'bg-white'}`}
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <span className="text-base font-semibold tracking-tight text-[#5a1428]">
                        {item.username}
                      </span>
                      {(() => {
                        const plan = String(item.premium_plan || 'none');
                        const vipActive = isAdminUserPremiumActive(item);
                        if (vipActive) {
                          return (
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-950">
                              {tKey(lang, 'adminUi.tier_premium')}
                            </span>
                          );
                        }
                        if (plan !== 'none') {
                          return (
                            <span className="rounded border border-[#d4c4c8] bg-[#f4f0f2] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#6b5f65]">
                              {tKey(lang, 'adminUi.tier_premium_expired_short')}
                            </span>
                          );
                        }
                        return null;
                      })()}
                      <span className="text-[11px] font-medium uppercase tracking-wide text-[#8a7a80]">
                        {formatUserRole(item.role, lang)}
                      </span>
                      <span
                        className={`text-[11px] font-semibold ${
                          item.is_active ? 'text-emerald-700' : 'text-[#6b6570]'
                        }`}
                      >
                        {item.is_active
                          ? tKey(lang, 'adminUi.active')
                          : tKey(lang, 'adminUi.locked')}
                      </span>
                    </div>
                    <div className="mt-0 truncate text-xs text-[#6b6570]">
                      {item.email}
                      {item.full_name ? ` · ${item.full_name}` : ''}
                    </div>
                    <div className="mt-0 text-[11px] text-[#9a9096]">
                      {tKey(lang, 'adminUi.signed_up')}{' '}
                      {formatDateTime(item.created_at)}
                    </div>
                  </div>
                  <div
                    className="flex shrink-0 flex-wrap gap-2 sm:justify-end"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewUserDashboard(item)}
                      title={tk('adminUser.viewDashboard')}
                      className="h-9 min-h-9 w-9 border-[#d7bcc6] bg-[#fff6f8] px-0 text-[#5a1428] hover:bg-[#fdecef]"
                    >
                      <Eye className="h-4 w-4 shrink-0" />
                    </Button>
                    <AdminActionIconButton
                      onClick={() => onStartEditUser(item)}
                      title={tKey(lang, 'adminUi.edit_account_2')}
                      kind="edit"
                      className="h-9 min-h-9 w-9 px-0"
                      icon={<Edit className="h-4 w-4 shrink-0" />}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleLockUser(item)}
                      title={tKey(lang, 'adminUi.lock_unlock')}
                      className="h-9 min-h-9 border-[#d2d2d2] bg-white px-3 hover:bg-[#fdf5f8]"
                    >
                      {item.is_active ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    </Button>
                    <AdminActionIconButton
                      onClick={() => onDeleteUser(item)}
                      title={tKey(lang, 'adminUi.delete_account')}
                      kind="delete"
                      className="h-9 min-h-9 w-9 px-0"
                      icon={<Trash2 className="h-4 w-4" />}
                    />
                  </div>
                </div>
                {editingUserId === item.id && (
                  <Dialog open={editingUserId === item.id} onOpenChange={(open) => !open && onCancelEditUser()}>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle className="text-[#6b1b31]">
                          {tKey(lang, 'adminUi.edit_account')}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="admin-surface-edit w-full rounded-xl p-3 md:p-4">
                        <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-[#e8c4c8] pb-2">
                          <Edit className="h-4 w-4 shrink-0 text-[#7a2038]" aria-hidden />
                          <span className="text-xs font-bold uppercase tracking-wide text-[#6b1b31]">
                            {tKey(lang, 'adminUi.edit_mode_changes_are_saved_when_you_click_save')}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                          <div>
                            <Label className="text-xs text-[#5b5b5b]">
                              {tKey(lang, 'adminUi.username')}
                            </Label>
                            <Input
                              value={editUserForm.username}
                              onChange={(e) =>
                                setEditUserForm({ ...editUserForm, username: e.target.value })
                              }
                              className="h-9 border-[#d2d2d2] bg-white"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-[#5b5b5b]">
                              {tKey(lang, 'adminUi.email')}
                            </Label>
                            <Input
                              type="email"
                              value={editUserForm.email}
                              onChange={(e) =>
                                setEditUserForm({ ...editUserForm, email: e.target.value })
                              }
                              className="h-9 border-[#d2d2d2] bg-white"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-[#5b5b5b]">
                              {tKey(lang, 'adminUi.full_name')}
                            </Label>
                            <Input
                              value={editUserForm.full_name}
                              onChange={(e) =>
                                setEditUserForm({ ...editUserForm, full_name: e.target.value })
                              }
                              className="h-9 border-[#d2d2d2] bg-white"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-[#5b5b5b]">
                              {tKey(lang, 'adminUi.premium_plan')}
                            </Label>
                            <Select
                              value={editUserForm.premium_plan}
                              onValueChange={(v: 'none' | '1m' | '3m') =>
                                setEditUserForm({ ...editUserForm, premium_plan: v })
                              }
                            >
                              <SelectTrigger className="h-9 border-[#d2d2d2] bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">
                                  {tKey(lang, 'adminUi.none')}
                                </SelectItem>
                                <SelectItem value="1m">{tKey(lang, 'premium.duration1Month')}</SelectItem>
                                <SelectItem value="3m">{tKey(lang, 'premium.duration3Months')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs text-[#5b5b5b]">
                              {tKey(lang, 'adminUi.vip_until_local_time')}
                            </Label>
                            <Input
                              type="datetime-local"
                              value={editUserForm.premium_until}
                              onChange={(e) =>
                                setEditUserForm({ ...editUserForm, premium_until: e.target.value })
                              }
                              disabled={editUserForm.premium_plan === 'none'}
                              className="h-9 border-[#d2d2d2] bg-white"
                            />
                          </div>
                          <div className="md:col-span-2 lg:col-span-3 flex flex-col gap-2 rounded-lg border border-dashed border-[#c9a8b0] bg-[#fdf8f9] px-3 py-2.5">
                            <p className="text-[11px] leading-snug text-[#6b4b55]">
                              {tKey(lang, 'adminUi.manual_premium_boost_hint')}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-9 border-[#7a2038]/35 bg-white text-[#5a1428] hover:bg-[#fff0f4]"
                                onClick={() => {
                                  const next = buildManualPremiumBoost('1m');
                                  setEditUserForm({ ...editUserForm, ...next });
                                }}
                              >
                                <Sparkles className="mr-1.5 h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
                                {tKey(lang, 'adminUi.manual_premium_boost_1m')}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-9 border-[#7a2038]/35 bg-white text-[#5a1428] hover:bg-[#fff0f4]"
                                onClick={() => {
                                  const next = buildManualPremiumBoost('3m');
                                  setEditUserForm({ ...editUserForm, ...next });
                                }}
                              >
                                <Sparkles className="mr-1.5 h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
                                {tKey(lang, 'adminUi.manual_premium_boost_3m')}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-9 border-destructive/35 bg-white text-destructive hover:bg-destructive/[0.06]"
                                onClick={() =>
                                  setEditUserForm({
                                    ...editUserForm,
                                    premium_plan: 'none',
                                    premium_until: '',
                                  })
                                }
                              >
                                <Ban className="mr-1.5 h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
                                {tKey(lang, 'adminUi.manual_premium_boost_clear')}
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-[#5b5b5b]">
                              {tKey(lang, 'adminUi.role')}
                            </Label>
                            <p className="mt-1.5 rounded-md border border-[#e8e8e8] bg-[#fafafa] px-3 py-2 text-sm text-[#3a3a3a]">
                              {formatUserRole(item.role, lang)}
                            </p>
                            <p className="mt-1 text-[11px] text-[#7a6f73]">
                              {tKey(lang, 'adminUi.user_role_readonly_hint')}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs text-[#5b5b5b]">
                              {tKey(lang, 'adminUi.status')}
                            </Label>
                            <Select
                              value={editUserForm.is_active ? 'active' : 'locked'}
                              onValueChange={(v) =>
                                setEditUserForm({ ...editUserForm, is_active: v === 'active' })
                              }
                            >
                              <SelectTrigger className="h-9 border-[#d2d2d2] bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">
                                  {tKey(lang, 'adminUi.active_3')}
                                </SelectItem>
                                <SelectItem value="locked">
                                  {tKey(lang, 'adminUi.locked_3')}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs text-[#5b5b5b]">
                              {tKey(lang, 'adminUi.new_password_optional')}
                            </Label>
                            <Input
                              type="password"
                              autoComplete="new-password"
                              value={editUserForm.password}
                              onChange={(e) =>
                                setEditUserForm({ ...editUserForm, password: e.target.value })
                              }
                              className="h-9 border-[#d2d2d2] bg-white"
                            />
                          </div>
                          <div className="md:col-span-2 lg:col-span-3 flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => onSaveEditUser(item)}
                              className="h-9 bg-[#7a2038] hover:bg-[#5a1428] text-white"
                            >
                              {tKey(lang, 'adminUi.save')}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={onCancelEditUser}
                              className="h-9 border-[#d2d2d2] bg-white"
                            >
                              {tKey(lang, 'adminUi.cancel')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            );
          })}
          <AdminListPaginationControls
            lang={lang}
            page={adminUsersPage}
            pageSize={ADMIN_LIST_PAGE_SIZE}
            total={filteredUsers.length}
            onPageChange={setAdminUsersListPage}
          />
        </div>
      </div>

      <Dialog
        open={viewingUserId !== null}
        onOpenChange={(open) => {
          if (!open) onCloseUserDashboard();
        }}
      >
        <DialogContent
          suppressAriaDescribedBy={false}
          className="max-h-[min(92vh,880px)] max-w-4xl overflow-y-auto border-[#e8c4c8] bg-[linear-gradient(160deg,#fff_0%,#fdf8fa_100%)] p-4 sm:p-6"
          closeLabel={tk('adminUser.close')}
        >
          <DialogHeader>
            <DialogTitle className="text-left text-lg text-[#6b1b31]">
              {tk('adminUser.learnerProfile')}:{' '}
              <span className="font-semibold tabular-nums">
                {viewingUserId != null
                  ? users.find((u: any) => Number(u.id) === Number(viewingUserId))?.username ??
                    `#${viewingUserId}`
                  : ''}
              </span>
            </DialogTitle>
            <DialogDescription asChild>
              <div className="text-left text-[#7a2038]/95">
                <span className="block text-xs font-bold uppercase tracking-wide text-[#6b1b31]">
                  {tk('adminUser.viewReadOnlyBadge')}
                </span>
                <span className="mt-1 block text-[11px] font-normal leading-snug">
                  {tk('adminUser.dashboardSubtitle')}
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>

          {viewingUserLoading && (
            <div className="flex items-center gap-2 py-8 text-sm text-[#5b5b5b]">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#7a2038] border-t-transparent" />
              {tk('adminUser.loadingProfile')}
            </div>
          )}
          {!viewingUserLoading && viewingUserError && (
            <div className="py-4 text-sm text-destructive">{viewingUserError}</div>
          )}
          {!viewingUserLoading && !viewingUserError && viewingUserDashboard && viewingUserId != null && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                <div className="rounded-sm border border-[#d2d2d2] bg-white p-2">
                  <div className="text-xs text-[#5b5b5b]">{tk('adminUser.totalScore')}</div>
                  <div className="font-bold tabular-nums text-[#5a1428]">
                    {Number(viewingUserDashboard.stats.total_score || 0).toFixed(2)}
                  </div>
                </div>
                <div className="rounded-sm border border-[#d2d2d2] bg-white p-2">
                  <div className="text-xs text-[#5b5b5b]">{tk('adminUser.quizCount')}</div>
                  <div className="font-bold tabular-nums text-[#5a1428]">
                    {viewingUserDashboard.stats.total_quizzes || 0}
                  </div>
                </div>
                <div className="rounded-sm border border-[#d2d2d2] bg-white p-2">
                  <div className="text-xs text-[#5b5b5b]">{tk('adminUser.correct')}</div>
                  <div className="font-bold tabular-nums text-[#5a1428]">
                    {viewingUserDashboard.stats.total_correct || 0}
                  </div>
                </div>
                <div className="rounded-sm border border-[#d2d2d2] bg-white p-2">
                  <div className="text-xs text-[#5b5b5b]">
                    {tk('adminUser.totalQuestions')}
                  </div>
                  <div className="font-bold tabular-nums text-[#5a1428]">
                    {viewingUserDashboard.stats.total_questions || 0}
                  </div>
                </div>
                <div className="rounded-sm border border-[#d2d2d2] bg-white p-2 md:col-span-1 col-span-2">
                  <div className="text-xs text-[#5b5b5b]">{tk('adminUser.avgPct')}</div>
                  <div className="font-bold tabular-nums text-[#5a1428]">
                    {Number(viewingUserDashboard.stats.average_percentage || 0).toFixed(2)}%
                  </div>
                </div>
              </div>
              <div className="max-h-[min(55vh,480px)] overflow-y-auto pr-1">
                <ProfileQuizHistory
                  key={`admin-quiz-hist-${viewingUserId}`}
                  quizSummaries={viewingUserDashboard.quiz_summaries}
                  fallbackHistory={viewingUserDashboard.history || []}
                  lang={lang}
                  tk={tk}
                  fetchQuizAttempts={(qid) => getAdminUserQuizAttempts(viewingUserId, qid)}
                  fetchAttemptReview={(aid) => getAdminUserAttemptReview(viewingUserId, aid, lang)}
                  showPracticeCta={false}
                  reviewAnswerPerspective="student"
                  compactLayout
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
