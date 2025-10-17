'use client';
import { ColumnDef } from "@tanstack/react-table";
import { Contract } from "../types/contract";
import { Checkbox } from "@/shared/ui/checkbox";
import PdfIcon from "@/shared/icons/pdf";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/button";
import { EllipsisVertical } from "lucide-react";
import { formatDate } from "../utils/date";

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


// const username = useSelector((state: RootState) => state.user.name);
// const email = useSelector((state: RootState) => state.user.email);

export const contractsColumn: ColumnDef<Contract>[] = [
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
        const doc = row.original
        return (
          <div className="flex gap-2 min-w-[200px]">
            <PdfIcon />
            <a
              href={doc.document.s3_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-midnight-gray-900 font-[500] hover:underline"
            >
              {doc.name}<span>.pdf</span>
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
            <img
              src={"/placeholder.png"}
              alt="Avatar"
              width={24}
              height={24}
              className="inline-block size-6 rounded-full ring-2 ring-white outline outline-white/10"
            />
            <div className='text-midnight-gray-900 text-xs'> 
              <p className='font-[600]'>user</p>
              <p className='text-midnight-gray-600'>test@gmail.com</p>
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