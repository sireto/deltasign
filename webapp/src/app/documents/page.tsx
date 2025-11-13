"use client";
import { useState, useEffect, useMemo } from "react";
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
import DraftsIcon from "@/shared/icons/drafts";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import type { Contract } from "./types/contract";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

interface PostDocumentError {
  data: {
    detail: string;
  };
}
interface TableConfig<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick: (row: Row<T>) => void;
}

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const activeTab = searchParams.get("tab") || "All Contracts";

  // ✅ Map tab name to API query parameter
  const currentStatus = useMemo(() => {
    switch (activeTab) {
      case "Drafts":
        return ContractStatus.DRAFT;
      case "Pending":
        return ContractStatus.PENDING;
      case "Completed":
        return ContractStatus.FULLY_SIGNED;
      default:
        return undefined; // for "All Contracts"
    }
  }, [activeTab]);

  // ✅ Fetch only for the current tab
  const { data: contracts, isLoading } = useGetContractsQuery(currentStatus);

  const [
    postDocument,
    {
      isLoading: postingDocument,
      isSuccess: onDocumentPostSuccess,
      isError,
      error,
    },
  ] = usePostDocumentMutation();

  const tabItems = [
    { label: "All Contracts", value: "All Contracts" , count : 0 },
    { label: "Drafts", value: "Drafts", icon: DraftsIcon , count : 0 },
    { label: "Pending", value: "Pending", icon: PendingIcon  , count : 0},
    { label: "Completed", value: "Completed", icon: CompletedIcon , count :0},
  ];

  const filters = [
    { label: "Sender", icon: ChevronDown },
    { label: "Status", icon: ChevronDown },
    { label: "All time", icon: Calendar },
  ];

  const currentTable: TableConfig<Contract> | null = contracts
    ? {
        data: contracts,
        columns: contractsColumn,
        onRowClick: (row: Row<Contract>) =>
          router.push(`/documents/${row.original.uuid}`),
      }
    : null;

  useEffect(() => {
    if (onDocumentPostSuccess) {
      toast.success("Document posted successfully!", { theme: "light" });
    } else if (isError) {
      toast.error(
        `Failed to post document. ${
          (error as PostDocumentError)?.data.detail || "Unknown error"
        }`,
        { theme: "colored" },
      );
    }
  }, [onDocumentPostSuccess, isError, error]);

  useEffect(() => {
    if (postingDocument) {
      toast.info("Uploading document...", { autoClose: 2000, theme: "light" });
    }
  }, [postingDocument]);

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handlePost = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    await postDocument(formData);
    dispatch(contractsAPI.util.invalidateTags(["Contract"]));
  };

  return (
    <PageAnimation>
      <p className="text-midnight-gray-900 text-2xl font-[700] leading-[36px]">
        All files
      </p>

      <DataTable
        defaultValue={activeTab}
        items={tabItems}
        filtersTab={
          <FiltersTab
            filters={filters}
            showUploadButton
            onUpload={handlePost}
            disableUploadButton={postingDocument}
            hideFilters
          />
        }
        tableData={currentTable}
        onTabChange={handleTabChange}
        // loading={isLoading}
      />
    </PageAnimation>
  );
}
