'use client';

import { cn } from '@/lib/utils';

const sectionClass = 'relative w-full flex-1 overflow-x-hidden bg-white';

export const legalContentPanelClass =
  'w-full max-w-none rounded-none border-0 bg-transparent px-2 pb-6 pt-4 shadow-none sm:px-3 sm:pb-7 sm:pt-5 lg:px-4';

export const legalProseClass =
  'prose prose-neutral max-w-none text-foreground ' +
  'prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-[#471522] ' +
  'prose-h2:mt-0 prose-h2:mb-1.5 prose-h2:text-[1.08rem] prose-h2:font-semibold ' +
  'prose-p:my-2.5 prose-p:text-[1rem] prose-p:leading-[1.78] prose-p:text-foreground/90 sm:prose-p:text-[1.03rem]';

type LegalPageChromeProps = {
  children: React.ReactNode;
  className?: string;
};

export function LegalPageChrome({ children, className }: LegalPageChromeProps) {
  return (
    <section className={cn(sectionClass, 'flex min-h-0 flex-1 flex-col')}>
      <div className={cn('relative z-[1] w-full max-w-none flex-1 px-0 pb-0 pt-0', className)}>
        {children}
      </div>
    </section>
  );
}
