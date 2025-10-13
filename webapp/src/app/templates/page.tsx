"use client";
import { Card } from "@/shared/ui/card";
import CreateFolderCard from "../documents/components/create-folder-card";
import { SearchInput } from "@/shared/ui/search-input";
import { Button } from "@/shared/ui/button";
import { Plus } from "lucide-react";
import TemplatesTable from "./components/templates-table";
import PageAnimation from "@/shared/ui/page-animation";

export default function Page() {
  return (
    <PageAnimation>
        <p className="font-[700] text-2xl text-midnight-gray-900 leading-[36px]">
          All files
        </p>
        <CreateFolderCard description="Organize your templates" />
        <Card className="px-5 py-4">
          <div className="flex w-full justify-between ">
            <SearchInput placeholder="Search" />
            <Button>
              <Plus />
              Create Template
            </Button>
          </div>
          <TemplatesTable />
        </Card>
    </PageAnimation>
  );
}
