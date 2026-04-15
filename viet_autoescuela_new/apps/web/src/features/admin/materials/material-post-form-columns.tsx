'use client';

import { MaterialHtmlEditor } from '@/components/MaterialHtmlEditor';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { AdminLocaleBlockLabel } from '@/features/admin/components/AdminLocaleBlockLabel';
import type { Language } from '@/lib/api/types';
import { tKey } from '@viet/i18n';
import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useRef, useState } from 'react';

export type MaterialPostFormFields = {
  title_vi: string;
  title_en: string;
  title_es: string;
  excerpt_vi: string;
  excerpt_en: string;
  excerpt_es: string;
  body_html_vi: string;
  body_html_es: string;
  body_html_en: string;
};

type LangTab = 'vi' | 'en' | 'es';

type Props<T extends MaterialPostFormFields> = {
  lang: Language;
  form: T;
  setForm: Dispatch<SetStateAction<T>>;
  onUploadImage: (file: File) => Promise<string>;
  /** Chiều cao vùng TinyMCE (px). */
  editorHeight?: number;
  /** Khi dialog mở (false → true), đưa tab về Tiếng Việt. */
  open?: boolean;
};

export function MaterialPostFormColumns<T extends MaterialPostFormFields>({
  lang,
  form,
  setForm,
  onUploadImage,
  editorHeight = 520,
  open = true,
}: Props<T>) {
  const [tab, setTab] = useState<LangTab>('vi');
  const prevOpen = useRef(open);

  useEffect(() => {
    if (open && !prevOpen.current) {
      setTab('vi');
    }
    prevOpen.current = open;
  }, [open]);

  return (
    <div className="flex min-h-0 flex-col gap-3">
      <Tabs value={tab} onValueChange={(v) => setTab(v as LangTab)}>
        <TabsList className="grid h-auto w-full grid-cols-3 gap-1 p-1">
          <TabsTrigger
            value="vi"
            className="flex items-center justify-center gap-1 text-xs font-semibold sm:text-sm"
          >
            <AdminLocaleBlockLabel lang={lang} block="vi" />
          </TabsTrigger>
          <TabsTrigger
            value="en"
            className="flex items-center justify-center gap-1 text-xs font-semibold sm:text-sm"
          >
            <AdminLocaleBlockLabel lang={lang} block="en" />
          </TabsTrigger>
          <TabsTrigger
            value="es"
            className="flex items-center justify-center gap-1 text-xs font-semibold sm:text-sm"
          >
            <AdminLocaleBlockLabel lang={lang} block="es" />
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div
        role="tabpanel"
        className="min-h-0 flex-1 rounded-lg border border-[#e5d9de] bg-white p-3 sm:p-4"
        aria-label={tab === 'vi' ? 'VI' : tab === 'en' ? 'EN' : 'ES'}
      >
        {tab === 'vi' ? (
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-[#5b5b5b]">{tKey(lang, 'adminUi.title_vi')}</Label>
              <Input
                value={form.title_vi}
                onChange={(e) => setForm((p) => ({ ...p, title_vi: e.target.value }))}
                className="mt-1 h-10 border-[#d2d2d2] bg-white"
                autoComplete="off"
              />
            </div>
            <div>
              <Label className="text-xs text-[#5b5b5b]">{tKey(lang, 'adminUi.description_vi_2')}</Label>
              <Textarea
                value={form.excerpt_vi}
                onChange={(e) => setForm((p) => ({ ...p, excerpt_vi: e.target.value }))}
                rows={3}
                className="mt-1 border-[#d2d2d2] bg-white"
              />
            </div>
            <div>
              <Label className="text-xs text-[#5b5b5b]">
                {tKey(lang, 'adminUi.material_article_body_html')}
              </Label>
              <div className="mt-2 min-h-[280px] rounded-md border border-[#e5d9de] bg-[#fafafa] p-1">
                <MaterialHtmlEditor
                  value={form.body_html_vi}
                  onChange={(html) => setForm((p) => ({ ...p, body_html_vi: html }))}
                  onUploadImage={onUploadImage}
                  height={editorHeight}
                />
              </div>
            </div>
          </div>
        ) : null}

        {tab === 'en' ? (
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-[#5b5b5b]">{tKey(lang, 'adminUi.title_en')}</Label>
              <Input
                value={form.title_en}
                onChange={(e) => setForm((p) => ({ ...p, title_en: e.target.value }))}
                className="mt-1 h-10 border-[#d2d2d2] bg-white"
                autoComplete="off"
              />
            </div>
            <div>
              <Label className="text-xs text-[#5b5b5b]">{tKey(lang, 'adminUi.description_en_2')}</Label>
              <Textarea
                value={form.excerpt_en}
                onChange={(e) => setForm((p) => ({ ...p, excerpt_en: e.target.value }))}
                rows={3}
                className="mt-1 border-[#d2d2d2] bg-white"
              />
            </div>
            <div>
              <Label className="text-xs text-[#5b5b5b]">
                {tKey(lang, 'adminUi.material_article_body_html')}
              </Label>
              <div className="mt-2 min-h-[280px] rounded-md border border-[#e5d9de] bg-[#fafafa] p-1">
                <MaterialHtmlEditor
                  value={form.body_html_en}
                  onChange={(html) => setForm((p) => ({ ...p, body_html_en: html }))}
                  onUploadImage={onUploadImage}
                  height={editorHeight}
                />
              </div>
            </div>
          </div>
        ) : null}

        {tab === 'es' ? (
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-[#5b5b5b]">{tKey(lang, 'adminUi.title_es')}</Label>
              <Input
                value={form.title_es}
                onChange={(e) => setForm((p) => ({ ...p, title_es: e.target.value }))}
                className="mt-1 h-10 border-[#d2d2d2] bg-white"
                autoComplete="off"
              />
            </div>
            <div>
              <Label className="text-xs text-[#5b5b5b]">{tKey(lang, 'adminUi.description_es_2')}</Label>
              <Textarea
                value={form.excerpt_es}
                onChange={(e) => setForm((p) => ({ ...p, excerpt_es: e.target.value }))}
                rows={3}
                className="mt-1 border-[#d2d2d2] bg-white"
              />
            </div>
            <div>
              <Label className="text-xs text-[#5b5b5b]">
                {tKey(lang, 'adminUi.material_article_body_html')}
              </Label>
              <div className="mt-2 min-h-[280px] rounded-md border border-[#e5d9de] bg-[#fafafa] p-1">
                <MaterialHtmlEditor
                  value={form.body_html_es}
                  onChange={(html) => setForm((p) => ({ ...p, body_html_es: html }))}
                  onUploadImage={onUploadImage}
                  height={editorHeight}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
