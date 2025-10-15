'use client';

import { useState, useEffect } from 'react';
import CreateFolderCard from './components/cards/create-folder-card';
import PageAnimation from '@/shared/ui/page-animation';
import { useGetDocumentsQuery } from './api/documents';
import { useGetContractsQuery } from './api/contracts';
import { contractsColumn } from './components/contracts-column';
import { draftsColumn } from './components/drafts-column';
import DataTable from '@/shared/ui/data-table';
import { FiltersTab } from './components/filters-tab';
import { ChevronDown, Calendar } from 'lucide-react';
import DraftsIcon from '@/shared/icons/drafts';
import PendingIcon from '@/shared/icons/pending';
import CompletedIcon from '@/shared/icons/completed';
import type { ColumnDef } from '@tanstack/react-table';

export default function Page() {
  const { data: documents } = useGetDocumentsQuery();
  const { data: contracts } = useGetContractsQuery();

  // --- Tab items ---
  const tabItems = [
    { label: 'All Contracts', count: contracts?.length ?? 0, value: 'All Contracts' },
    { label: 'Drafts', count: documents?.length ?? 0, value: 'Drafts', icon: DraftsIcon },
    { label: 'Pending', count: 0, value: 'Pending', icon: PendingIcon },
    { label: 'Completed', count: 0, value: 'Completed', icon: CompletedIcon },
  ];

  // --- Filters ---
  const filters = [
    { label: 'Sender', icon: ChevronDown },
    { label: 'Status', icon: ChevronDown },
    { label: 'All time', icon: Calendar },
  ];

  // --- State for current table data ---
  const [currentTable, setCurrentTable] = useState<{
    data: unknown[];
    columns: ColumnDef<unknown>[];
  }|null>({
    data: [],
    columns: [],
  });

  // --- Set default table once contracts load ---
  useEffect(() => {
    if (contracts) {
      setCurrentTable({
        data: contracts,
        columns: contractsColumn as ColumnDef<unknown>[],
      });
    }
  }, [contracts]);

  // --- Handle tab switching ---
  const handleTabChange = (value: string) => {
    if (value === 'All Contracts') {
      setCurrentTable({
        data: contracts || [],
        columns: contractsColumn as ColumnDef<unknown>[],
      });
    } else if (value === 'Drafts') {
      setCurrentTable({
        data: documents || [],
        columns: draftsColumn as ColumnDef<unknown>[],
      });
    } else {
      setCurrentTable(null);
    }
  };

  return (
    <PageAnimation>
      <p className="text-midnight-gray-900 text-2xl leading-[36px] font-[700]">
        All files
      </p>

      <CreateFolderCard />

      <DataTable
        defaultValue="All Contracts"
        items={tabItems.map((t) => ({
          label: t.label,
          count: t.count,
          value: t.value,
          icon: t.icon,
        }))}
        filtersTab={<FiltersTab filters={filters} />}
        tableData={currentTable}
        onTabChange={handleTabChange}
      />
    </PageAnimation>
  );
}
