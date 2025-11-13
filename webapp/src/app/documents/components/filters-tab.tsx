import { useRef } from "react";
import { SearchInput } from "@/shared/ui/search-input";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/shared/ui/dropdown-menu";
import { Button } from "@/shared/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface filter {
  label: string;
  icon: React.JSXElementConstructor<React.SVGProps<SVGSVGElement>>;
}

export const FiltersTab = ({
  filters,
  showUploadButton,
  onUpload,
  disableUploadButton,
  hideFilters = false,
}: {
  filters: filter[];
  showUploadButton?: boolean;
  onUpload?: (file: File) => void;
  disableUploadButton: boolean;
  hideFilters?: boolean;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
    }
    e.target.value = "";
  };

  return (
    <div className="flex w-full items-center justify-between bg-white px-5 pt-4">
      <div className="flex w-full gap-2">
        {/* <SearchInput className="h-[36px] w-[250px]" placeholder="Search" /> */}
        {!hideFilters &&
          filters.map((filter, index) => (
            <DropdownMenu key={index}>
              <DropdownMenuTrigger>
                <span className={cn("text-midnight-gray-900")}>
                  {filter.label}
                </span>
                <filter.icon className="text-midnight-gray-900 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Receiver</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
      </div>
      {showUploadButton && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            onClick={handleButtonClick}
            className="flex gap-1"
            disabled={disableUploadButton}
          >
            <Plus className="h-6 w-6 text-white" strokeWidth={3} />
            <span>Upload Document</span>
          </Button>
        </div>
      )}
    </div>
  );
};
