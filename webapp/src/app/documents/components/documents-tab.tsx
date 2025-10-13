"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import CompletedIcon from "@/shared/icons/completed";
import DraftsIcon from "@/shared/icons/drafts";
import PendingIcon from "@/shared/icons/pending";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { SearchInput } from "@/shared/ui/search-input";
import { Calendar, ChevronDown, Plus, Search } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import EmptyBoxCard from "./empty-box-card";
import { Button } from "@/shared/ui/button";
import DataTable from "./data-table";

type Document = {
  title: string;
  sender: string;
  senderProfile: string;
  RecipentsProfile: string[];
  createdDate: Date;
  status: string;
};

const tabItems = [
  {
    label: "All contracts",
    icon: null,
  },
  {
    label: "Drafts",
    icon: DraftsIcon,
  },
  {
    label: "Pending",
    icon: PendingIcon,
  },
  {
    label: "Completed",
    icon: CompletedIcon,
  },
];

export default function DocumentsTab() {
  return (
    <div className="flex flex-1 h-full w-full flex-col border-[1.5px] border-gray-200 rounded-md overflow-hidden">
      {/* Tabs */}
      <Tabs
        defaultValue="All contracts"
        className=" h-full flex flex-col flex-1 gap-0 "
      >
        <TabsList className="bg-midnight-gray-50 w-full flex pt-3 h-[52px] pb-0 rounded-b-none justify-start border-b-0 border-midnight-gray-200">
          <div className="flex w-5 h-full border-b-[1.5px] border-b-midnight-gray-200" />
          {tabItems.map((tab) => (
            <TabsTrigger
              key={tab.label}
              value={tab.label}
              className="border-b-[1.5px] border-b-midnight-gray-200 gap-x-1 data-[state=active]:border-[1.5px] data-[state=active]:border-midnight-gray-200  data-[state=active]:border-b-0 data-[state=inactive]:border-b-[1.5px] data-[state=active]:font-[600] text-sm text-midnight-gray-900 px-3 py-[10px] data-[state=active]:text-silicon rounded-b-none data-[state=active]:bg-white rouded-b-0 
              "
            >
              {tab.icon && <tab.icon />}
              {tab.label}
              <span className="text-midnight-gray-600 text-xs ml-2 font-[600] border-[1px] border-midnight-gray-200 px-1 rounded-xs">
                12
              </span>
            </TabsTrigger>
          ))}
          <div className="flex w-full h-full border-b-[1.5px] border-b-midnight-gray-200" />
        </TabsList>
        {/* Filters */}
        <div className="flex w-full justify-between bg-white items-center px-5 pt-4">
          <div className="flex w-full gap-2">
            <SearchInput className="w-[250px]" placeholder="Search" />
            <DropdownMenu>
              <DropdownMenuTrigger>
                <span className="text-midnight-gray-900">Sender</span>
                <ChevronDown size={16} className="text-midnight-gray-900" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Reciever</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <span className="text-midnight-gray-900">Status</span>
                <ChevronDown size={16} className="text-midnight-gray-900" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Reciever</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <span className="text-midnight-gray-900">All time</span>
                <Calendar size={16} className="text-midnight-gray-900" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Reciever</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button>
            <Plus width={1.5} />
            <span>Upload Document</span>
          </Button>
        </div>
        {/* Content */}
        {tabItems.map((tab) => (
          <TabsContent
            key={tab.label}
            value={tab.label}
            className="flex flex-1"
          >
            <Card className="flex flex-1 border-t-0 rounded-none border-none p-5">
              <DataTable />
              {/* <EmptyBoxCard/> */}
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
