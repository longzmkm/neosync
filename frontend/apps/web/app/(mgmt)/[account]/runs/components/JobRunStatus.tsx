import Spinner from '@/components/Spinner';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/libs/utils';
import { useI18n } from '@/components/providers/i18n-provider';
import { JobRunStatus as JobRunStatusEnum } from '@neosync/sdk';
import {
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircledIcon,
} from '@radix-ui/react-icons';
import { ReactElement } from 'react';

interface Props {
  status?: JobRunStatusEnum;
  containerClassName?: string;
  badgeClassName?: string;
}

const sharedContainerClassName = 'flex flex-row gap-3 px-2 max-w-28';
const sharedBadgeClassName = 'flex flex-row gap-3';

export default function JobRunStatus(props: Props): ReactElement {
  const { status, containerClassName, badgeClassName } = props;
  const { t } = useI18n();

  switch (status) {
    case JobRunStatusEnum.ERROR:
      return (
        <div className={cn(sharedContainerClassName, containerClassName)}>
          <Badge
            variant="destructive"
            className={cn(sharedBadgeClassName, badgeClassName)}
          >
            <div className="flex flex-row items-center gap-1">
              <ExclamationTriangleIcon className="w-3 h-3" />
              <p>{t('runStatus.error')}</p>
            </div>
          </Badge>
        </div>
      );
    case JobRunStatusEnum.COMPLETE:
      return (
        <div className={cn(sharedContainerClassName, containerClassName)}>
          <Badge
            variant="success"
            className={cn(sharedBadgeClassName, badgeClassName)}
          >
            <CheckIcon className="w-3 h-3" /> <p>{t('runStatus.complete')}</p>
          </Badge>
        </div>
      );
    case JobRunStatusEnum.FAILED:
      return (
        <div className={cn(sharedContainerClassName, containerClassName)}>
          <Badge
            variant="destructive"
            className={cn(sharedBadgeClassName, badgeClassName)}
          >
            <ExclamationTriangleIcon className="w-3 h-3" />{' '}
            <p>{t('runStatus.failed')}</p>
          </Badge>
        </div>
      );
    case JobRunStatusEnum.RUNNING:
      return (
        <div className={cn(sharedContainerClassName, containerClassName)}>
          <Badge
            className={cn(
              'bg-blue-600 hover:bg-blue-500',
              sharedBadgeClassName,
              badgeClassName
            )}
          >
            <Spinner className="w-3 h-3" /> <p>{t('runStatus.running')}</p>
          </Badge>
        </div>
      );
    case JobRunStatusEnum.PENDING:
      return (
        <div className={cn(sharedContainerClassName, containerClassName)}>
          <Badge
            className={cn(
              'bg-purple-600  hover:bg-purple-500',
              sharedBadgeClassName,
              badgeClassName
            )}
          >
            <Spinner className="w-3 h-3" /> <p>{t('runStatus.pending')}</p>
          </Badge>
        </div>
      );
    case JobRunStatusEnum.TERMINATED:
      return (
        <div className={cn(sharedContainerClassName, containerClassName)}>
          <Badge
            className={cn(
              'bg-gray-600  hover:bg-gray-500',
              sharedBadgeClassName,
              badgeClassName
            )}
          >
            <ExclamationTriangleIcon className="w-3 h-3" />{' '}
            <p>{t('runStatus.terminated')}</p>
          </Badge>
        </div>
      );
    case JobRunStatusEnum.CANCELED:
      return (
        <div className={cn(sharedContainerClassName, containerClassName)}>
          <Badge
            className={cn(
              'bg-gray-600  hover:bg-gray-500',
              sharedBadgeClassName,
              badgeClassName
            )}
          >
            <ExclamationTriangleIcon className="w-3 h-3" />{' '}
            <p>{t('runStatus.canceled')}</p>
          </Badge>
        </div>
      );
    case JobRunStatusEnum.TIMED_OUT:
      return (
        <div className={cn(sharedContainerClassName, containerClassName)}>
          <Badge
            className={cn(
              'bg-yellow-600  hover:bg-yellow-500',
              sharedBadgeClassName,
              badgeClassName
            )}
          >
            <ClockIcon className="w-3 h-3" /> <p>{t('runStatus.timedOut')}</p>
          </Badge>
        </div>
      );
    default:
      return (
        <TooltipProvider>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <div className={cn(sharedContainerClassName, containerClassName)}>
                <Badge
                  variant="outline"
                  className={cn(sharedBadgeClassName, badgeClassName)}
                >
                  <QuestionMarkCircledIcon className="w-3 h-3" />
                  <p>{t('runStatus.unknown')}</p>
                </Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('runStatus.unknownDesc')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
  }
}
