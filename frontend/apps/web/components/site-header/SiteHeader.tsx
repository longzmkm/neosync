import { getSystemAppConfig } from '@/app/api/config/config';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { getTranslations } from '@/libs/i18n/server';
import { ReactElement } from 'react';
import SupportDrawer from '../SupportDrawer';
import { AccountStatusHandler } from './AccountStatusHandler';
import AccountSwitcher from './AccountSwitcher';
import { LocaleSwitcher } from './LocaleSwitcher';
import { MainNav } from './MainNav';
import { MobileNav } from './MobileNav';
import { ModeToggle } from './ModeToggle';
import NeosyncVersion from './NeosyncVersion';
import { UserNav } from './UserNav';

export default async function SiteHeader(): Promise<ReactElement> {
  const systemAppConfig = getSystemAppConfig();
  const t = await getTranslations();

  return (
    <header className="supports-backdrop-blur:bg-background/60 sticky top-0 z-50 w-full border-b dark:border-b-gray-700 bg-background dark:hover:text-white backdrop-blur-sm">
      <div className="container flex h-14 items-center">
        <MainNav />
        <MobileNav />
        <div className="flex flex-1 justify-end items-center space-x-2">
          <AccountStatusHandler systemAppConfig={systemAppConfig} />
          {systemAppConfig.isAuthEnabled && <AccountSwitcher />}
          <SupportSheet
            title={t('header.support')}
            description={t('header.supportDesc')}
            closeLabel={t('header.close')}
          />
          <LocaleSwitcher />
          <ModeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}

function SupportSheet(props: {
  title: string;
  description: string;
  closeLabel: string;
}): ReactElement {
  const { title, description, closeLabel } = props;
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost">
          <QuestionMarkCircledIcon className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <div className="flex flex-col md:flex-row gap-2 items-center justify-between">
            <SheetTitle>{title}</SheetTitle>
            <div>
              <NeosyncVersion />
            </div>
          </div>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <SupportDrawer />
        <SheetFooter className="pt-20">
          <SheetClose asChild>
            <Button>{closeLabel}</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
