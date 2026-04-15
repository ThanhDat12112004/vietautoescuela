'use client';

import { Footer, Navbar } from '@/components/layout';
import { useLanguage } from '@/hooks/useLanguage';
import { legalContentPanelClass, legalProseClass, LegalPageChrome } from './legal-page-chrome';
import { LegalHubStrip } from './LegalHubStrip';
import { getLegalDocument, type LegalDocId } from './legal-copy';

function stripNumericPrefix(heading: string) {
  return heading.replace(/^\s*\d+(?:\.\d+)*\.?\s*/u, '').trim();
}

function isLeadInLine(text: string) {
  const t = text.trim();
  return t.endsWith(':') && t.length <= 80;
}

function capitalizeLeadingCharacter(text: string) {
  const trimmedStart = text.trimStart();
  if (!trimmedStart) return text;
  const first = trimmedStart.charAt(0);
  const upper = first.toLocaleUpperCase();
  if (first === upper) return text;
  const leadingSpaceCount = text.length - trimmedStart.length;
  return `${text.slice(0, leadingSpaceCount)}${upper}${trimmedStart.slice(1)}`;
}

function splitParagraphBlocks(paragraphs: string[]) {
  const blocks: Array<{ type: 'p'; text: string } | { type: 'ul'; items: string[] }> = [];
  let bulletBuffer: string[] = [];

  const flushBullets = () => {
    if (bulletBuffer.length) {
      blocks.push({ type: 'ul', items: bulletBuffer });
      bulletBuffer = [];
    }
  };

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (trimmed.startsWith('•')) {
      bulletBuffer.push(trimmed.replace(/^•\s*/, ''));
      continue;
    }
    flushBullets();
    blocks.push({ type: 'p', text: paragraph });
  }
  flushBullets();
  return blocks;
}

export function LegalDocScreen({ docId }: { docId: LegalDocId }) {
  const { lang, tk } = useLanguage();
  const doc = getLegalDocument(docId, lang);

  return (
    <div className="app-page flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex min-h-0 flex-1 flex-col bg-white">
        <LegalHubStrip pageTitle={doc.title} pageSubtitle={tk('footer.legalIntro')} />
        <LegalPageChrome>
          <div className={legalContentPanelClass}>
            <article className={legalProseClass}>
              {doc.intro ? (
                <p className="!mt-0 leading-relaxed text-foreground/90">
                  {doc.intro}
                </p>
              ) : null}
              <div className="mt-5 space-y-4 sm:space-y-5">
                {doc.sections.map((sec, idx) => (
                  <section key={`${sec.heading}-${idx}`} className="px-0 py-0">
                    <div className="mb-2 flex items-center gap-2.5">
                      <div className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-semibold text-primary">
                        {idx + 1}
                      </div>
                      <h2 className="!m-0">{stripNumericPrefix(sec.heading)}</h2>
                    </div>
                    <div className="space-y-2.5">
                      {splitParagraphBlocks(sec.paragraphs).map((block, j) =>
                        block.type === 'p' ? (
                          <p
                            key={`${sec.heading}-p-${j}`}
                            className={isLeadInLine(block.text) ? 'font-semibold text-[#5a1a2b]' : undefined}
                          >
                            {capitalizeLeadingCharacter(block.text)}
                          </p>
                        ) : (
                          <ul
                            key={`${sec.heading}-ul-${j}`}
                            className="my-3 list-outside list-disc space-y-2.5 pl-6 text-[1rem] leading-[1.8] text-foreground/92 marker:text-[#8f223d]"
                          >
                            {block.items.map((item) => (
                              <li key={`${sec.heading}-${item}`}>
                                <span className="block">{capitalizeLeadingCharacter(item)}</span>
                              </li>
                            ))}
                          </ul>
                        )
                      )}
                    </div>
                  </section>
                ))}
              </div>
            </article>
          </div>
        </LegalPageChrome>
      </main>
      <Footer />
    </div>
  );
}
