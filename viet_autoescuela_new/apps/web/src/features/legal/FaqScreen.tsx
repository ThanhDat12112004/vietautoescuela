'use client';

import { Footer, Navbar } from '@/components/layout';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';
import { legalContentPanelClass, LegalPageChrome } from './legal-page-chrome';
import { LegalHubStrip } from './LegalHubStrip';
import { getFaqContent } from './legal-copy';

export function FaqScreen() {
  const { lang } = useLanguage();
  const faq = getFaqContent(lang);

  return (
    <div className="app-page flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex min-h-0 flex-1 flex-col bg-white">
        <LegalHubStrip pageTitle={faq.title} pageSubtitle={faq.intro} />
        <LegalPageChrome>
          <div className={legalContentPanelClass}>
            <div className="mb-4 rounded-xl border border-[#eddccf]/90 bg-[linear-gradient(145deg,#fffaf6_0%,#ffffff_100%)] px-4 py-3.5 shadow-[0_16px_34px_-30px_rgba(90,24,35,0.45)] sm:px-5">
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.13em] text-primary/80">
                Help Center
              </p>
              <p className="mt-1 text-[0.98rem] leading-relaxed text-foreground/80">
                Chọn câu hỏi để mở nội dung chi tiết. Các mục đã tối ưu theo trải nghiệm đọc trên mobile.
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-2.5">
              {faq.items.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="overflow-hidden rounded-xl border border-[#eadccd]/85 bg-white shadow-[0_16px_34px_-30px_rgba(90,24,35,0.58)] transition-all hover:border-primary/35 data-[state=open]:border-primary/45"
                >
                  <AccordionTrigger
                    className={cn(
                      'px-4 py-3.5 text-left text-[1rem] font-semibold leading-relaxed text-foreground hover:no-underline sm:px-5 sm:py-4 sm:text-[1.05rem]',
                      'hover:text-[#4a1824] [&[data-state=open]]:bg-[#fff9f5] [&[data-state=open]]:text-primary [&_svg]:text-primary/70'
                    )}
                  >
                    <span className="inline-flex items-start gap-2">
                      <span className="mt-[3px] inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1 text-[11px] font-semibold text-primary">
                        {i + 1}
                      </span>
                      <span>{item.q}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="border-t border-[#f2e7de] bg-[#fffdfb] px-4 pb-4 pt-3 text-[0.99rem] leading-[1.78] text-foreground/85 sm:px-5 sm:text-[1rem]">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </LegalPageChrome>
      </main>
      <Footer />
    </div>
  );
}
