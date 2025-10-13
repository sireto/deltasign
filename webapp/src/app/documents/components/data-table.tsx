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
} from "@/shared/ui/table";
import Image from "next/image";
import PdfIcon from "@/shared/icons/pdf";
import { Checkbox } from "@/shared/ui/checkbox";
import { Button } from "@/shared/ui/button";
import { ChevronDown, ChevronUp, EllipsisVertical } from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

type Document = {
  title: string;
  sender: { name: string; email: string; image: string };
  recipents: { name: string; email: string; image: string }[];
  createdDate: Date;
  status: string;
};

/* -------------------------------------------------------------------------- */
/*                              Helper Components                             */
/* -------------------------------------------------------------------------- */

const SenderCell = ({ sender }: { sender: Document["sender"] }) => (
  <div className="flex items-center gap-2">
    <Image
      src={sender.image}
      alt={sender.name}
      width={32}
      height={32}
      className="rounded-full"
    />
    <div>
      <p className="font-semibold text-xs text-midnight-gray-900">
        {sender.name}
      </p>
      <p className="text-xs text-midnight-gray-600">{sender.email}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const statusClasses = cn(
    status === "Pending" && "text-warning-500 bg-warning-100",
    status === "Fully Signed" && "text-success-500 bg-success-100",
    status === "Submitted" && "text-information-600 bg-information-100",
    "px-[7px] py-[2px] rounded-full text-xs",
  );

  return <span className={statusClasses}>{status}</span>;
};

const ActionsCell = () => (
  <div className="flex gap-2 items-center">
    <Button variant="outline" className="text-silicon border-silicon">
      Edit
    </Button>
    <div className="border border-midnight-gray-200 px-2 py-1 rounded-lg">
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
  date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/* -------------------------------------------------------------------------- */
/*                                  Columns                                   */
/* -------------------------------------------------------------------------- */

export const columns: ColumnDef<Document>[] = [
  {
    id: "select",
    header: " ",
    cell: () => (
      <div className="pl-4">
        <Checkbox />
      </div>
    ),
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="flex gap-2 pl-3">
        <PdfIcon />
        <span className="text-midnight-gray-900 font-medium">
          {row.getValue("title")}.pdf
        </span>
      </div>
    ),
  },
  {
    accessorKey: "sender",
    header: "Sender",
    cell: ({ row }) => <SenderCell sender={row.getValue("sender")} />,
  },
  {
    accessorKey: "recipents",
    header: "Recipients",
    cell: ({ row }) => {
      const recipients = row.getValue("recipents") as Document["recipents"];
      return <CustomAvatarsOverlay images={recipients.map((r) => r.image)} />;
    },
  },
  {
    accessorKey: "createdDate",
    header: "Created Date",
    cell: ({ row }) => (
      <div>{formatDate(row.getValue("createdDate") as Date)}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
  {
    id: "actions",
    header: "Actions",
    cell: () => <ActionsCell />,
  },
];

/* -------------------------------------------------------------------------- */
/*                                 Data Table                                 */
/* -------------------------------------------------------------------------- */

export default function DataTable() {
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
                  className="text-xs text-midnight-gray-900 font-medium"
                >
                  <div className="flex gap-2 items-center">
                    {!header.isPlaceholder &&
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    {header.column.columnDef.header !== " " && (
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
                data-state={row.getIsSelected() && "selected"}
                className={i % 2 ? "bg-midnight-gray-50" : ""}
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
    createdDate: new Date("2025-09-21T12:00:00"),
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
    createdDate: new Date("2025-10-03T10:00:00"),
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
    createdDate: new Date("2025-09-28T08:00:00"),
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
    createdDate: new Date("2025-10-06T09:00:00"),
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
    createdDate: new Date("2025-09-19T07:00:00"),
    status: "Pending",
  },
];
