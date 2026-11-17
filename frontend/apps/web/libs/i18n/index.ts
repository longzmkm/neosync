import { en, zhCN, type MessageKey } from './messages';

export type { MessageKey };
export type Locale = 'en' | 'zh-CN';
export type TranslateVars = Record<string, string | number>;
export type Translator = (key: MessageKey, vars?: TranslateVars) => string;

export const LOCALE_COOKIE_NAME = 'NEOSYNC_LOCALE';
export const DEFAULT_LOCALE: Locale = 'zh-CN';

export const LOCALE_OPTIONS: { value: Locale; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'zh-CN', label: '简体中文' },
];

const dictionaries: Record<Locale, Record<MessageKey, string>> = {
  en,
  'zh-CN': zhCN,
};

export function isLocale(value: string | undefined | null): value is Locale {
  return value === 'en' || value === 'zh-CN';
}

export function translate(
  locale: Locale,
  key: MessageKey,
  vars?: TranslateVars
): string {
  const message = dictionaries[locale][key] ?? en[key];
  if (!vars) {
    return message;
  }
  return message.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = vars[name];
    return value === undefined ? match : String(value);
  });
}
