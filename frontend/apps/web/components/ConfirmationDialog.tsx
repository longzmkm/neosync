import { cn } from '@/libs/utils';
import { useI18n } from '@/components/providers/i18n-provider';
import { AlertDialogTitle } from '@radix-ui/react-alert-dialog';
import { ReactElement, ReactNode, useState, type JSX } from 'react';
import ButtonText from './ButtonText';
import Spinner from './Spinner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { Button, ButtonProps, buttonVariants } from './ui/button';

export interface Props {
  trigger?: ReactNode;
  headerText?: string;
  description?: string;
  body?: JSX.Element;
  buttonText?: string;
  buttonVariant?: ButtonProps['variant'] | null | undefined;
  buttonIcon?: ReactNode;
  containerClassName?: string;
  onConfirm(): void | Promise<void>;
}

export default function ConfirmationDialog(props: Props): ReactElement {
  const { t } = useI18n();
  const {
    trigger,
    headerText,
    description,
    body,
    buttonText,
    buttonVariant,
    buttonIcon,
    containerClassName,
    onConfirm,
  } = props;
  const [open, setOpen] = useState(false);
  const [isTrying, setIsTrying] = useState(false);

  const resolvedTrigger = trigger ?? (
    <Button type="button">{t('common.pressToConfirm')}</Button>
  );
  const resolvedHeaderText = headerText ?? t('common.areYouSure');
  const resolvedDescription = description ?? t('common.confirmDescription');
  const resolvedButtonText = buttonText ?? t('common.confirm');

  async function onClick(): Promise<void> {
    if (isTrying) {
      return;
    }
    setIsTrying(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setIsTrying(false);
    }
  }
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{resolvedTrigger}</AlertDialogTrigger>
      <AlertDialogContent className={cn(containerClassName)}>
        <AlertDialogHeader className="gap-2">
          <AlertDialogTitle className="text-xl">
            {resolvedHeaderText}
          </AlertDialogTitle>
          <AlertDialogDescription className="tracking-tight">
            {resolvedDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="pt-6">{body}</div>
        <AlertDialogFooter className="w-full flex sm:justify-between mt-4">
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onClick();
            }}
            className={cn(buttonVariants({ variant: buttonVariant }))}
          >
            <ButtonText
              leftIcon={isTrying ? <Spinner /> : buttonIcon}
              text={resolvedButtonText}
            />
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
