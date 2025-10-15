'use client';

import CreateFolderCard from './components/cards/create-folder-card';
import PageAnimation from '@/shared/ui/page-animation';
import { useGetDocumentsQuery } from './api/documents';
import { useGetContractsQuery } from './api/contracts';
import { contractColumn } from './components/contract-column';

import DraftsIcon from "@/shared/icons/drafts"
import PendingIcon from "@/shared/icons/pending"
import CompletedIcon from "@/shared/icons/completed"
import DataTable from '@/shared/ui/data-table';
import { FiltersTab } from './components/filters-tab';
import { ChevronDown } from 'lucide-react';
import { Calendar } from 'lucide-react';

export default function Page<T>() {

  const {data : documents} = useGetDocumentsQuery();
  const {data : contracts} = useGetContractsQuery()

  const tabItems = [
        { label: "All Contracts", 
          count : contracts?.length, 
          value: "All Contracts", 
        },
        {
          label: "Drafts",
          count: documents?.length,
          value: "Drafts",
          icon: DraftsIcon,
        },
        {
          label: "Pending",
          count: 0,
          value: "Pending",
          icon: PendingIcon,
        },
        {
          label: "Completed",
          count: 0,
          value: "Completed",
          icon: CompletedIcon,
        },
      ];

      const filters = [
    {
        label : 'Sender',
        icon: ChevronDown
    },
    {
        label : 'Status',
        icon: ChevronDown
    },
    {
        label: 'All time',
        icon: Calendar
    }
    ]

  return (
    <PageAnimation>
      <p className="text-midnight-gray-900 text-2xl leading-[36px] font-[700]">
        All files
      </p>
      <CreateFolderCard />
      <DataTable 
          defaultValue="All Contracts" 
          items={tabItems} 
          filtersTab={<FiltersTab filters={filters}/>}
          tableData={{data: contracts || [], columns: contractColumn}}
      />
    </PageAnimation>
  );
}
