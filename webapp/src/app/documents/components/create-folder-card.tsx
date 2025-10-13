import PlusIcon from "@/shared/icons/plus";
import { Card } from "@/shared/ui/card";

export default function CreateFolderCard({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <Card className="gap-y-4 h-fit w-fit p-5 rounded-lg">
      <div className="border border-midnight-gray-200 rounded-sm p-1 border-[1.5px] w-[32px] h-[32px] flex items-center justify-center">
        <PlusIcon className="text-midnight-gray-900" />
      </div>
      <div>
        <p className="text-midnight-gray-900 font-[600] text-sm">
          {title || "Create a Folder"}
        </p>
        <p className="text-midnight-gray-600 text-sm">
          {description || "Organize your documents"}
        </p>
      </div>
    </Card>
  );
}
