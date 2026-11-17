'use client';

import {
  LOCALE_COOKIE_NAME,
  translate,
  type Locale,
  type MessageKey,
  type Translator,
  type TranslateVars,
} from '@/libs/i18n';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactElement,
  type ReactNode,
} from 'react';

interface I18nContextValue {
  locale: Locale;
  t: Translator;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}): ReactElement {
  const t = useCallback(
    (key: MessageKey, vars?: TranslateVars) => translate(locale, key, vars),
    [locale]
  );

  const setLocale = useCallback((next: Locale) => {
    document.cookie = `${LOCALE_COOKIE_NAME}=${next}; path=/; max-age=31536000; samesite=lax`;
    window.location.reload();
  }, []);

  const value = useMemo(
    () => ({ locale, t, setLocale }),
    [locale, t, setLocale]
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
}
