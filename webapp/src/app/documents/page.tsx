"use client";

import { motion } from "framer-motion";
import CreateFolderCard from "./components/create-folder-card";
import DocumentsTab from "./components/documents-tab";
import PageAnimation from "@/shared/ui/page-animation";

export default function Page() {
  return (
    <PageAnimation>
      <p className="font-[700] text-2xl text-midnight-gray-900 leading-[36px]">
        All files
      </p>
      <CreateFolderCard />
      <DocumentsTab />
    </PageAnimation>
  );
}
