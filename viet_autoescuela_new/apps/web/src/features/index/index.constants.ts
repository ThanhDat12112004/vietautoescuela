export const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

/** Nền khung minh họa (carousel bài viết, cột icon thẻ quiz) — hồng đất rất nhạt */
export const indexPaleImageFrameClass =
  'bg-[radial-gradient(circle_at_50%_24%,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0)_62%),linear-gradient(180deg,#faf5f6_0%,#f5eaec_52%,#efe3e6_100%)]';

/** Nền khung minh họa thẻ quiz nổi bật — dusty rose nhẹ (giống mockup) */
export const indexFeaturedQuizImageFrameClass =
  'bg-[radial-gradient(circle_at_50%_22%,rgba(255,255,255,0.38)_0%,rgba(255,255,255,0)_60%),linear-gradient(180deg,#e8d4d8_0%,#d8b4b4_55%,#cfaaaf_100%)]';

/** Lớp vignette rất nhẹ trên khung featured — giữ chiều sâu, không làm tối màu nền */
export const indexFeaturedQuizImageVignetteClass =
  'bg-[linear-gradient(180deg,rgba(75,18,32,0.12)_0%,rgba(100,28,48,0.06)_50%,rgba(120,40,62,0.03)_100%)]';

export const indexViewAllButtonClass =
  'brand-cta-primary h-11 gap-2 rounded-full border-transparent px-6 text-sm font-semibold text-brand-onCta shadow-brand-cta transition hover:opacity-[0.94] focus-visible:ring-2 focus-visible:ring-primary/45 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-brand-onCta [&_svg]:transition-transform hover:[&_svg]:translate-x-0.5';

/** Link chữ «Mở →» thẻ nhóm đề — không nền, không viền. */
export const indexCardOpenChipClass =
  'inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary underline-offset-2 transition-colors group-hover:text-primary group-hover:underline sm:text-[0.9375rem] [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:text-primary [&_svg]:transition-transform group-hover:[&_svg]:translate-x-0.5 sm:[&_svg]:size-4';

/** Link chữ «Mở →» thẻ tài liệu — không nền, không viền; mt-auto giữ căn đáy thẻ. */
export const indexMaterialsOpenButtonClass =
  'mt-auto inline-flex w-fit shrink-0 items-center gap-1 text-sm font-semibold text-primary underline-offset-2 transition-colors group-hover:text-primary group-hover:underline sm:text-[0.9375rem] [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:text-primary [&_svg]:transition-transform group-hover:[&_svg]:translate-x-0.5 sm:[&_svg]:size-4';

/** Nút chính hero (gradient cam–đỏ) — dùng lại ở CTA cuối trang khi nền tối */
export const heroPrimaryCtaButtonClass =
  'inline-flex h-12 w-full items-center justify-center gap-2 rounded-[12px] border-0 px-6 py-3 text-[1.05rem] font-semibold !text-white shadow-[0_8px_22px_rgba(255,77,79,0.38)] transition-all duration-200 !bg-[linear-gradient(135deg,#ff4d4f_0%,#ff7a18_100%)] hover:-translate-y-0.5 hover:!bg-[linear-gradient(135deg,#ff5a5c_0%,#ff851e_100%)] hover:shadow-[0_12px_28px_rgba(255,77,79,0.45)] focus-visible:ring-2 focus-visible:ring-white/45 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent active:translate-y-0 sm:h-11 sm:w-auto sm:text-base [&_svg]:h-5 [&_svg]:w-5 [&_svg]:shrink-0';

/** Nút phụ hero (kính mờ, chữ trắng) — cùng nền tối */
export const heroSecondaryGlassCtaButtonClass =
  'inline-flex h-12 w-full items-center justify-center gap-2 rounded-[12px] border border-white/30 !bg-white/10 px-6 py-3 text-[1.02rem] font-semibold !text-white shadow-none ring-0 backdrop-blur-[10px] transition-all duration-200 hover:!bg-white/20 hover:!text-white hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)] focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:h-11 sm:w-auto sm:text-base [&_svg]:h-5 [&_svg]:w-5 [&_svg]:shrink-0';

/** CTA cuối trang (phiên bản cũ — gradient đỏ hồng đậm); giữ export nếu chỗ khác còn dùng */
export const ctaPrimaryGlowButtonClass =
  'h-12 w-full rounded-xl border border-[#ffd6de]/55 bg-[linear-gradient(135deg,#a50f38_0%,#c81f55_45%,#e23567_100%)] text-base font-bold text-[#fff4f7] shadow-[0_14px_34px_rgba(167,17,57,0.34)] transition-all duration-200 hover:brightness-110 hover:shadow-[0_18px_42px_rgba(167,17,57,0.42)] [&_svg]:h-5 [&_svg]:w-5';

export const ctaSecondaryGlowButtonClass =
  'h-12 w-full rounded-xl border-2 border-[#d77a93]/55 bg-[linear-gradient(180deg,rgba(255,244,248,0.96)_0%,rgba(255,236,242,0.88)_100%)] text-base font-semibold text-[#851738] shadow-[0_8px_22px_rgba(142,28,58,0.14)] transition-all duration-200 hover:border-[#c95877]/70 hover:bg-[linear-gradient(180deg,rgba(255,246,249,1)_0%,rgba(255,229,237,0.96)_100%)] hover:text-[#73112d] hover:shadow-[0_12px_26px_rgba(142,28,58,0.22)] [&_svg]:h-5 [&_svg]:w-5';
