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
import { JobService, JobStatus } from '@neosync/sdk';
import { PlusIcon } from '@radix-ui/react-icons';
import NextLink from 'next/link';
import { usePostHog } from 'posthog-js/react';
import { ReactElement, useMemo } from 'react';
import { GrPowerCycle } from 'react-icons/gr';
import { getColumns } from './components/DataTable/columns';
import { DataTable } from './components/DataTable/data-table';

export default function Jobs() {
  const { t } = useI18n();

  return (
    <OverviewContainer
      Header={
        <PageHeader header={t('jobs.title')} extraHeading={<NewJobButton />} />
      }
      containerClassName="jobs-page"
    >
      <div>
        <JobTable />
      </div>
    </OverviewContainer>
  );
}

interface JobTableProps {}

function JobTable(props: JobTableProps): ReactElement {
  const {} = props;
  const { account } = useAccount();
  const { t } = useI18n();
  const {
    isLoading,
    data,
    refetch: mutate,
  } = useQuery(
    JobService.method.getJobs,
    { accountId: account?.id },
    { enabled: !!account?.id }
  );
  const { data: statusData } = useQuery(
    JobService.method.getJobStatuses,
    { accountId: account?.id },
    { enabled: !!account?.id }
  );
  const columns = useMemo(
    () =>
      getColumns({
        accountName: account?.name ?? '',
        t,
        onDeleted() {
          mutate();
        },
      }),
    [account?.name ?? '', t]
  );

  if (isLoading) {
    return <SkeletonTable />;
  }

  const jobs = data?.jobs ?? [];
  const statusJobMap =
    statusData?.statuses.reduce(
      (prev, curr) => {
        return { ...prev, [curr.jobId]: curr.status };
      },
      {} as Record<string, JobStatus>
    ) || {};

  const jobData = jobs.map((j) => {
    let jobtype = t('jobType.sync');
    if (j.source?.options?.config.case === 'generate') {
      jobtype = t('jobType.generate');
    } else if (j.source?.options?.config.case === 'aiGenerate') {
      jobtype = t('jobType.aiGenerate');
    } else if (j.jobType?.jobType.case === 'piiDetect') {
      jobtype = t('jobType.piiDetect');
    }
    return {
      ...j,
      status: statusJobMap[j.id] || JobStatus.UNSPECIFIED,
      type: jobtype,
    };
  });

  return (
    <div>
      {jobData.length == 0 ? (
        <EmptyState
          title={t('jobs.emptyTitle')}
          description={t('jobs.emptyDesc')}
          icon={<GrPowerCycle className="w-8 h-8 text-primary" />}
          extra={
            <EmptyStateLinkButton
              buttonText={t('jobs.emptyAction')}
              href={`/${account?.name}/new/job`}
            />
          }
        />
      ) : (
        <DataTable columns={columns} data={jobData} />
      )}
    </div>
  );
}

function NewJobButton(): ReactElement {
  const { account } = useAccount();
  const posthog = usePostHog();
  const { t } = useI18n();
  return (
    <NextLink
      href={`/${account?.name}/new/job`}
      onClick={() => {
        posthog.capture('clicked_new_job_button');
      }}
    >
      <Button onClick={() => {}}>
        <ButtonText leftIcon={<PlusIcon />} text={t('jobs.new')} />
      </Button>
    </NextLink>
  );
}
