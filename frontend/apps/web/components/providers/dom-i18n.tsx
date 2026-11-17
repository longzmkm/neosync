'use client';

import { useI18n } from '@/components/providers/i18n-provider';
import { domTranslations } from '@/libs/i18n/dom-dict';
import { useEffect } from 'react';

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA']);
const ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];

const normalize = (value: string): string => value.replace(/\s+/g, ' ').trim();

function isSkipped(el: Element | null): boolean {
  if (!el) {
    return true;
  }
  if (SKIP_TAGS.has(el.tagName)) {
    return true;
  }
  return !!el.closest('[data-no-i18n]');
}

export function DomI18n(): null {
  const { locale } = useI18n();

  useEffect(() => {
    if (locale !== 'zh-CN') {
      return;
    }
    const root = document.body;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const apply = (): void => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        const el = (node as Text).parentElement;
        const raw = node.nodeValue ?? '';
        const key = normalize(raw);
        if (key && !isSkipped(el)) {
          const translated = domTranslations[key];
          if (translated && translated !== key) {
            node.nodeValue = translated;
          }
        }
        node = walker.nextNode();
      }
      root.querySelectorAll('*').forEach((el) => {
        if (isSkipped(el)) {
          return;
        }
        for (const attr of ATTRS) {
          const value = el.getAttribute(attr);
          if (!value) {
            continue;
          }
          const translated = domTranslations[normalize(value)];
          if (translated) {
            el.setAttribute(attr, translated);
          }
        }
      });
    };

    const schedule = (): void => {
      if (timer) {
        return;
      }
      timer = setTimeout(() => {
        timer = undefined;
        apply();
      }, 30);
    };

    apply();
    const observer = new MutationObserver(schedule);
    observer.observe(root, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [locale]);

  return null;
}
