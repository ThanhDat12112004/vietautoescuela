'use client';

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
  adminPremiumPlanLabel,
  adminPremiumStatusLabel,
  toPremiumRequestUiStatus,
} from '@/features/admin/premium/admin-premium.helpers';
import { formatUserFacingApiError } from '@/lib/api/format-api-error';
import { cn } from '@/lib/utils';
import { fillTemplate, tKey, type I18nKey } from '@viet/i18n';
import type { Language } from '@/lib/api/types';
import {
  approveAdminPremiumRequest,
  deleteAdminPremiumRequest,
  fetchAdminPremiumBillBlob,
  getAdminPremiumRequests,
  rejectAdminPremiumRequest,
  type AdminPremiumRequestRow,
} from '@/lib/api/admin';
import { Check, Clock, ExternalLink, FileCheck2, Medal, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

type Props = {
  lang: Language;
  tk: (key: I18nKey) => string;
  formatDateTime: (value: string | null | undefined) => string;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
};

function cardAccentClass(uiStatus: ReturnType<typeof toPremiumRequestUiStatus>) {
  switch (uiStatus) {
    case 'pending':
      return 'border-l-[#c9a227] bg-[linear-gradient(90deg,rgba(227,197,101,0.14)_0%,rgba(253,249,250,1)_52%,#fff_100%)]';
    case 'approved':
      return 'border-l-[#1b6b4c] bg-[linear-gradient(90deg,rgba(27,107,76,0.08)_0%,rgba(253,249,250,1)_55%,#fff_100%)]';
    case 'rejected':
      return 'border-l-[#9d6b7a] bg-[linear-gradient(90deg,rgba(157,107,122,0.10)_0%,rgba(253,249,250,1)_55%,#fff_100%)]';
    default:
      return 'border-l-[#b8a8ae] bg-[#fdf9fa]';
  }
}

function hasBillAttachment(row: AdminPremiumRequestRow): boolean {
  const p = String(row.bill_storage_path || '').trim();
  return Boolean(p && p !== '(removed)');
}

function statusPillClass(uiStatus: ReturnType<typeof toPremiumRequestUiStatus>) {
  switch (uiStatus) {
    case 'pending':
      return 'border-amber-200/80 bg-amber-50/95 text-[#7a5e08]';
    case 'approved':
      return 'border-emerald-200/90 bg-emerald-50/95 text-[#14523a]';
    case 'rejected':
      return 'border-[#d4b8c0] bg-[#f5eef1] text-[#6b3d4d]';
    default:
      return 'border-[#e3d7dc] bg-white text-[#5f5f5f]';
  }
}

function PremiumRequestsLoading() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-[#ebe3e6] bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="h-4 w-24 rounded bg-[#ebe3e6]" />
          <div className="mt-3 h-3 w-full max-w-md rounded bg-[#f0e8eb]" />
          <div className="mt-2 h-3 w-full max-w-xs rounded bg-[#f0e8eb]" />
        </div>
      ))}
    </div>
  );
}

export function AdminPremiumRequestsTab({
  lang,
  tk,
  formatDateTime,
  showError,
  showSuccess,
}: Props) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>(
    'pending'
  );
  const [planFilter, setPlanFilter] = useState<'all' | '1m' | '3m'>('all');
  const [usernameInput, setUsernameInput] = useState('');
  const [debouncedUsername, setDebouncedUsername] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [items, setItems] = useState<AdminPremiumRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [busyId, setBusyId] = useState<number | null>(null);
  const [openingBillId, setOpeningBillId] = useState<number | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedUsername(usernameInput.trim()), 400);
    return () => window.clearTimeout(t);
  }, [usernameInput]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminPremiumRequests({
        status: statusFilter === 'all' ? undefined : statusFilter,
        limit: 200,
        offset: 0,
        username: debouncedUsername || undefined,
        plan_code: planFilter === 'all' ? undefined : planFilter,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });
      setItems(res.items || []);
    } catch (e) {
      showError(
        e instanceof Error
          ? formatUserFacingApiError(lang, e)
          : tKey(lang, 'adminUi.premium_req_load_error')
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, debouncedUsername, lang, planFilter, showError, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onApprove(id: number) {
    setBusyId(id);
    try {
      await approveAdminPremiumRequest(id, notes[id]?.trim() || null);
      showSuccess(tk('adminUi.premium_req_toast_approved'));
      await load();
    } catch (e) {
      showError(formatUserFacingApiError(lang, e instanceof Error ? e : String(e)));
    } finally {
      setBusyId(null);
    }
  }

  async function onReject(id: number) {
    setBusyId(id);
    try {
      await rejectAdminPremiumRequest(id, notes[id]?.trim() || null);
      showSuccess(tk('adminUi.premium_req_toast_rejected'));
      await load();
    } catch (e) {
      showError(formatUserFacingApiError(lang, e instanceof Error ? e : String(e)));
    } finally {
      setBusyId(null);
    }
  }

  async function onOpenBill(id: number) {
    setOpeningBillId(id);
    try {
      const blob = await fetchAdminPremiumBillBlob(id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
    } catch (e) {
      showError(
        e instanceof Error
          ? formatUserFacingApiError(lang, e)
          : tKey(lang, 'adminUi.premium_req_bill_open_fail')
      );
    } finally {
      setOpeningBillId(null);
    }
  }

  async function onDeleteRequest(id: number) {
    const ok = window.confirm(
      fillTemplate(tKey(lang, 'adminUi.premium_req_delete_confirm'), { id: String(id) })
    );
    if (!ok) return;
    setBusyId(id);
    try {
      await deleteAdminPremiumRequest(id);
      showSuccess(tk('adminUi.premium_req_toast_deleted'));
      setNotes((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      await load();
    } catch (e) {
      showError(formatUserFacingApiError(lang, e instanceof Error ? e : String(e)));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex min-h-0 flex-col">
      <section
        className="relative w-full overflow-hidden border-0 border-b border-[#e3d7dc] bg-[linear-gradient(135deg,rgba(90,20,40,0.06)_0%,#fff_40%,rgba(227,197,101,0.12)_100%)] shadow-none"
        aria-labelledby="admin-premium-heading"
      >
        <div
          className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-[#8B1E2D]/[0.05] sm:h-48 sm:w-48"
          aria-hidden
        />
        <div className="relative flex w-full flex-col gap-4 px-3 pb-4 pt-3 text-left sm:gap-5 sm:px-4 sm:pb-5 sm:pt-4">
          <div className="flex w-full min-w-0 items-start gap-3.5">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#e8c88a]/50 bg-white/90 shadow-sm"
              aria-hidden
            >
              <Medal className="h-6 w-6 text-[#8B1E2D]" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B1E2D]/85">
                {tKey(lang, 'nav.premium')}
              </p>
              <h2
                id="admin-premium-heading"
                className="mt-1 font-display text-xl font-bold tracking-tight text-[#3a2229] sm:text-2xl"
              >
                {tKey(lang, 'adminUi.premium_req_title')}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#5c4a50] sm:text-[15px]">
                {tKey(lang, 'adminUi.premium_req_subtitle')}
              </p>
            </div>
          </div>

          <div className="grid w-full gap-3 rounded-xl border border-[#e8dde1]/80 bg-white/85 p-3 shadow-sm sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 sm:gap-3 sm:p-4">
            <div className="space-y-1.5 sm:col-span-2 xl:col-span-2">
              <Label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b4d56]">
                {tKey(lang, 'adminUi.premium_req_search_username')}
              </Label>
              <Input
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder={tKey(lang, 'adminUi.premium_req_search_username_ph')}
                className="h-11 rounded-xl border-[#d4c4c8] bg-white text-[#3a2229] shadow-sm focus-visible:ring-[#8B1E2D]/25"
                autoComplete="off"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b4d56]">
                {tKey(lang, 'adminUi.premium_req_filter_plan')}
              </Label>
              <Select
                value={planFilter}
                onValueChange={(v) => setPlanFilter(v as typeof planFilter)}
              >
                <SelectTrigger className="h-11 rounded-xl border-[#d4c4c8] bg-white text-[#3a2229] shadow-sm focus:ring-[#8B1E2D]/25">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{tKey(lang, 'adminUi.premium_req_plan_all')}</SelectItem>
                  <SelectItem value="1m">{tKey(lang, 'premium.duration1Month')}</SelectItem>
                  <SelectItem value="3m">{tKey(lang, 'premium.duration3Months')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b4d56]">
                {tKey(lang, 'adminUi.premium_req_filter')}
              </Label>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
              >
                <SelectTrigger className="h-11 rounded-xl border-[#d4c4c8] bg-white text-[#3a2229] shadow-sm focus:ring-[#8B1E2D]/25">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{tKey(lang, 'adminUi.premium_req_all')}</SelectItem>
                  <SelectItem value="pending">{tKey(lang, 'adminUi.premium_req_pending')}</SelectItem>
                  <SelectItem value="approved">{tKey(lang, 'adminUi.premium_req_approved')}</SelectItem>
                  <SelectItem value="rejected">{tKey(lang, 'adminUi.premium_req_rejected')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b4d56]">
                {tKey(lang, 'adminUi.premium_req_date_from')}
              </Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-11 rounded-xl border-[#d4c4c8] bg-white text-[#3a2229] shadow-sm focus-visible:ring-[#8B1E2D]/25"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b4d56]">
                {tKey(lang, 'adminUi.premium_req_date_to')}
              </Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-11 rounded-xl border-[#d4c4c8] bg-white text-[#3a2229] shadow-sm focus-visible:ring-[#8B1E2D]/25"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-6 px-4 py-6 sm:px-6">
      {loading ? (
        <PremiumRequestsLoading />
      ) : items.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#e8c88a]/45 bg-[linear-gradient(180deg,#fdfcfb_0%,#faf6f7_100%)] py-16 px-6 text-center"
          role="status"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e3d7dc] bg-white shadow-sm">
            <FileCheck2 className="h-7 w-7 text-[#b8a0a8]" strokeWidth={1.5} aria-hidden />
          </div>
          <p className="mt-5 max-w-md text-sm font-semibold text-[#4a3540]">
            {tKey(lang, 'adminUi.premium_req_empty')}
          </p>
          <p className="mt-2 max-w-sm text-xs leading-relaxed text-[#7b6d73]">
            {tKey(lang, 'adminUi.premium_req_subtitle')}
          </p>
        </div>
      ) : (
        <ul className="space-y-4" aria-label={tKey(lang, 'adminUi.premium_req_title')}>
          {items.map((row) => {
            const showBill = hasBillAttachment(row);
            const uiStatus = toPremiumRequestUiStatus(row.status);
            const planLabel = adminPremiumPlanLabel(lang, row.plan_code);
            const statusLabel = adminPremiumStatusLabel(lang, row.status);

            return (
              <li key={row.id}>
                <article
                  className={cn(
                    'overflow-hidden rounded-xl border border-[#e8dde1] border-l-4 shadow-sm transition-shadow hover:shadow-md',
                    cardAccentClass(uiStatus)
                  )}
                >
                  <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:p-5">
                    <div className="min-w-0 flex-1 space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-lg bg-[#8B1E2D]/10 px-2 py-0.5 font-mono text-xs font-bold text-[#6b1220]">
                          #{row.id}
                        </span>
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
                            statusPillClass(uiStatus)
                          )}
                        >
                          {statusLabel}
                        </span>
                      </div>
                      <p className="text-[15px] font-semibold leading-snug text-[#2f171b]">
                        {row.username}
                        <span className="block font-normal text-[#6b5660] sm:inline sm:before:content-['\00a0·\00a0']">
                          {row.email}
                        </span>
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#5c4a50]">
                        <span className="inline-flex items-center gap-1.5">
                          <Medal className="h-3.5 w-3.5 shrink-0 text-[#8B1E2D]/80" aria-hidden />
                          <span className="font-medium text-[#3a2229]">{planLabel}</span>
                        </span>
                        <span className="hidden text-[#d4c4c8] sm:inline" aria-hidden>
                          |
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[#6b5660]">
                          <Clock className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
                          {formatDateTime(row.created_at)}
                        </span>
                      </div>
                      {row.payer_note ? (
                        <p className="rounded-lg border border-[#ebe3e6] bg-white/70 px-3 py-2 text-sm leading-relaxed text-[#3a2229]">
                          <span className="text-xs font-semibold uppercase tracking-wide text-[#8B1E2D]/75">
                            {tKey(lang, 'adminUi.premium_req_user_note')}
                          </span>
                          <span className="mt-1 block text-[#4a3540]">{row.payer_note}</span>
                        </p>
                      ) : null}
                      {row.status !== 'pending' ? (
                        <p className="text-xs leading-relaxed text-[#7b6d73]">
                          <span className="font-semibold text-[#5c4a50]">
                            {tKey(lang, 'adminUi.premium_req_note')}
                          </span>
                          {': '}
                          {row.admin_note?.trim() ? row.admin_note : '—'}
                          {row.reviewed_at ? (
                            <span className="mt-0.5 block text-[11px] text-[#9a9096] sm:mt-0 sm:inline sm:before:content-['\00a0·\00a0']">
                              {formatDateTime(row.reviewed_at)}
                            </span>
                          ) : null}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                      {showBill ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={openingBillId === row.id}
                          className="h-10 rounded-xl border-[#8B1E2D]/28 bg-white text-[#5a1428] hover:bg-[#8B1E2D]/[0.06]"
                          onClick={() => void onOpenBill(row.id)}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" aria-hidden />
                          {openingBillId === row.id
                            ? '…'
                            : tKey(lang, 'adminUi.premium_req_bill')}
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={busyId === row.id}
                        className="h-10 rounded-xl border-destructive/35 bg-white text-destructive hover:bg-destructive/10"
                        onClick={() => void onDeleteRequest(row.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" aria-hidden />
                        {tKey(lang, 'adminUi.premium_req_delete')}
                      </Button>
                    </div>
                  </div>

                  {row.status === 'pending' ? (
                    <div className="space-y-3 border-t border-[#e8dde1]/90 bg-white/55 px-4 py-4 sm:px-5">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-[#5c4a50]">
                          {tKey(lang, 'adminUi.premium_req_note')}
                        </Label>
                        <Input
                          value={notes[row.id] ?? ''}
                          onChange={(e) =>
                            setNotes((prev) => ({ ...prev, [row.id]: e.target.value }))
                          }
                          placeholder={tKey(lang, 'adminUi.premium_req_note_ph')}
                          className="rounded-xl border-[#d4c4c8] bg-white"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        <Button
                          type="button"
                          size="sm"
                          disabled={busyId === row.id}
                          onClick={() => void onApprove(row.id)}
                          className="h-10 rounded-xl bg-gradient-to-r from-[#8B1E2D] to-[#9B1B30] px-4 font-semibold text-white shadow-sm hover:opacity-[0.96]"
                        >
                          <Check className="mr-2 h-4 w-4" aria-hidden />
                          {tKey(lang, 'adminUi.premium_req_approve')}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={busyId === row.id}
                          onClick={() => void onReject(row.id)}
                          className="h-10 rounded-xl border-[#b85c6e] bg-white text-[#8B1E2D] hover:bg-[#8B1E2D]/[0.06]"
                        >
                          <X className="mr-2 h-4 w-4" aria-hidden />
                          {tKey(lang, 'adminUi.premium_req_reject')}
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </article>
              </li>
            );
          })}
        </ul>
      )}
      </div>
    </div>
  );
}
