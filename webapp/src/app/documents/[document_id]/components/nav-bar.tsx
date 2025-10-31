"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/button";
import { ArrowLeft, File, SendHorizonal } from "lucide-react";
import { Share2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NavBar({
  className,
  fileName,
  onSendDocument,
  disabledSendDocument
}: {
  className?: string;
  fileName: string;
  onSendDocument : () => void,
  disabledSendDocument : boolean
}) {
  const router = useRouter();
  return (
    <div
      className={cn(
        "flex h-full w-full justify-between bg-white px-5 py-3",
        className,
      )}
    >
      <Button variant="secondary" onClick={() => router.back()}>
        <ArrowLeft />
        <span className="font-[500]">Back</span>
      </Button>
      <div className="flex items-center gap-2">
        <File size={16} className="text-midnight-gray-900" />
        <span className="text-midnight-gray-900 text-sm font-[500]">
          {fileName}
        </span>
        <span className="text-midnight-gray-300">|</span>
        <span className="text-midnight-gray-600 border-midnight-gray-300 rounded-sm border px-1 py-[2px] text-xs font-[500]">
          Drafts
        </span>
      </div>
      <div className="flex gap-3">
        <Button variant="outline">
          <Share2 />
          Share
        </Button>
        <Button disabled={disabledSendDocument} onClick={onSendDocument}>
          <SendHorizonal />
          Send Document
        </Button>
      </div>
    </div>
  );
}
