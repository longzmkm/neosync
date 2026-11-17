import { ArrowUpIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { ReactElement } from 'react';
import { useI18n } from '../providers/i18n-provider';
import { Button } from '../ui/button';

interface Props {
  href: string;
  target?: string;
  // Mostly used for side effects since the user click will result in the link being routed to
  onClick?(): void;
}

export default function UpgradeButton(props: Props): ReactElement {
  const { href, target, onClick } = props;
  const { t } = useI18n();

  return (
    <div>
      <Button type="button" variant="default" size="sm" onClick={onClick}>
        <Link
          href={href}
          target={target}
          className="flex flex-row gap-2 items-center"
        >
          <span>{t('upgrade.button')}</span>
          <ArrowUpIcon />
        </Link>
      </Button>
    </div>
  );
}
