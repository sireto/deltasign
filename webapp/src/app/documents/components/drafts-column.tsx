import { ColumnDef } from "@tanstack/react-table";
import { Document } from "../types/document";
import { formatDate } from "../utils/date";
import { Checkbox } from "@/shared/ui/checkbox"; 
import PdfIcon from "@/shared/icons/pdf";
import { Button } from "@/shared/ui/button";
import { EllipsisVertical } from "lucide-react";

const ActionsCell = () => (
  <div className="flex items-center gap-2">
    <Button variant="outline" className="text-silicon border-silicon px-2 rounded-[8px] text-sm font-[600]">
      Create Contract
    </Button>
    <div className="border-midnight-gray-200 rounded-lg border px-2 py-1">
      <EllipsisVertical size={20} />
    </div>
  </div>
);

export const draftsColumn: ColumnDef<Document>[] = [
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
          cell: ({row}) => {
            const doc = row.original
            return (
              <div className="flex gap-2 min-w-[200px]">
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
        accessorKey: "created_date",
        header: "Created Date",
        cell: ({ row }) => {
            return (
                <div>{formatDate(row.original.created_date)}</div>
            )
        }
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
              <p className='font-[600]'>User</p>
              <p className='text-midnight-gray-600'>{"test@gmail.com"}</p>
            </div>
  
          </div>
        )
      }
    },
    {
        header: "Status",
        cell: ({ row }) => {
            return (
                <div>DRAFT</div>
            )
        }
    },
      {
      id: 'actions',
      header: 'Actions',
      cell: () => <ActionsCell />,
    },
];