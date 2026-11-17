import type { MessageKey } from '@/libs/i18n';

export function getMobileMainNav(
  accountName: string
): { titleKey: MessageKey; href: string }[] {
  return [
    // {
    //   title: 'Overview',
    //   href: `/`,
    // },
    {
      titleKey: 'nav.jobs',
      href: `/${accountName}/jobs`,
    },
    {
      titleKey: 'nav.runs',
      href: `/${accountName}/runs`,
    },
    {
      titleKey: 'nav.transformers',
      href: `/${accountName}/transformers`,
    },
    {
      titleKey: 'nav.connections',
      href: `/${accountName}/connections`,
    },
    {
      titleKey: 'nav.settings',
      href: `/${accountName}/settings`,
    },
  ];
}
