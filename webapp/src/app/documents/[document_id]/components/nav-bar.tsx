import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/button";
import { ArrowLeft, File, SendHorizonal } from "lucide-react";
import { Share2 } from "lucide-react";
import Link from "next/link";

export default function NavBar({className}:{className?:string}) {
  return (
    <div className={cn("bg-white py-3 px-5 w-full flex justify-between h-full" , className)}>
      <Link href={"/documents"}>
        <Button variant="secondary">
          <ArrowLeft />
          <span className="font-[500]">Back</span>
        </Button>
      </Link>
      <div className="flex items-center gap-2">
        <File size={16} className="text-midnight-gray-900" />
        <span className="text-sm text-midnight-gray-900 font-[500]">
          lawyers_term_and_condition.pdf
        </span>
        <span className="text-midnight-gray-300">|</span>
        <span className="text-xs text-midnight-gray-600 font-[500] px-1 py-[2px] border border-midnight-gray-300 rounded-sm">
          Drafts
        </span>
      </div>
      <div className="flex gap-3">
        <Button variant="secondary">
          <Share2 />
          Share
        </Button>
        <Button>
          <SendHorizonal />
          Send Document
        </Button>
      </div>
    </div>
  );
}
