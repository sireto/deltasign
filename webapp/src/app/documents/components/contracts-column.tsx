"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Contract } from "../types/contract";
import { Checkbox } from "@/shared/ui/checkbox";
import PdfIcon from "@/shared/icons/pdf";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/button";
import { EllipsisVertical } from "lucide-react";
import { formatDate } from "../utils/date";
import { capitalize } from "@/shared/utils";

const StatusBadge = ({ status }: { status: string }) => {
  const statusClasses = cn(
    status === "Draft" && "text-midnight-gray-900 bg-midnight-gray-100",
    status === "Pending" && "text-warning-500 bg-warning-100",
    status === "Fully signed" && "text-success-500 bg-success-100",
    "px-[7px] py-[2px] rounded-full text-xs font-medium",
  );

  return <span className={cn(statusClasses, "px-[7px]")}>{status}</span>;
};

const ActionsCell = ({ status }: { status: string }) => {
  const getButtonText = (status: string) => {
    switch (status) {
      case "Pending":
        return "Sign";
      case "Fully signed":
        return "View";
      case "Draft":
        return "Edit";
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        className="text-silicon border-silicon h-7 rounded-[8px] px-2 text-sm font-[600]"
      >
        {getButtonText(status)}
      </Button>
      <div className="border-midnight-gray-200 rounded-[8px] border px-2 py-1">
        <EllipsisVertical size={16} />
      </div>
    </div>
  );
};

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
    id: "select",
    header: " ",
    cell: () => (
      <div>
        <Checkbox />
      </div>
    ),
  },
  {
    accessorKey: "document",
    header: "Title",
    cell: ({ row }) => {
      const doc = row.original;
      return (
        <div className="flex min-w-[200px] gap-2">
          <PdfIcon />
          <span className="text-midnight-gray-900 font-[500]">{doc.name}</span>
        </div>
      );
    },
  },
  {
    header: "Sender",
    cell: ({row}) => {
      const doc = row.original
      return (
        <div className="flex items-center gap-2">
          <img
            src={"/placeholder.png"}
            alt="Avatar"
            width={24}
            height={24}
            className="inline-block size-6 rounded-full ring-2 ring-white outline outline-white/10"
          />
          <div className="text-midnight-gray-900 text-xs">
            <p className="font-[600]">user</p>
            <p className="text-midnight-gray-600">{doc.creator}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "signers",
    header: "Recipients",
    cell: ({ row }) => {
      const signers = row.getValue("signers") as string[];
      // generate avatar placeholder URLs (e.g. ui-avatars)
      const avatars = signers.map(
        (email) =>
          `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=random`,
      );
      return (
        <div className="min-w-[108px]">
          <CustomAvatarsOverlay images={avatars} />
        </div>
      );
    },
  },
  {
    accessorKey: "created_date",
    header: "Created date",
    cell: ({ row }) => (
      <div className="text-midnight-gray-600">
        {formatDate(row.getValue("created_date") as string)}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <div className="p-2 pl-10 text-center font-bold">Status</div>,
    cell: ({ row }) => (
      <div className="flex w-full items-center justify-center">
        <StatusBadge status={capitalize(row.getValue("status") as string)} />
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <ActionsCell status={capitalize(row.getValue("status") as string)} />
    ),
  },
];
