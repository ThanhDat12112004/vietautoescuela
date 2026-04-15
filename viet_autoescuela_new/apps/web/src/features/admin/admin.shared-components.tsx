import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ReactNode } from 'react';
import type { Language } from '@/lib/api/types';
import { fillTemplate, tKey } from '@viet/i18n';

export function AdminActionIconButton({
  onClick,
  title,
  kind,
  icon,
  className = 'h-8 w-8 px-0',
}: {
  onClick: () => void;
  title: string;
  kind: 'edit' | 'delete';
  icon: ReactNode;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      title={title}
      className={`${kind === 'edit' ? 'admin-btn-edit' : 'admin-btn-delete'} ${className}`}
    >
      {icon}
    </Button>
  );
}

export function AdminListPaginationControls({
  lang,
  page,
  pageSize,
  total,
  onPageChange,
}: {
  lang: Language;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  if (total <= 0) return null;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const from = (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, total);

  return (
    <div className="mt-0 border-t border-[#e8dfe3] bg-white px-3 py-2">
      <p className="text-center text-xs text-[#5b5b5b]">
        {fillTemplate(tKey(lang, 'adminUi.pagination_showing_range'), { from, to, total })}
      </p>
      <div className="mt-0 flex items-center justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 border-[#d8ccd1] bg-white hover:bg-[#f7f7f8]"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
        >
          {tKey(lang, 'adminUi.pagination_previous')}
        </Button>
        <span className="rounded-sm border border-[#d8ccd1] bg-white px-2 py-1 text-xs font-semibold tabular-nums text-[#5a1428]">
          {safePage} / {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 border-[#d8ccd1] bg-white hover:bg-[#f7f7f8]"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
        >
          {tKey(lang, 'adminUi.pagination_next')}
        </Button>
      </div>
    </div>
  );
}

export function AdminAccessTierField({
  lang,
  value,
  onChange,
  id,
  className = '',
}: {
  lang: Language;
  value: 'free' | 'premium';
  onChange: (v: 'free' | 'premium') => void;
  id?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2 text-xs ${className}`.trim()}>
      <Label htmlFor={id} className="shrink-0 text-[#5b5b5b]">
        {tKey(lang, 'adminUi.access')}
      </Label>
      <Select
        value={value}
        onValueChange={(v) => onChange(v as 'free' | 'premium')}
      >
        <SelectTrigger id={id} className="h-8 w-[140px] border-[#d2d2d2] bg-white text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="free">{tKey(lang, 'adminUi.free')}</SelectItem>
          <SelectItem value="premium">{tKey(lang, 'adminUi.tier_premium')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
