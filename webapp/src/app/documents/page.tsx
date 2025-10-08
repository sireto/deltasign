import CreateFolderCard from "./components/create-folder-card";
import DocumentsTab from "./components/documents-tab";

export default function Page() {
  return (
    <div className="flex h-full w-full flex-1 py-[32px] px-[160px] flex-col gap-[24px]">
      <p className="font-[700] text-2xl text-midnight-gray-900 leading-[36px]">
        All files
      </p>
      <CreateFolderCard />
      <DocumentsTab />
    </div>
  );
}
