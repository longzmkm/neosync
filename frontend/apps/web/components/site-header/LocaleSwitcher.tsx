'use client';

import { useI18n } from '@/components/providers/i18n-provider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LOCALE_OPTIONS } from '@/libs/i18n';
import { CheckIcon, GlobeIcon } from '@radix-ui/react-icons';
import { ReactElement } from 'react';

export function LocaleSwitcher(): ReactElement {
  const { locale, t, setLocale } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title={t('locale.label')}
          aria-label={t('locale.label')}
        >
          <GlobeIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t('locale.label')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LOCALE_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setLocale(option.value)}
          >
            <span className="flex-1">{option.label}</span>
            {option.value === locale && <CheckIcon className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
