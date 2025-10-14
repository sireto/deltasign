'use client';

import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import Image from 'next/image';
import PdfIcon from '@/shared/icons/pdf';
import { Checkbox } from '@/shared/ui/checkbox';
import { Button } from '@/shared/ui/button';
import { ChevronDown, ChevronUp, EllipsisVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Contract } from '../types/contract';
import { useSelector } from 'react-redux';
import { RootState } from '@/shared/store/store';
/* -------------------------------------------------------------------------- */
/*                              Helper Components                             */
/* -------------------------------------------------------------------------- */

const StatusBadge = ({ status }: { status: string }) => {
  const statusClasses = cn(
    status === 'NEW' && 'text-warning-500 bg-warning-100',
    status === 'SIGNED' && 'text-success-500 bg-success-100',
    'px-[7px] py-[2px] rounded-full text-xs font-medium'
  );

  return <span className={statusClasses}>{status}</span>;
};

const ActionsCell = () => (
  <div className="flex items-center gap-2">
    <Button variant="outline" className="text-silicon border-silicon px-2 rounded-[8px] text-sm font-[600]">
      Edit
    </Button>
    <div className="border-midnight-gray-200 rounded-lg border px-2 py-1">
      <EllipsisVertical size={20} />
    </div>
  </div>
);

const CustomAvatarsOverlay = ({
  images,
  max = 4,
}: {
  images: string[];
  max?: number;
}) => {
  const displayed = images.slice(0, max);
  const extra = images.length - max;

  return (
    <div className="flex -space-x-1">
      {displayed.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`Avatar ${i + 1}`}
          className="inline-block size-6 rounded-full ring-2 ring-white outline outline-white/10"
        />
      ))}
      {extra > 0 && (
        <div className="inline-flex size-6 items-center justify-center rounded-full bg-gray-700 text-[10px] font-medium text-white ring-2 ring-gray-900">
          +{extra}
        </div>
      )}
    </div>
  );
};

const formatDate = (date: string) =>
  new Date(date).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

/* -------------------------------------------------------------------------- */
/*                                  Columns                                   */
/* -------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------- */
/*                                 Data Table                                 */
/* -------------------------------------------------------------------------- */

export default function DataTable({ contracts }: { contracts: Contract[] }) {
  
  const userName = useSelector((state: RootState) => state.user.name);
  const email = useSelector((state: RootState) => state.user.email);
  
  const columns: ColumnDef<Contract>[] = [
    {
      id: 'select',
      header: ' ',
      cell: () => (
        <div>
          <Checkbox />
        </div>
      ),
    },
    {
      accessorKey: 'document',
      header: 'Title',
      cell: ({ row }) => {
        const doc = row.getValue('document') as Contract['document'];
        return (
          <div className="flex gap-2 ">
            <PdfIcon />
            <a
              href={doc.s3_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-midnight-gray-900 font-[500] hover:underline"
            >
              {doc.filename}
            </a>
          </div>
        );
      },
    },
    {
      header: 'Sender',
      cell: ({ row }) => {
        return (
          <div className='flex gap-2 items-center'>
            <Image
              src={"/placeholder.png"}
              alt="Avatar"
              width={24}
              height={24}
              className="inline-block size-6 rounded-full ring-2 ring-white outline outline-white/10"
            />
            <div className='text-midnight-gray-900 text-xs'> 
              <p className='font-[600]'>{userName || "User"}</p>
              <p className='text-midnight-gray-600'>{email}</p>
            </div>
  
          </div>
        )
      }
    },
    {
      accessorKey: 'signers',
      header: 'Recipients',
      cell: ({ row }) => {
        const signers = row.getValue('signers') as string[];
        // generate avatar placeholder URLs (e.g. ui-avatars)
        const avatars = signers.map(
          (email) =>
            `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=random`
        );
        return <CustomAvatarsOverlay images={avatars} />;
      },
    },
    {
      accessorKey: 'created_date',
      header: 'Created Date',
      cell: ({ row }) => (
        <div className='text-midnight-gray-600'>{formatDate(row.getValue('created_date') as string)}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: () => <ActionsCell />,
    },
  ];
  const table = useReactTable({
    data: contracts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader className="bg-midnight-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-midnight-gray-900 text-xs font-[500] py-[6px] h-fit"
                >
                  <div className="flex items-center gap-2">
                    {!header.isPlaceholder &&
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    {header.column.columnDef.header !== ' ' && (
                      <div className="flex flex-col leading-none">
                        <ChevronUp size={12} className="text-midnight-gray-600 mb-[-6px]"/>
                        <ChevronDown size={12} className="text-midnight-gray-600" />
                      </div>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row, i) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className={cn(i % 2 ? 'bg-midnight-gray-50' : '')}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className='px-3 py-2'>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
