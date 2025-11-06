"use client";
import { useState, useEffect } from "react";
import CreateFolderCard from "./components/cards/create-folder-card";
import PageAnimation from "@/shared/ui/page-animation";
import { usePostDocumentMutation } from "./api/documents";
import {
  contractsAPI,
  ContractStatus,
  useGetContractsQuery,
} from "./api/contracts";
import { contractsColumn } from "./components/contracts-column";
import DataTable from "@/shared/ui/data-table";
import { FiltersTab } from "./components/filters-tab";
import { ChevronDown, Calendar } from "lucide-react";
import PendingIcon from "@/shared/icons/pending";
import CompletedIcon from "@/shared/icons/completed";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import type { Contract } from "./types/contract";
import DraftsIcon from "@/shared/icons/drafts";
import { useDispatch } from "react-redux";

interface TableConfig<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick: (row: Row<T>) => void;
}

export default function Page() {
  const { data: draftContracts } = useGetContractsQuery(ContractStatus.DRAFT);
  const { data: pendingContracts } = useGetContractsQuery(
    ContractStatus.PENDING,
  );
  const { data: completedContracts } = useGetContractsQuery(
    ContractStatus.FULLY_SIGNED,
  );
  const { data: allContracts } = useGetContractsQuery();
  const [postDocument] = usePostDocumentMutation();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get active tab from URL or default to 'All Contracts'
  const activeTab = searchParams.get("tab") || "All Contracts";

  // --- Tab items ---
  const tabItems = [
    {
      label: "All Contracts",
      count: allContracts?.length ?? 0,
      value: "All Contracts",
    },
    {
      label: "Drafts",
      count: draftContracts?.length ?? 0,
      value: "Drafts",
      icon: DraftsIcon,
    },
    {
      label: "Pending",
      count: pendingContracts?.length ?? 0,
      value: "Pending",
      icon: PendingIcon,
    },
    {
      label: "Completed",
      count: completedContracts?.length ?? 0,
      value: "Completed",
      icon: CompletedIcon,
    },
  ];

  // --- Filters ---
  const filters = [
    { label: "Sender", icon: ChevronDown },
    { label: "Status", icon: ChevronDown },
    { label: "All time", icon: Calendar },
  ];

  // --- State for current table data ---
  const [currentTable, setCurrentTable] = useState<TableConfig<any> | null>(
    null,
  );

  useEffect(() => {
    let data: Contract[] | undefined;

    switch (activeTab) {
      case "All Contracts":
        data = allContracts;
        break;
      case "Drafts":
        data = draftContracts;
        break;
      case "Pending":
        data = pendingContracts;
        break;
      case "Completed":
        data = completedContracts;
        break;
      default:
        data = [];
    }

    if (data && data.length > 0) {
      setCurrentTable({
        data,
        columns: contractsColumn,
        onRowClick: (row: Row<Contract>) => {
          router.push(`/documents/${row.original.uuid}`);
        },
      });
    } else {
      setCurrentTable(null);
    }
  }, [
    activeTab,
    allContracts,
    draftContracts,
    pendingContracts,
    completedContracts,
    router,
  ]);

  // --- Handle tab switching ---
  const handleTabChange = (value: string) => {
    // Update URL with new tab value
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const dispatch = useDispatch();

  const handlePost = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    await postDocument(formData);
    dispatch(contractsAPI.util.invalidateTags(["Contract"]));
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
        filtersTab={
          <FiltersTab
            filters={filters}
            showUploadButton
            onUpload={handlePost}
            hideFilters
          />
        }
        tableData={currentTable}
        onTabChange={handleTabChange}
      />
    </PageAnimation>
  );
}
