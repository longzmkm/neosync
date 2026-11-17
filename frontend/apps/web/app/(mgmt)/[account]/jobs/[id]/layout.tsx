'use client';
import ButtonText from '@/components/ButtonText';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import ResourceId from '@/components/ResourceId';
import { SubNav } from '@/components/SubNav';
import OverviewContainer from '@/components/containers/OverviewContainer';
import PageHeader from '@/components/headers/PageHeader';
import { isJobSubsettable } from '@/components/jobs/subsets/utils';
import { useAccount } from '@/components/providers/account-provider';
import { useI18n } from '@/components/providers/i18n-provider';
import { LayoutProps } from '@/components/types';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useGetSystemAppConfig } from '@/libs/hooks/useGetSystemAppConfig';
import type { MessageKey } from '@/libs/i18n';
import { getErrorMessage } from '@/util/util';
import { useMutation, useQuery } from '@connectrpc/connect-query';
import {
  Job,
  JobService,
  JobSourceOptions,
  JobStatus,
  JobTypeConfig,
} from '@neosync/sdk';
import { LightningBoltIcon, TrashIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { toast } from 'sonner';
import JobIdSkeletonForm from './JobIdSkeletonForm';
import JobCloneButton from './components/JobCloneButton';
import JobPauseButton from './components/JobPauseButton';

export default function JobIdLayout(props: LayoutProps) {
  const params = use(props.params);

  const { children } = props;

  const id = params?.id ?? '';
  const router = useRouter();
  const { account } = useAccount();
  const { t } = useI18n();
  const { data, isLoading, isPending } = useQuery(
    JobService.method.getJob,
    { id },
    { enabled: !!id }
  );
  const { data: jobStatus, refetch: mutateJobStatus } = useQuery(
    JobService.method.getJobStatus,
    { jobId: id },
    { enabled: !!id }
  );
  const { refetch: mutateRecentRuns } = useQuery(
    JobService.method.getJobRecentRuns,
    { jobId: id },
    { enabled: !!id }
  );
  const { refetch: mutateJobRunsByJob } = useQuery(
    JobService.method.getJobRuns,
    { id: { case: 'jobId', value: id } },
    { enabled: !!id }
  );

  const { mutateAsync: removeJob } = useMutation(JobService.method.deleteJob);
  const { mutateAsync: triggerJobRun } = useMutation(
    JobService.method.createJobRun
  );

  async function onTriggerJobRun(): Promise<void> {
    try {
      await triggerJobRun({ jobId: id });
      toast.success(t('job.runTriggered'));
      setTimeout(() => {
        mutateRecentRuns();
        mutateJobRunsByJob();
      }, 4000); // delay briefly as there can sometimes be a trigger delay in temporal
    } catch (err) {
      console.error(err);
      toast.error(t('job.runTriggerFailed'), {
        description: getErrorMessage(err),
      });
    }
  }

  async function onDelete(): Promise<void> {
    if (!id) {
      return;
    }
    try {
      await removeJob({ id });
      toast.success(t('job.removed'));
      router.push(`/${account?.name}/jobs`);
    } catch (err) {
      console.error(err);
      toast.error(t('job.removeFailed'), {
        description: getErrorMessage(err),
      });
    }
  }

  function onNewStatus(_newStatus: JobStatus): void {
    mutateJobStatus();
  }

  const sidebarNavItems = useGetSidebarNavItems(data?.job);

  if (isLoading || isPending) {
    return (
      <div>
        <JobIdSkeletonForm />
      </div>
    );
  }

  if (!data?.job) {
    return (
      <div className="mt-8">
        <Alert variant="destructive">
          <AlertTitle>{t('job.retrieveError')}</AlertTitle>
        </Alert>
      </div>
    );
  }

  const badgeValue = getBadgeText(data.job.jobType, data.job.source?.options);

  return (
    <div>
      <OverviewContainer
        Header={
          <div>
            <PageHeader
              pageHeaderContainerClassName="gap-2"
              header={data?.job?.name || ''}
              subHeadings={
                <ResourceId
                  labelText={data?.job?.id ?? ''}
                  copyText={data?.job?.id ?? ''}
                  onHoverText={t('job.copyId')}
                />
              }
              leftBadgeValue={t(jobTypeLabelKeys[badgeValue])}
              extraHeading={
                <div className="md:flex grid grid-cols-2 md:flex-row gap-4">
                  <JobCloneButton job={data.job} />
                  <DeleteConfirmationDialog
                    trigger={
                      <Button variant="destructive">
                        <ButtonText
                          leftIcon={<TrashIcon />}
                          text={t('job.delete')}
                        />
                      </Button>
                    }
                    headerText={t('job.deleteConfirm')}
                    description={t('job.deleteDesc')}
                    onConfirm={async () => onDelete()}
                  />
                  <JobPauseButton
                    jobId={id}
                    status={jobStatus?.status}
                    onNewStatus={onNewStatus}
                  />
                  <Button onClick={() => onTriggerJobRun()}>
                    <ButtonText
                      leftIcon={<LightningBoltIcon />}
                      text={t('job.triggerRun')}
                    />
                  </Button>
                </div>
              }
            />
          </div>
        }
      >
        <div className="flex flex-col gap-12">
          <SubNav items={sidebarNavItems} />
          <div>{children}</div>
        </div>
      </OverviewContainer>
    </div>
  );
}

function getLabeledJobType(
  jobTypeConfig?: JobTypeConfig,
  options?: JobSourceOptions
): 'Sync Job' | 'Generate Job' | 'AI Generate Job' | 'PII Detect Job' {
  switch (options?.config.case) {
    case 'generate':
      return 'Generate Job';
    case 'aiGenerate':
      return 'AI Generate Job';
    default:
      switch (jobTypeConfig?.jobType.case) {
        case 'sync':
          return 'Sync Job';
        case 'piiDetect':
          return 'PII Detect Job';
        default:
          return 'Sync Job';
      }
  }
}

const getBadgeText = getLabeledJobType;

const jobTypeLabelKeys: Record<
  'Sync Job' | 'Generate Job' | 'AI Generate Job' | 'PII Detect Job',
  MessageKey
> = {
  'Sync Job': 'jobType.syncJob',
  'Generate Job': 'jobType.generateJob',
  'AI Generate Job': 'jobType.aiGenerateJob',
  'PII Detect Job': 'jobType.piiDetectJob',
};

interface SidebarNav {
  title: string;
  href: string;
}
function useGetSidebarNavItems(job?: Job): SidebarNav[] {
  const { account } = useAccount();
  const { t } = useI18n();
  const { data: systemAppConfigData, isLoading: isSystemConfigLoading } =
    useGetSystemAppConfig();

  if (!account || !job) {
    return [{ title: t('job.overview'), href: `` }];
  }
  const badgeText = getLabeledJobType(job.jobType, job.source?.options);
  const basePath = `/${account.name}/jobs/${job.id}`;
  const isMetricsServiceEnabled =
    !isSystemConfigLoading && systemAppConfigData?.isMetricsServiceEnabled;
  const isJobHooksEnabled =
    !isSystemConfigLoading && systemAppConfigData?.isJobHooksEnabled;

  switch (badgeText) {
    case 'Sync Job': {
      const nav = [
        { title: t('job.overview'), href: basePath },
        { title: t('job.source'), href: `${basePath}/source` },
        { title: t('job.destinations'), href: `${basePath}/destinations` },
      ];
      if (isJobSubsettable(job)) {
        nav.push({
          title: t('job.subsets'),
          href: `${basePath}/subsets`,
        });
      }
      if (isMetricsServiceEnabled) {
        nav.push({
          title: t('job.usage'),
          href: `${basePath}/usage`,
        });
      }
      if (isJobHooksEnabled) {
        nav.push({
          title: t('job.hooks'),
          href: `${basePath}/hooks`,
        });
      }

      return nav;
    }

    case 'Generate Job': {
      const nav = [
        { title: t('job.overview'), href: basePath },
        { title: t('job.source'), href: `${basePath}/source` },
        { title: t('job.destinations'), href: `${basePath}/destinations` },
      ];
      if (isMetricsServiceEnabled) {
        nav.push({
          title: t('job.usage'),
          href: `${basePath}/usage`,
        });
      }
      if (isJobHooksEnabled) {
        nav.push({
          title: t('job.hooks'),
          href: `${basePath}/hooks`,
        });
      }

      return nav;
    }
    case 'AI Generate Job': {
      const nav = [
        { title: t('job.overview'), href: basePath },
        { title: t('job.source'), href: `${basePath}/source` },
        { title: t('job.destinations'), href: `${basePath}/destinations` },
      ];
      if (isMetricsServiceEnabled) {
        nav.push({
          title: t('job.usage'),
          href: `${basePath}/usage`,
        });
      }
      if (isJobHooksEnabled) {
        nav.push({
          title: t('job.hooks'),
          href: `${basePath}/hooks`,
        });
      }
      return nav;
    }
    case 'PII Detect Job': {
      const nav = [
        { title: t('job.overview'), href: basePath },
        { title: t('job.source'), href: `${basePath}/source` },
      ];
      if (isMetricsServiceEnabled) {
        nav.push({
          title: t('job.usage'),
          href: `${basePath}/usage`,
        });
      }
      return nav;
    }
    default: {
      return [{ title: t('job.overview'), href: basePath }];
    }
  }
}
