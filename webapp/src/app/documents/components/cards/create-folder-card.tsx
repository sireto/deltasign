import PlusIcon from '@/shared/icons/plus';
import { Card } from '@/shared/ui/card';

export default function CreateFolderCard({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <Card className="h-fit w-fit gap-y-4 rounded-lg p-5">
      <div className="border-midnight-gray-200 flex h-[32px] w-[32px] items-center justify-center rounded-sm border border-[1.5px] p-1">
        <PlusIcon className="text-midnight-gray-900" />
      </div>
      <div>
        <p className="text-midnight-gray-900 text-sm font-[600]">
          {title || 'Create a Folder'}
        </p>
        <p className="text-midnight-gray-600 text-sm">
          {description || 'Organize your documents'}
        </p>
      </div>
    </Card>
  );
}
