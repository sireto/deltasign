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
import { ChevronDown, ChevronUp, EllipsisVertical, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

type Template = {
  title: string;
  createdDate: Date;
  status: string;
};

/* -------------------------------------------------------------------------- */
/*                              Helper Components                             */
/* -------------------------------------------------------------------------- */

const StatusBadge = ({ status }: { status: string }) => {
  const statusClasses = cn(
    status === 'Pending' && 'text-warning-500 bg-warning-100',
    status === 'Fully Signed' && 'text-success-500 bg-success-100',
    status === 'Submitted' && 'text-information-600 bg-information-100',
    'px-[7px] py-[2px] rounded-full text-xs',
  );

  return <span className={statusClasses}>{status}</span>;
};

const ActionsCell = () => (
  <div className="flex items-center gap-2">
    <Button variant="outline" className="text-silicon border-silicon">
      <Plus />
      Use template
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

const formatDate = (date: Date) =>
  date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

/* -------------------------------------------------------------------------- */
/*                                  Columns                                   */
/* -------------------------------------------------------------------------- */

export const columns: ColumnDef<Template>[] = [
  {
    id: 'select',
    header: ' ',
    cell: () => (
      <div className="pl-4">
        <Checkbox />
      </div>
    ),
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => (
      <div className="flex gap-2 pl-3">
        <PdfIcon />
        <span className="text-midnight-gray-900 font-medium">
          {row.getValue('title')}.pdf
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'createdDate',
    header: 'Created Date',
    cell: ({ row }) => (
      <div>{formatDate(row.getValue('createdDate') as Date)}</div>
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

/* -------------------------------------------------------------------------- */
/*                                 Data Table                                 */
/* -------------------------------------------------------------------------- */

export default function TemplatesTable() {
  const table = useReactTable({
    data: sampleData,
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
                  className="text-midnight-gray-900 text-xs font-medium"
                >
                  <div className="flex items-center gap-2">
                    {!header.isPlaceholder &&
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    {header.column.columnDef.header !== ' ' && (
                      <div className="flex flex-col leading-none">
                        <ChevronUp
                          size={12}
                          className="text-midnight-gray-600"
                        />
                        <ChevronDown
                          size={12}
                          className="text-midnight-gray-600"
                        />
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
                className={i % 2 ? 'bg-midnight-gray-50' : ''}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
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

/* -------------------------------------------------------------------------- */
/*                               Sample Data                                  */
/* -------------------------------------------------------------------------- */

const sampleData: Template[] = [
  {
    title: 'partnership_agreement',
    createdDate: new Date('2025-09-21T12:00:00'),
    status: 'private',
  },
  {
    title: 'nda_document',
    createdDate: new Date('2025-10-03T10:00:00'),
    status: 'private',
  },
  {
    title: 'service_contract',
    createdDate: new Date('2025-09-28T08:00:00'),
    status: 'private',
  },
  {
    title: 'supplier_invoice',
    createdDate: new Date('2025-10-06T09:00:00'),
    status: 'private',
  },
  {
    title: 'employment_offer',
    createdDate: new Date('2025-09-19T07:00:00'),
    status: 'private2',
  },
];
