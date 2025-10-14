'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import CompletedIcon from '@/shared/icons/completed';
import DraftsIcon from '@/shared/icons/drafts';
import PendingIcon from '@/shared/icons/pending';
import { Card } from '@/shared/ui/card';
import { SearchInput } from '@/shared/ui/search-input';
import { Calendar, ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import DataTable from './data-table';
import { Contract } from '../types/contract';


export default function DocumentsTab({contracts}:{contracts: Contract[]}) {

  const tabItems = [
    {
      label: 'All contracts',
      icon: null,
      value : contracts.length
    },
    {
      label: 'Drafts',
      icon: DraftsIcon,
      value : 0
    },
    {
      label: 'Pending',
      icon: PendingIcon,
      value : 0
    },
    {
      label: 'Completed',
      icon: CompletedIcon,
      value : 0
    },
  ];

  return (
    <div className="flex h-full w-full flex-1 flex-col overflow-hidden rounded-md border-[1.5px] border-gray-200">
      {/* Tabs */}
      <Tabs
        defaultValue="All contracts"
        className="flex h-full flex-1 flex-col gap-0"
      >
        <TabsList className="bg-midnight-gray-50 border-midnight-gray-200 flex h-[52px] w-full justify-start rounded-b-none border-b-0 pt-3 pb-0">
          <div className="border-b-midnight-gray-200 flex h-full w-5 border-b-[1.5px]" />
          {tabItems.map((tab) => (
            <TabsTrigger
              key={tab.label}
              value={tab.label}
              className="border-b-midnight-gray-200 data-[state=active]:border-midnight-gray-200 text-midnight-gray-900 data-[state=active]:text-silicon rouded-b-0 gap-x-1 rounded-b-none border-b-[1.5px] px-3 py-[10px] text-sm data-[state=active]:border-[1.5px] data-[state=active]:border-b-0 data-[state=active]:bg-white data-[state=active]:font-[600] data-[state=inactive]:border-b-[1.5px]"
            >
              {tab.icon && <tab.icon />}
              {tab.label}
              <span className="text-midnight-gray-600 border-midnight-gray-200 ml-2 rounded-xs border-[1px] px-1 text-xs font-[600]">
                {tab.value}
              </span>
            </TabsTrigger>
          ))}
          <div className="border-b-midnight-gray-200 flex h-full w-full border-b-[1.5px]" />
        </TabsList>
        {/* Filters */}
        <div className="flex w-full items-center justify-between bg-white px-5 pt-4">
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
            <Card className="flex flex-1 rounded-none border-t-0 border-none p-5">
              <DataTable contracts={contracts}/>
              {/* <EmptyBoxCard/> */}
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
