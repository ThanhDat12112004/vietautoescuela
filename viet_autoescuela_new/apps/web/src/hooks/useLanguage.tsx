import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Language } from '@/lib/api/types';
import { defaultLocale, fillTemplate, tKey, type I18nKey } from '@viet/i18n';

type LanguageContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  /** Luôn truyền `en` (tiếng Anh) — nếu thiếu, khi chọn English UI sẽ rơi về bản tiếng Tây Ban Nha (`es`). */
  t: (vi: string, es: string, en?: string) => string;
  tk: (key: I18nKey) => string;
  tkFill: (key: I18nKey, vars: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "vi",
  setLang: () => {},
  t: (vi) => vi,
  tk: (key) => key,
  tkFill: (key) => key,
});

export const LanguageProvider = ({
  children,
  initialLang = defaultLocale,
}: {
  children: React.ReactNode;
  initialLang?: Language;
}) => {
  const [lang, setLang] = useState<Language>(initialLang);

  const t = useCallback(
    (vi: string, es: string, en?: string) =>
      lang === "vi" ? vi : lang === "en" ? (en ?? es) : es,
    [lang]
  );
  const tk = useCallback((key: I18nKey) => tKey(lang, key), [lang]);
  const tkFill = useCallback(
    (key: I18nKey, vars: Record<string, string | number>) =>
      fillTemplate(tKey(lang, key), vars),
    [lang]
  );

  const value = useMemo(
    () => ({ lang, setLang, t, tk, tkFill }),
    [lang, t, tk, tkFill]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
