import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Card } from "./card";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  Row,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import EmptyBoxCard from "@/app/documents/components/cards/empty-box-card";

export interface DataTableProps<T> {
  defaultValue: string;
  items: {
    value: string;
    label: string;
    count?: number;
    icon?: React.JSXElementConstructor<React.SVGProps<SVGSVGElement>>;
  }[];
  filtersTab?: React.ReactNode;
  tableData?: {
    data: T[];
    columns: ColumnDef<T>[];
    onRowClick?: (row: Row<T>) => void;
  } | null;
  onTabChange?: (value: string) => void;
}

export default function DataTable<T>({
  defaultValue,
  items,
  filtersTab,
  tableData,
  onTabChange,
}: DataTableProps<T>) {
  const table = useReactTable({
    data: tableData?.data ?? [],
    columns: tableData?.columns ?? [],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-[8px] border-[1.5px] border-gray-200 min-h-[70vh]">
      <Tabs
        defaultValue={defaultValue}
        className="flex h-full flex-1 flex-col gap-0"
        onValueChange={onTabChange}
      >
        <TabsList className="bg-midnight-gray-50 flex h-[52px] w-full justify-start rounded-b-none border-b-0 border-none pt-3 !pb-0">
          <div className="border-midnight-gray-200 flex h-full w-8 border-b-[1.5px]" />
          {items.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className={cn(
                "border-b-midnight-gray-200 data-[state=active]:border-midnight-gray-200 data-[state=active]:border-b-none text-midnight-gray-900 data-[state=active]:text-silicon rouded-b-0 h-full gap-x-1 rounded-b-none px-3 py-[10px] text-sm data-[state=active]:border-[1.5px] data-[state=active]:border-b-0 data-[state=active]:bg-white data-[state=active]:font-[600] data-[state=inactive]:border-b-[1.5px]",
              )}
            >
              {item.icon && <item.icon />}
              {item.label}
              <span className="text-midnight-gray-600 border-midnight-gray-200 ml-2 rounded-xs border-[1px] px-1 text-xs font-[600]">
                {item.count}
              </span>
            </TabsTrigger>
          ))}
          <div className="border-midnight-gray-200 flex h-full w-full border-b-[1.5px]" />
        </TabsList>
        {filtersTab && filtersTab}
        <Card className="flex min-h-[300px] flex-1 rounded-none border-t-0 border-none p-5">
          {table && table.getRowCount() != 0 ? (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader className="bg-midnight-gray-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className="text-midnight-gray-900 h-fit py-[6px] text-xs font-[500]"
                        >
                          <div className="!text-midnight-gray-900 flex items-center gap-2">
                            {!header.isPlaceholder &&
                              flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                            {header.column.columnDef.header !== " " && (
                              <div className="flex flex-col leading-none">
                                <ChevronUp
                                  size={12}
                                  className="text-midnight-gray-600 mb-[-6px]"
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
                        className={cn(i % 2 ? "bg-midnight-gray-50" : "")}
                        onClick={() =>
                          tableData?.onRowClick && tableData.onRowClick(row)
                        }
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="px-3 py-2">
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
                      <TableCell className="h-24 text-center">
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyBoxCard />
          )}
        </Card>
      </Tabs>
    </div>
  );
}
