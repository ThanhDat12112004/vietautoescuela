import { useEffect, useMemo } from 'react';
import {
  clampPage,
  computeUserQuickStats,
  filterAndSortUsers,
  isAdminUsersListLearner,
  paginateItems,
} from '@/features/admin/admin.selectors';

export function useAdminUsers(params: {
  users: any[];
  userSearch: string;
  userCreatedFrom: string;
  userCreatedTo: string;
  userCreatedSort: 'asc' | 'desc';
  userStatusFilter: 'all' | 'active' | 'inactive';
  userLearnerTypeFilter: 'all' | 'standard' | 'premium';
  parseDateSafe: (value: unknown) => Date | null;
  adminUsersListPage: number;
  setAdminUsersListPage: (value: number | ((p: number) => number)) => void;
  pageSize: number;
}) {
  const {
    users,
    userSearch,
    userCreatedFrom,
    userCreatedTo,
    userCreatedSort,
    userStatusFilter,
    userLearnerTypeFilter,
    parseDateSafe,
    adminUsersListPage,
    setAdminUsersListPage,
    pageSize,
  } = params;

  const learnerUsers = useMemo(
    () => users.filter((u) => isAdminUsersListLearner(u)),
    [users]
  );

  const adminUserQuickStats = useMemo(
    () => computeUserQuickStats(learnerUsers, parseDateSafe),
    [learnerUsers, parseDateSafe]
  );

  const filteredUsers = useMemo(
    () =>
      filterAndSortUsers({
        users: learnerUsers,
        userSearch,
        userCreatedFrom,
        userCreatedTo,
        userCreatedSort,
        userStatusFilter,
        userLearnerTypeFilter,
        parseDateSafe,
      }),
    [
      learnerUsers,
      userSearch,
      userCreatedFrom,
      userCreatedTo,
      userCreatedSort,
      userStatusFilter,
      userLearnerTypeFilter,
      parseDateSafe,
    ]
  );

  useEffect(() => {
    setAdminUsersListPage(1);
  }, [
    userSearch,
    userCreatedFrom,
    userCreatedTo,
    userCreatedSort,
    userStatusFilter,
    userLearnerTypeFilter,
    setAdminUsersListPage,
  ]);

  useEffect(() => {
    const { totalPages } = clampPage(adminUsersListPage, filteredUsers.length, pageSize);
    setAdminUsersListPage((p) => (p > totalPages ? totalPages : p));
  }, [adminUsersListPage, filteredUsers.length, pageSize, setAdminUsersListPage]);

  const { totalPages: adminUsersTotalPages, safePage: adminUsersPage } = clampPage(
    adminUsersListPage,
    filteredUsers.length,
    pageSize
  );
  const paginatedUsers = useMemo(
    () => paginateItems(filteredUsers, adminUsersPage, pageSize),
    [filteredUsers, adminUsersPage, pageSize]
  );

  return {
    adminUserQuickStats,
    learnerUsers,
    filteredUsers,
    adminUsersTotalPages,
    adminUsersPage,
    paginatedUsers,
  };
}
