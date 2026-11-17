'use client';

import { ColumnDef } from '@tanstack/react-table';

import NextLink from 'next/link';

import TruncatedText from '@/components/TruncatedText';
import { formatDateTime } from '@/util/util';
import type { Translator } from '@/libs/i18n';
import { Timestamp, timestampDate } from '@bufbuild/protobuf/wkt';
import { Connection } from '@neosync/sdk';
import { getCategory } from '../../util';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableRowActions } from './data-table-row-actions';

interface GetColumnsProps {
  onConnectionDeleted(id: string): void;
  accountName: string;
  t: Translator;
}

export function getColumns(props: GetColumnsProps): ColumnDef<Connection>[] {
  const { accountName, onConnectionDeleted, t } = props;
  return [
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('table.connectionId')}
        />
      ),
      cell: ({ row }) => (
        <div>
          <NextLink
            className="hover:underline"
            href={`/${accountName}/connections/${row.getValue('id')}`}
          >
            <span>{row.getValue('id')}</span>
          </NextLink>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('table.name')} />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[500px] truncate font-medium">
              <NextLink
                className="hover:underline"
                href={`/${accountName}/connections/${row.getValue('id')}`}
              >
                <TruncatedText text={row.getValue('name')} align="start" />
              </NextLink>
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'category',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('table.category')} />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[500px] truncate font-medium">
              {getCategory(row.original.connectionConfig)}
            </span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('table.createdAt')} />
      ),
      cell: ({ row }) => {
        const ts = row.getValue<Timestamp>('createdAt') ?? {
          nanos: 0,
          seconds: 0,
        };
        return (
          <div className="flex space-x-2">
            <span className="max-w-[500px] truncate font-medium">
              {formatDateTime(timestampDate(ts))}
            </span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('table.updatedAt')} />
      ),
      cell: ({ row }) => {
        const ts = row.getValue<Timestamp>('updatedAt') ?? {
          nanos: 0,
          seconds: 0,
        };
        return (
          <div className="flex space-x-2">
            <span className="max-w-[500px] truncate font-medium">
              {formatDateTime(timestampDate(ts))}
            </span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      id: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('table.actions')} />
      ),
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          onDeleted={() => onConnectionDeleted(row.id)}
        />
      ),
    },
  ];
}
