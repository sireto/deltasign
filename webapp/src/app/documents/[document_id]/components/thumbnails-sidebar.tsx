import { thumbnailPlugin } from "@react-pdf-viewer/thumbnail";
import "@react-pdf-viewer/thumbnail/lib/styles/index.css";
import { cn } from "@/lib/utils";

export interface ThumbnailsSidebarProps {
  currentPage: number;
  onThumbnailClick: (pageIndex: number) => void;
  thumbnailPluginInstance: ReturnType<typeof thumbnailPlugin>;
}

export default function ThumbnailsSidebar({
  currentPage,
  onThumbnailClick,
  thumbnailPluginInstance,
}: ThumbnailsSidebarProps) {
  const { Thumbnails } = thumbnailPluginInstance;

  return (
    <div className="flex overflow-clip rounded-[8px]">
      <div className="h-[calc(100vh-82px)] min-w-[130px] bg-white p-2">
        <Thumbnails
          renderThumbnailItem={(thumbnail) => (
            <div
              key={thumbnail.pageIndex}
              onClick={() => onThumbnailClick(thumbnail.pageIndex)}
              className="cursor-pointer"
            >
              <p className="text-midnight-gray-900 mb-1 text-xs font-[500]">
                {thumbnail.pageIndex < 10
                  ? `0${thumbnail.pageIndex + 1}`
                  : thumbnail.pageIndex + 1}
              </p>
              <div
                className={cn(
                  thumbnail.pageIndex === currentPage - 1
                    ? "border-silicon-400 border-[1px]"
                    : "border-midnight-gray-200 border-[1px]",
                  "mb-2 overflow-hidden rounded-[4px]"
                )}
              >
                {thumbnail.renderPageThumbnail}
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}