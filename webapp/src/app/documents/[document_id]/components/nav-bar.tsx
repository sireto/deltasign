"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/button";
import { ArrowLeft, File } from "lucide-react";
import { Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ComponentType } from "react";

export default function NavBar({
  className,
  fileName,
  RenderButton,
  contractStatus,
}: {
  className?: string;
  fileName: string;
  contractStatus?: string;
  RenderButton: ComponentType;
}) {
  const router = useRouter();
  return (
    <div
      className={cn(
        "flex h-full w-full justify-between bg-white px-5 py-3",
        className,
      )}
    >
      <Button
        variant="secondary"
        onClick={() => router.back()}
        className="hover:cursor-pointer"
      >
        <ArrowLeft />
        <span className="font-[500]">Back</span>
      </Button>
      <div className="flex items-center gap-2">
        <File size={16} className="text-midnight-gray-900" />
        <span className="text-midnight-gray-900 text-sm font-[500]">
          {fileName}
        </span>
        <span className="text-midnight-gray-300">|</span>
        {contractStatus && (
          <span className="text-midnight-gray-600 border-midnight-gray-300 rounded-sm border px-1 py-[2px] text-xs font-[500]">
            {contractStatus}
          </span>
        )}
      </div>
      <div className="flex gap-3">
        <Button variant="outline">
          <Share2 />
          Share
        </Button>
        <RenderButton />
      </div>
    </div>
  );
}
