"use client";
import { Card } from "@/shared/ui/card";
import CreateFolderCard from "../documents/components/cards/create-folder-card";
import { SearchInput } from "@/shared/ui/search-input";
import { Button } from "@/shared/ui/button";
import { Plus } from "lucide-react";
import PageAnimation from "@/shared/ui/page-animation";
import DataTable from "@/shared/ui/data-table";

export default function Page() {
  return (
    <PageAnimation>
      <p className="text-midnight-gray-900 text-2xl leading-[36px] font-[700]">
        All files
      </p>
      <CreateFolderCard description="Organize your templates" />
      <Card className="px-5 py-4">
        <div className="flex w-full justify-between">
          <SearchInput placeholder="Search" />
          <Button>
            <Plus />
            Create Template
          </Button>
        </div>
      </Card>
    </PageAnimation>
  );
}
