'use client';
import ButtonText from '@/components/ButtonText';
import OverviewContainer from '@/components/containers/OverviewContainer';
import EmptyState, { EmptyStateLinkButton } from '@/components/EmptyState';
import PageHeader from '@/components/headers/PageHeader';
import { useAccount } from '@/components/providers/account-provider';
import { useI18n } from '@/components/providers/i18n-provider';
import SkeletonTable from '@/components/skeleton/SkeletonTable';
import { Button } from '@/components/ui/button';
import { useQuery } from '@connectrpc/connect-query';
import { ConnectionService } from '@neosync/sdk';
import { PlusIcon } from '@radix-ui/react-icons';
import NextLink from 'next/link';
import { ReactElement, useMemo } from 'react';
import { GoWorkflow } from 'react-icons/go';
import { getColumns } from './components/ConnectionsTable/columns';
import { DataTable } from './components/ConnectionsTable/data-table';

export default function Connections(): ReactElement {
  const { t } = useI18n();

  return (
    <OverviewContainer
      Header={
        <PageHeader
          header={t('connections.title')}
          extraHeading={<NewConnectionButton />}
        />
      }
      containerClassName="connections-page"
    >
      <ConnectionTable />
    </OverviewContainer>
  );
}

interface ConnectionTableProps {}

function ConnectionTable(props: ConnectionTableProps): ReactElement {
  const {} = props;
  const { account } = useAccount();
  const { t } = useI18n();
  const { data, isLoading, refetch } = useQuery(
    ConnectionService.method.getConnections,
    { accountId: account?.id ?? '' },
    { enabled: !!account?.id }
  );

  const columns = useMemo(
    () =>
      getColumns({
        accountName: account?.name ?? '',
        t,
        onConnectionDeleted() {
          refetch();
        },
      }),
    [account?.name ?? '', t]
  );

  if (isLoading) {
    return <SkeletonTable />;
  }

  const connections = data?.connections ?? [];

  return (
    <div>
      {connections.length == 0 ? (
        <EmptyState
          title={t('connections.emptyTitle')}
          description={t('connections.emptyDesc')}
          icon={<GoWorkflow className="w-8 h-8 text-primary" />}
          extra={
            <EmptyStateLinkButton
              buttonText={t('connections.emptyAction')}
              href={`/${account?.name}/new/connection`}
            />
          }
        />
      ) : (
        <DataTable columns={columns} data={connections} />
      )}
    </div>
  );
}

interface NewConnectionButtonprops {}

function NewConnectionButton(props: NewConnectionButtonprops): ReactElement {
  const {} = props;
  const { account } = useAccount();
  const { t } = useI18n();
  return (
    <NextLink href={`/${account?.name}/new/connection`}>
      <Button>
        <ButtonText leftIcon={<PlusIcon />} text={t('connections.new')} />
      </Button>
    </NextLink>
  );
}
