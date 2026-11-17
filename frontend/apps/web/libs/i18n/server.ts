import { cookies } from 'next/headers';
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  isLocale,
  translate,
  type Locale,
  type MessageKey,
  type TranslateVars,
} from './index';

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE_NAME)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export type ServerTranslator = (
  key: MessageKey,
  vars?: TranslateVars
) => string;

export async function getTranslations(): Promise<ServerTranslator> {
  const locale = await getLocale();
  return (key, vars) => translate(locale, key, vars);
}
