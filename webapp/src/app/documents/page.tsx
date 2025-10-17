'use client';
import { useState, useEffect } from 'react';
import CreateFolderCard from './components/cards/create-folder-card';
import PageAnimation from '@/shared/ui/page-animation';
import { useGetDocumentsQuery, usePostDocumentMutation } from './api/documents';
import { useGetContractsQuery } from './api/contracts';
import { contractsColumn } from './components/contracts-column';
import { draftsColumn } from './components/drafts-column';
import DataTable from '@/shared/ui/data-table';
import { FiltersTab } from './components/filters-tab';
import { ChevronDown, Calendar } from 'lucide-react';
import DraftsIcon from '@/shared/icons/drafts';
import PendingIcon from '@/shared/icons/pending';
import CompletedIcon from '@/shared/icons/completed';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import type { Contract } from './types/contract';
import type { Document } from './types/document';

interface TableConfig<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick: (row: Row<T>) => void;
}

export default function Page() {
  const { data: documents } = useGetDocumentsQuery();
  const { data: contracts } = useGetContractsQuery();
  const [postDocument] = usePostDocumentMutation();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get active tab from URL or default to 'All Contracts'
  const activeTab = searchParams.get('tab') || 'All Contracts';

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
  const [currentTable, setCurrentTable] = useState<TableConfig<any> | null>(null);

  // --- Update table based on active tab ---
  useEffect(() => {
    if (activeTab === 'All Contracts' && contracts) {
      setCurrentTable({
        data: contracts,
        columns: contractsColumn,
        onRowClick: (row: Row<Contract>) => {
          router.push(`/documents/${row.original.uuid}`);
        },
      });
    } else if (activeTab === 'Drafts' && documents) {
      setCurrentTable({
        data: documents,
        columns: draftsColumn,
        onRowClick: (row: Row<Document>) => {
          router.push(`/documents/${row.original.uuid}`);
        },
      });
    } else if (activeTab === 'Pending' || activeTab === 'Completed') {
      setCurrentTable(null);
    }
  }, [activeTab, contracts, documents, router]);

  // --- Handle tab switching ---
  const handleTabChange = (value: string) => {
    // Update URL with new tab value
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handlePost = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    await postDocument(formData);
  };

  return (
    <PageAnimation>
      <p className="text-midnight-gray-900 text-2xl leading-[36px] font-[700]">
        All files
      </p>
      <CreateFolderCard />
      <DataTable
        defaultValue={activeTab}
        items={tabItems.map((t) => ({
          label: t.label,
          count: t.count,
          value: t.value,
          icon: t.icon,
        }))}
        filtersTab={<FiltersTab filters={filters} showUploadButton onUpload={handlePost} />}
        tableData={currentTable}
        onTabChange={handleTabChange}
      />
    </PageAnimation>
  );
}