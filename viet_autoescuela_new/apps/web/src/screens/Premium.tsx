'use client';

import { Footer, Navbar } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatPremiumPlanDuration } from '@/features/premium';
import { fadeUp } from '@/features/index';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { submitPremiumPaymentFromMedia } from '@/lib/api/auth';
import { formatUserFacingApiError } from '@/lib/api/format-api-error';
import { getStoredAuth } from '@/lib/auth';
import {
  getPremiumBankLines,
  getPremiumBankOptions,
  getPremiumQrUrl,
  type PremiumBankId,
  type PremiumBankTab,
} from '@/lib/premium-banks';
import { buildMailtoHref, getPremiumInboxEmail } from '@/lib/premium-inbox';
import { resolveMediaUrl, uploadPremiumBillImage } from '@/lib/api/upload';
import { cn } from '@/lib/utils';
import type { I18nKey } from '@viet/i18n';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

const ctaPanelClass = 'rounded-xl border border-primary/20 bg-card p-3 shadow-sm sm:p-4';

type SubmittedSummary = {
  requestId: number;
  imageUrl: string;
  fullName: string;
  username: string;
  email: string;
  planLabel: string;
};

type Tk = (key: I18nKey) => string;
type TkFill = (key: I18nKey, vars: Record<string, string | number>) => string;
type PremiumMode = 'plans' | 'payment';
type PlanCard = {
  key: 'free' | '1m' | '3m';
  title: string;
  badge: string;
  duration: string;
  price: string;
  originalPrice?: string;
  discountTag?: string;
  caption: string;
  features: string[];
  selectable: boolean;
};

const PREMIUM_PRICE_BY_TAB = {
  vn: { '1m': 150000, '3m': 300000, currency: 'VND' as const, locale: 'vi-VN' },
  es: { '1m': 6, '3m': 12, currency: 'EUR' as const, locale: 'es-ES' },
};
const PREMIUM_CONTACT = {
  whatsappNumber: '642087268',
  whatsappUrl: 'https://wa.me/34642087268',
  zaloNumber: '0377858814',
  zaloUrl: 'https://zalo.me/0377858814',
};

function formatPremiumPrice(bankTab: PremiumBankTab, plan: '1m' | '3m') {
  const cfg = PREMIUM_PRICE_BY_TAB[bankTab];
  return new Intl.NumberFormat(cfg.locale, {
    style: 'currency',
    currency: cfg.currency,
    maximumFractionDigits: 0,
  }).format(cfg[plan]);
}

function formatPremiumRawPrice(bankTab: PremiumBankTab, amount: number) {
  const cfg = PREMIUM_PRICE_BY_TAB[bankTab];
  return new Intl.NumberFormat(cfg.locale, {
    style: 'currency',
    currency: cfg.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function buildPremiumPaymentMailto(
  inbox: string,
  s: Pick<SubmittedSummary, 'requestId' | 'imageUrl' | 'username' | 'email' | 'planLabel'>,
  _tk: Tk,
  _tkFill: TkFill
): string {
  const subject = `[Premium #${s.requestId}] ${s.email}`;
  const body = [
    `Yêu cầu Premium #${s.requestId}`,
    `Username: ${s.username}`,
    `Email: ${s.email}`,
    `Gói: ${s.planLabel}`,
    '',
    `Link ảnh biên lai: ${s.imageUrl}`,
  ].join('\n');
  return buildMailtoHref(inbox, { subject, body });
}

/** Browsers often break the user-gesture chain after `await`; double rAF gives mailto a fair shot. */
function scheduleOpenMailto(href: string) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.location.assign(href);
    });
  });
}

function normalizePlan(raw: string | null | undefined): '1m' | '3m' {
  return raw === '3m' ? '3m' : '1m';
}

export default function Premium({ mode = 'plans' }: { mode?: PremiumMode }) {
  const { tk, tkFill, lang } = useLanguage();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const requestedPlan = normalizePlan(searchParams.get('plan'));
  const authUser = getStoredAuth()?.user;
  const premiumInbox = useMemo(() => getPremiumInboxEmail(), []);
  const inboxMailtoHref = useMemo(
    () => buildMailtoHref(premiumInbox, { subject: tk('premiumFlow.mailSubjectLine') }),
    [premiumInbox, tk]
  );
  const [bankTab, setBankTab] = useState<PremiumBankTab>('vn');
  const bankOptions = useMemo(() => getPremiumBankOptions(bankTab), [bankTab]);
  const [bank, setBank] = useState<PremiumBankId>('vn_vcb');
  const qrSrc = useMemo(() => getPremiumQrUrl(bank), [bank]);
  const bankLines = useMemo(() => getPremiumBankLines(bank), [bank]);
  const showQr = bank === 'vn_vcb' && Boolean(qrSrc);
  const [plan, setPlan] = useState<'1m' | '3m'>(requestedPlan);
  const [selectedPlanCard, setSelectedPlanCard] = useState<'free' | '1m' | '3m' | null>(
    mode === 'payment' ? requestedPlan : null
  );
  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<SubmittedSummary | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const resultRef = useRef<HTMLDivElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const price1mText = useMemo(() => formatPremiumPrice(bankTab, '1m'), [bankTab]);
  const price3mText = useMemo(() => formatPremiumPrice(bankTab, '3m'), [bankTab]);
  const paymentAmountText = plan === '3m' ? price3mText : price1mText;
  const original3mPriceText = useMemo(() => {
    const p = PREMIUM_PRICE_BY_TAB[bankTab];
    return formatPremiumRawPrice(bankTab, p['1m'] * 3);
  }, [bankTab]);
  const planCards = useMemo<PlanCard[]>(() => {
    if (lang === 'es') {
      return [
        {
          key: 'free',
          title: 'Gratis',
          badge: 'FREE',
          duration: 'Forever',
          price: '€0',
          caption: 'Acceso a contenido gratuito',
          features: ['Materiales básicos', 'Tests básicos'],
          selectable: false,
        },
        {
          key: '1m',
          title: 'Premium 30 días',
          badge: 'Premium',
          duration: '30 DAYS',
          price: price1mText,
          caption: 'Acceso completo durante 30 días',
          features: [
            'Todo el material básico y Premium',
            'Todos los tests básicos y Premium',
            'Test random por tema',
          ],
          selectable: true,
        },
        {
          key: '3m',
          title: 'Premium 90 días',
          badge: 'Premium',
          duration: '90 DAYS',
          price: price3mText,
          originalPrice: original3mPriceText,
          discountTag: 'Oferta',
          caption: 'Acceso completo durante 90 días',
          features: [
            'Todo el material básico y Premium',
            'Todos los tests básicos y Premium',
            'Test random por tema',
            'Ahorro de costes',
          ],
          selectable: true,
        },
      ];
    }

    if (lang === 'en') {
      return [
        {
          key: 'free',
          title: 'Free',
          badge: 'FREE',
          duration: 'Forever',
          price: '€0',
          caption: 'Access free content',
          features: ['Basic materials', 'Basic quizzes'],
          selectable: false,
        },
        {
          key: '1m',
          title: 'Premium 30 days',
          badge: 'Premium',
          duration: '30 DAYS',
          price: price1mText,
          caption: 'Full access for 30 days',
          features: [
            'Full basic and Premium materials',
            'Full basic and Premium quizzes',
            'Random quiz by topic',
          ],
          selectable: true,
        },
        {
          key: '3m',
          title: 'Premium 90 days',
          badge: 'Premium',
          duration: '90 DAYS',
          price: price3mText,
          originalPrice: original3mPriceText,
          discountTag: 'Discount',
          caption: 'Full access for 90 days',
          features: [
            'Full basic and Premium materials',
            'Full basic and Premium quizzes',
            'Random quiz by topic',
            'Cost savings',
          ],
          selectable: true,
        },
      ];
    }

    return [
      {
        key: 'free',
        title: 'Miễn phí',
        badge: 'FREE',
        duration: 'Vĩnh viễn',
        price: '0đ',
        caption: 'Truy cập nội dung miễn phí',
        features: ['Tài liệu cơ bản', 'Bài thi cơ bản'],
        selectable: false,
      },
      {
        key: '1m',
        title: 'Premium 30 ngày',
        badge: 'Premium',
        duration: '30 DAYS',
        price: price1mText,
        caption: 'Mở khóa đầy đủ trong 30 ngày',
        features: [
          'Đầy đủ tài liệu cơ bản và Premium',
          'Đầy đủ bài thi cơ bản và Premium',
          'Random bài thi theo chủ đề',
        ],
        selectable: true,
      },
      {
        key: '3m',
        title: 'Premium 90 ngày',
        badge: 'Premium',
        duration: '90 DAYS',
        price: price3mText,
        originalPrice: original3mPriceText,
        discountTag: 'Ưu đãi giảm giá',
        caption: 'Mở khóa đầy đủ trong 90 ngày',
        features: [
          'Đầy đủ tài liệu cơ bản và Premium',
          'Đầy đủ bài thi cơ bản và Premium',
          'Random bài thi theo chủ đề',
          'Tiết kiệm chi phí',
        ],
        selectable: true,
      },
    ];
  }, [lang, original3mPriceText, price1mText, price3mText]);
  const transferNoteValue = useMemo(() => {
    if (!authUser) return tk('premiumFlow.emailNameHint');
    const username = String(authUser.username || '').trim() || 'unknown';
    const fullName = String(authUser.full_name || '').trim() || username;
    const planLabel = formatPremiumPlanDuration(tk, plan);
    return `${username} - ${fullName} - ${planLabel}`;
  }, [authUser, plan, tk]);
  const isPremiumPlanSelected = selectedPlanCard === '1m' || selectedPlanCard === '3m';
  const shouldShowPayment = isPremiumPlanSelected;
  const contentWrapperClass =
    mode === 'payment'
      ? 'mt-2 w-full max-w-none space-y-3 px-3 pb-2 text-left sm:px-4 lg:px-5'
      : 'mt-3 w-full max-w-none space-y-4 px-3 pb-4 text-left sm:px-4 lg:px-5';

  useEffect(() => {
    if (!bankOptions.length) return;
    setBank((prev) => (bankOptions.some((opt) => opt.id === prev) ? prev : bankOptions[0].id));
  }, [bankOptions]);

  useEffect(() => {
    if (mode !== 'payment') return;
    const normalized = normalizePlan(searchParams.get('plan'));
    setPlan(normalized);
    setSelectedPlanCard(normalized);
  }, [mode, searchParams]);

  useEffect(() => {
    if (!submitted || !resultRef.current) return;
    resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [submitted]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const auth = getStoredAuth()?.user;
    if (!file) {
      toast({
        title: tk('premiumFlow.receiptRequired'),
        variant: 'destructive',
      });
      return;
    }
    if (!auth?.email) {
      toast({
        title: tk('premiumFlow.needLogin'),
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const uploaded = await uploadPremiumBillImage(file);
      const key = String(uploaded.key || '').trim();
      const rawCdn = String(uploaded.cdn_url || '').trim();
      const cdnPath = rawCdn.startsWith('/') ? rawCdn : key ? `/media/static/${key}` : '';

      const okPath =
        cdnPath.startsWith('/media/static/premium-bills/') ||
        cdnPath.startsWith('/media/static/questions/');
      if (!key || !okPath) {
        throw new Error(tk('premiumFlow.errorGeneric'));
      }

      const { id: requestId } = await submitPremiumPaymentFromMedia({
        plan_code: plan,
        bill_media_key: key,
        bill_cdn_url: cdnPath,
        skip_server_email: true,
      });

      const imageUrl = resolveMediaUrl(cdnPath);
      const planDurationLabel = formatPremiumPlanDuration(tk, plan);
      const fullName = (auth.full_name || '').trim() || '—';

      const mailSummary = {
        requestId,
        imageUrl,
        username: auth.username,
        email: auth.email,
        planLabel: planDurationLabel,
      };
      const mailHref = buildPremiumPaymentMailto(premiumInbox, mailSummary, tk, tkFill);

      setSubmitted({
        requestId,
        imageUrl,
        fullName,
        username: auth.username,
        email: auth.email,
        planLabel: planDurationLabel,
      });
      setFile(null);
      setFileKey((k) => k + 1);

      scheduleOpenMailto(mailHref);

      toast({
        title: tk('premium.requestReceivedTitle'),
        description: tk('premium.requestReceivedHint'),
      });
    } catch (err) {
      toast({
        title: tk('premiumFlow.errorGeneric'),
        description: formatUserFacingApiError(lang, err instanceof Error ? err : String(err)),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-page flex min-h-screen flex-col bg-white">
      <Navbar />
      <section
        className="relative w-full flex-1 overflow-x-hidden border-t border-primary/10 bg-white"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="relative z-[1] flex w-full max-w-none flex-col items-center px-0 py-0 text-center"
        >
          <div className="w-full border-b-2 border-primary/25 bg-card text-left">
            <div className="w-full px-3 py-4 sm:px-4 md:py-5 lg:px-5">
              <div className="w-full border-l-[3px] border-primary/60 pl-3 sm:pl-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/80">
                  {tk('nav.premium')}
                </p>
                <h1 className="mt-1.5 font-display text-[1.65rem] font-bold leading-tight tracking-tight text-foreground md:text-[2rem]">
                  {tk('premium.title')}
                </h1>
                <p className="mt-2 w-full text-[15px] leading-relaxed text-foreground/72 md:text-[0.97rem]">
                  {tk('premium.subtitle')}
                </p>
              </div>
            </div>
          </div>

          <div className={contentWrapperClass}>
            <div className="py-1">
              <div className="mt-1.5 grid items-end gap-2.5 md:grid-cols-3">
                {planCards.map((card) => {
                  const isSelected = card.key === selectedPlanCard;
                  const isPremiumCard = card.key !== 'free';
                  const isFreeCard = card.key === 'free';
                  const isMiddleCard = card.key === '1m';
                  const isLongPlanCard = card.key === '3m';
                  const headerClass = isFreeCard
                    ? 'bg-gradient-to-br from-[#c05a74] via-[#ad4762] to-[#973852] text-white'
                    : isMiddleCard
                      ? 'bg-gradient-to-br from-[#a12847] via-[#8d1f3d] to-[#761832] text-white'
                      : 'bg-gradient-to-br from-[#8a1636] via-[#73102b] to-[#5e0d23] text-white';
                  const bodyClass = isFreeCard
                    ? 'bg-[#fdf8fa]'
                    : isMiddleCard
                      ? 'bg-[#f9eef2]'
                      : 'bg-[#f5e8ed]';
                  const footerButtonClass = isFreeCard
                    ? 'bg-[#b04e67] hover:bg-[#9a4259]'
                    : isMiddleCard
                      ? 'bg-[#8d203f] hover:bg-[#761a35]'
                      : 'bg-[#7a1535] hover:bg-[#66122d]';
                  const cardBorderClass = isFreeCard
                    ? 'border-[#e3cad3]'
                    : isMiddleCard
                      ? 'border-[#d4a9b8]'
                      : 'border-[#bf8fa0]';
                  return (
                    <div
                      key={card.key}
                      className={cn(
                        'relative overflow-hidden rounded-xl border bg-white text-left shadow-[0_6px_20px_rgba(122,21,53,0.08)] transition-all',
                        cardBorderClass,
                        isSelected && 'border-[#7a1530] ring-2 ring-[#7a1530]/40'
                      )}
                    >
                      <div className={cn('px-4 pb-3 pt-4', headerClass)}>
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]',
                            isPremiumCard ? 'bg-white/25 text-white' : 'bg-white/30 text-white'
                          )}
                        >
                          {card.badge}
                        </span>
                        <p className="mt-2 text-[1.45rem] font-semibold leading-tight">{card.title}</p>
                        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/90">
                          {card.duration}
                        </p>
                        {card.originalPrice ? (
                          <p className="mt-2 text-sm font-semibold text-white/75 line-through">
                            {card.originalPrice}
                          </p>
                        ) : null}
                        {card.discountTag ? (
                          <div className="mt-2">
                            <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#7a1530]">
                              {card.discountTag}
                            </span>
                          </div>
                        ) : null}
                        <p className="mt-2 text-[2.05rem] font-bold leading-none">{card.price}</p>
                      </div>

                      <div className={cn('px-4 py-3', bodyClass)}>
                        <p className="text-xs font-medium text-[#5f4d53]">{card.caption}</p>
                        <ul className="mt-2 space-y-1.5 text-xs text-[#4f4046]">
                          {card.features.map((feature) => (
                            <li key={feature}>- {feature}</li>
                          ))}
                        </ul>
                      </div>

                      <div className={cn('flex justify-center border-t border-[#d9c6ce] px-4 py-3 text-center', bodyClass)}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPlanCard(card.key);
                            if (card.key === 'free') return;
                            setPlan(card.key);
                            setSubmitted(null);
                            setPaymentDialogOpen(true);
                          }}
                          className={cn(
                            'inline-flex min-w-[8.5rem] items-center justify-center rounded-md px-4 py-2 text-center text-xs font-bold uppercase tracking-wide text-white shadow-sm',
                            card.key === 'free' && 'opacity-95',
                            footerButtonClass
                          )}
                        >
                          {isFreeCard ? 'Đăng ký' : 'Mua ngay'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {selectedPlanCard === 'free' ? (
                <p className="mt-3 text-xs text-foreground/70">
                  Gói miễn phí không cần thanh toán. Bạn có thể dùng ngay sau khi đăng nhập.
                </p>
              ) : null}
            </div>

            <Dialog open={paymentDialogOpen && shouldShowPayment} onOpenChange={setPaymentDialogOpen}>
              <DialogContent className="max-h-[88vh] max-w-4xl overflow-y-auto border border-[#e5d7de] bg-[linear-gradient(170deg,#fff_0%,#fff8fb_45%,#fff_100%)] p-0">
                <DialogHeader className="border-b border-[#eadce2] px-6 py-4">
                  <DialogTitle className="text-xl font-bold tracking-tight text-[#7a1530]">
                    Thanh toán Premium
                  </DialogTitle>
                  <p className="text-sm text-foreground/70">
                    Chuyển khoản theo thông tin bên dưới, sau đó tải biên lai để gửi xác nhận.
                  </p>
                </DialogHeader>
                <div className="space-y-4 px-6 pb-6 pt-4">
                  <Tabs
                    value={bankTab}
                    onValueChange={(v) => setBankTab(v as PremiumBankTab)}
                    className="w-full"
                  >
                    <TabsList className="mb-1 grid h-auto min-h-11 w-full grid-cols-2 gap-2 rounded-xl border border-[#e3cfd7] bg-[#fff7fa] p-1.5 shadow-sm">
                      <TabsTrigger value="vn" className="rounded-lg border border-[#e5d3da] bg-white px-2 py-2 text-center text-xs font-semibold leading-tight text-[#6b1b31] transition-colors data-[state=active]:border-[#7a1530] data-[state=active]:bg-[#7a1530] data-[state=active]:text-white data-[state=active]:shadow-sm sm:text-sm">
                        {tk('premium.bankTabVn')}
                      </TabsTrigger>
                      <TabsTrigger value="es" className="rounded-lg border border-[#e5d3da] bg-white px-2 py-2 text-center text-xs font-semibold leading-tight text-[#6b1b31] transition-colors data-[state=active]:border-[#7a1530] data-[state=active]:bg-[#7a1530] data-[state=active]:text-white data-[state=active]:shadow-sm sm:text-sm">
                        {tk('premium.bankTabEs')}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  {bankTab === 'es' ? (
                    <p className="text-xs text-foreground/65">
                      Tài khoản Tây Ban Nha đang hỗ trợ chuyển khoản.
                    </p>
                  ) : null}
                  {bankOptions.length > 1 ? (
                    <div className="grid grid-cols-2 gap-2 rounded-xl border border-[#e3cfd7] bg-[#fff7fa] p-1.5 shadow-sm">
                      {bankOptions.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setBank(opt.id)}
                          className={cn(
                            'rounded-lg border border-[#e5d3da] bg-white px-3 py-2 text-xs font-semibold text-[#6b1b31] transition-colors sm:text-sm',
                            bank === opt.id
                              ? 'border-[#7a1530] bg-[#7a1530] text-white shadow-sm'
                              : 'hover:border-primary/35 hover:bg-white'
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <div className={cn('grid gap-4', showQr ? 'md:grid-cols-[1.02fr_1.35fr]' : 'grid-cols-1')}>
                    {showQr ? (
                      <div className="rounded-2xl border border-[#e8d7de] bg-white p-4 shadow-sm">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#7a1530]/80">{tk('premium.qr')}</p>
                        <div className="mt-3 flex justify-center overflow-hidden rounded-xl border border-[#f0e5ea] bg-white p-2">
                          <img src={qrSrc} alt="QR" className="block h-auto w-full max-w-[420px] object-contain" />
                        </div>
                      </div>
                    ) : null}
                    <div className={cn('rounded-2xl border border-[#e8d7de] bg-white p-4 shadow-sm', !showQr && 'md:col-span-2')}>
                      <ul className="space-y-3 text-sm text-foreground/90">
                        <li className="rounded-xl px-3 py-2.5">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground/65">
                            Số tiền cần thanh toán
                          </p>
                          <p className="mt-1 text-[1.35rem] font-bold leading-none text-foreground">
                            {paymentAmountText}
                          </p>
                        </li>
                        <li>
                          <strong className="text-[15px] text-foreground">{tk('premium.inboxEmail')}</strong>
                          <a href={inboxMailtoHref} className="mt-1 block break-all font-medium text-[#7a1530] underline decoration-[#caa56b]/55 underline-offset-2 hover:text-[#5f1025]">
                            {premiumInbox}
                          </a>
                        </li>
                        <li className="border-t border-[#efe4e8] pt-2.5">
                          <strong className="text-[15px] text-foreground">{tk('premium.bankAccountHeading')}</strong>
                          <ul className="mt-2 list-disc space-y-1.5 pl-4 text-foreground/90">
                            {bankLines.map((line, idx) => (
                              <li key={idx} className="break-words">{line}</li>
                            ))}
                          </ul>
                        </li>
                        <li className="border-t border-[#efe4e8] pt-2.5">
                          <strong className="text-foreground">{tk('premium.transferNote')}:</strong> {transferNoteValue}
                        </li>
                      </ul>
                    </div>
                  </div>
                  {submitted ? (
                    <div ref={resultRef} className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 ring-1 ring-emerald-100" role="status">
                      <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-primary/80">{tk('premium.requestReceivedTitle')}</p>
                      <div className="space-y-2 rounded-xl border border-primary/20 bg-card px-4 py-3 text-sm text-foreground/90">
                        <p><span className="text-foreground/65">{tk('premium.labelOrderId')}: </span><span className="font-semibold text-foreground">#{submitted.requestId}</span></p>
                        <p><span className="text-foreground/65">{tk('premium.labelPlan')}: </span>{submitted.planLabel}</p>
                        <a href={submitted.imageUrl} target="_blank" rel="noopener noreferrer" className="block break-all font-mono text-[13px] text-[#7a1530] underline decoration-[#caa56b]/50 underline-offset-2 hover:text-[#5f1025]">{submitted.imageUrl}</a>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={(e) => void onSubmit(e)} className="space-y-4 rounded-2xl border border-[#e8d7de] bg-white p-4 shadow-sm">
                      <p className="text-center text-xs leading-relaxed text-foreground/65">{tk('premium.formHintOneStep')}</p>
                      <div className="space-y-2">
                        <Label htmlFor="premium-bill" className="text-sm font-medium text-foreground">{tk('premiumFlow.receiptPhoto')}</Label>
                        <input
                          key={fileKey}
                          id="premium-bill"
                          type="file"
                          accept="image/*"
                          className="block w-full cursor-pointer rounded-xl border border-dashed border-primary/30 bg-card px-3 py-3 text-sm text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                      </div>
                      <Button type="submit" disabled={submitting} size="lg" className="h-11 w-full rounded-lg border border-[#7a1530]/20 bg-[#7a1530] px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#671228] sm:text-sm">
                        <Mail className="mr-2 h-4 w-4 shrink-0 opacity-95" aria-hidden />
                        {submitting ? tk('premiumFlow.savingRequest') : 'Gửi đơn'}
                      </Button>
                    </form>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>
      </section>
      <Footer />
    </div>
  );
}
