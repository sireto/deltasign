import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import PdfIcon from "@/shared/icons/pdf";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/shared/ui/button";
import { ChevronDown, ChevronUp, Dot, EllipsisVertical } from "lucide-react";
import { cn } from "@/lib/utils";

type Document = {
  title: string;
  sender: {
    name: string;
    email: string;
    image : string
  }
  recipents: {
    name: string;
    email: string;
    image : string
  }[],
  createdDate: Date;
  status: string;
};

export const columns: ColumnDef<Document>[] = [
  {
    header: " ",
    id: "select",
    cell: ({ row }) => {
        return (
            <div className="pl-4">
                <Checkbox/>
            </div>
        )
    }
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
        return (
        <div className="flex gap-2 pl-3">
            <PdfIcon/>
            <span className="text-midnight-gray-900 font-[500]">{row.getValue("title")}.pdf</span>
        </div>)
    }
  },
  {
    accessorKey: "sender",
    header: "Sender",
    cell: ({ row }) => {
      const sender = row.getValue("sender") as any;
      return (
        <div className="flex items-center gap-2">
          <Image
            src={sender.image}
            alt={sender.image}
            width={32}
            height={32}
            className="rounded-full"
          />
          <div>
            <p className="font-[600] text-xs text-midnight-gray-900">{sender.name}</p>
            <p className="text-xs text-midnight-gray-600">{sender.email}</p>
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: "recipents",
    header: "Recipents",
    cell: ({ row }) => {
      const recipients = row.getValue("recipents") as any;
      return (
        <div className="flex ">
          {
            <CustomAvatarsOverlay images={recipients.map((recipient :any) => recipient.image)}/>
          }
        </div>
      );
    },
  },
  {
    accessorKey: "createdDate",
    header: "Created Date",
    cell: ({ row }) => {
      const date = row.getValue("createdDate") as Date;
            const formatDate = (date: Date) => {
        const day = date.toLocaleString("en-GB", { day: "2-digit" });
        const month = date.toLocaleString("en-GB", { month: "short" });
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");

        return `${day} ${month} ${year}, ${hours}:${minutes}`;
        };
        return <div>{formatDate(date)}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {

      const renderStatus = (status : string) => {
        return (
        <span className={cn(status == "Pending" && "text-warning-500 bg-warning-100" , 
            status == "Fully Signed" && "text-success-500 bg-success-100",
            status == "Submitted" && "text-information-600 bg-information-100",
            "px-[7px] rounded-full text-xs py-[2px]"
        )}>
            {status}
        </span>)
      }

      return (
            renderStatus(row.getValue("status"))
      );
    }
  },
  {
    header: "Actions",
    cell: ({ row }) => {
        return (
            <div className="flex gap-2 items-center">
                <Button variant={"outline"} className="text-silicon border-silicon">Edit</Button>
                <div className="border-[1px] border-midnight-gray-200 px-2 py-1 rounded-[8px]">
                    <EllipsisVertical size={20} />
                </div>
            </div>
        )
    }
  },
];

export default function DataTable() {
  const table = useReactTable({
    data: sampleData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader className="bg-midnight-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs text-midnight-gray-900 font-[500]">
                    <div className="flex gap-2">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {
                        header.column.columnDef.header != " " && 
                        <div className="flex flex-col leading-none gap-0">
                            <ChevronUp size={12}className="mb-[-3px] text-midnight-gray-600"/>
                            <ChevronDown size={12} className="mt-[-3px] text-midnight-gray-600"/>
                        </div>
                        }
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row , index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={index % 2 === 1 ? "bg-midnight-gray-50" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

interface CustomAvatarsOverlayProps {
  images: string[];
  max?: number;
}

const CustomAvatarsOverlay = ({ images, max = 4 }: CustomAvatarsOverlayProps) => {
  const displayedImages = images.slice(0, max);
  const extraCount = images.length - max;

  return (
    <div className="flex -space-x-1 ">
      {displayedImages.map((src, index) => (
        <img
          key={index}
          src={src}
          alt={`Avatar ${index + 1}`}
          className="inline-block size-6 rounded-full ring-2 ring-white outline -outline-offset-1 outline-white/10"
        />
      ))}
      {extraCount > 0 && (
        <div className="inline-flex size-6 items-center justify-center rounded-full bg-gray-700 text-[10px] font-medium text-white ring-2 ring-gray-900">
          +{extraCount}
        </div>
      )}
    </div>
  );
};


const sampleData: Document[] = [
  {
    title: "partnership_agreement",
    sender: {
      name: "John Doe",
      email: "johndoe@example.com",
      image: "https://i.pravatar.cc/64?u=johndoe@example.com",
    },
    recipents: [
      {
        name: "Alice Smith",
        email: "alice@example.com",
        image: "https://i.pravatar.cc/64?u=alice@example.com",
      },
      {
        name: "Alice Johnson",
        email: "alic1234e@example.com",
        image: "https://i.pravatar.cc/64?u=alic1234e@example.com",
      },
    ],
    createdDate: new Date("2025-09-21 12:00:00"),
    status: "Pending",
  },
  {
    title: "nda_document",
    sender: {
      name: "Sarah Connor",
      email: "sarah@example.com",
      image: "https://ui-avatars.com/api/?name=Sarah+Connor",
    },
    recipents: [
      {
        name: "Tom Hanks",
        email: "tom@example.com",
        image: "https://i.pravatar.cc/64?u=tom@example.com",
      },
      {
        name: "Emily Blunt",
        email: "emily@example.com",
        image: "https://i.pravatar.cc/64?u=emily@example.com",
      },
      {
        name: "Rohan Kumar",
        email: "rohankumar@example.com",
        image: "https://i.pravatar.cc/64?u=rohankumar.com",
      },
    ],
    createdDate: new Date("2025-10-03 10:00:00"),
    status: "Fully Signed",
  },
  {
    title: "service_contract",
    sender: {
      name: "Michael Scott",
      email: "michael@example.com",
      image: "https://i.pravatar.cc/64?u=michael@example.com",
    },
    recipents: [
      {
        name: "Jim Halpert",
        email: "jim@example.com",
        image: "https://i.pravatar.cc/64?u=mkheqerwers.com",
      },
      {
        name: "Pam Beesly",
        email: "pam@example.com",
        image: "https://i.pravatar.cc/64?u=pam@example.com",
      },
    ],
    createdDate: new Date("2025-09-28 08:00:00"),
    status: "Submitted",
  },
  {
    title: "supplier_invoice",
    sender: {
      name: "Pam Beesly",
      email: "pam@example.com",
      image: "https://i.pravatar.cc/64?u=pam@example.com",
    },
    recipents: [
      {
        name: "Stanley Hudson",
        email: "stanley@example.com",
        image: "https://i.pravatar.cc/64?u=stanley@example.com",
      },
      {
        name: "Rohan Kumar",
        email: "rohankuma12341234r@example.com",
        image: "https://i.pravatar.cc/64?u=rohankuma12341234r.com",
      },
    ],
    createdDate: new Date("2025-10-06 09:00:00"),
    status: "Fully Signed",
  },
  {
    title: "employment_offer",
    sender: {
      name: "Dwight Schrute",
      email: "dwight@example.com",
      image: "https://i.pravatar.cc/64?u=dwight@example.com",
    },
    recipents: [
      {
        name: "Rohan Kumar",
        email: "rohankumarer313@example.com",
        image: "https://i.pravatar.cc/64?u=rohankumarer313.com",
      },
      {
        name: "Rohan Kumar 2",
        email: "rohankum1234ar@example.com",
        image: "https://i.pravatar.cc/64?u=rohankum1234ar.com",
      },
    ],
    createdDate: new Date("2025-09-19 07:00:00"),
    status: "Pending",
  },
];
