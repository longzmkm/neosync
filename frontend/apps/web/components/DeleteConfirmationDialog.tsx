import { TrashIcon } from '@radix-ui/react-icons';
import { ReactElement } from 'react';
import { useI18n } from '@/components/providers/i18n-provider';
import ConfirmationDialog, {
  Props as ConfirmationDialogProps,
} from './ConfirmationDialog';

type Props = ConfirmationDialogProps;

export default function DeleteConfirmationDialog(props: Props): ReactElement {
  const { t } = useI18n();
  return (
    <ConfirmationDialog
      buttonText={t('common.delete')}
      buttonIcon={<TrashIcon />}
      buttonVariant="destructive"
      {...props}
    />
  );
}
