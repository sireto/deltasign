import { ChevronUp } from "lucide-react";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface Tool {
  label: string;
  onClick: () => void;
}

export interface Signer {
  name: string;
  email: string;
}

export interface ContractSidebarProps {
  contractStatus: string;
  contractName: string;
  tools: Tool[];
  selectedTool: string;
  signers: Signer[];
  userEmail: string;
  addMyselfChecked: boolean;
  onAddRemoveSelf: (checked: boolean) => void;
  onTitleChange?: (title: string) => void;
}

export default function ContractSidebar({
  contractStatus,
  contractName,
  tools,
  selectedTool,
  signers,
  userEmail,
  addMyselfChecked,
  onAddRemoveSelf,
  onTitleChange,
}: ContractSidebarProps) {
  return (
    <div className="border-midnight-gray-200 overflow-clip rounded-lg border-[1.5px] bg-white">
      {/* General Settings - Only show in draft mode */}
      {contractStatus === "draft" && (
        <>
          <div className="bg-midnight-gray-50 flex items-center gap-4 px-5 py-4">
            <div>
              <p className="text-midnight-gray-900 text-lg font-[600]">
                General Settings
              </p>
              <p className="text-midnight-gray-600 text-sm">
                Configure general settings for the document.
              </p>
            </div>
            <ChevronUp size={16} />
          </div>

          <div className="border-midnight-gray-200 flex flex-col gap-3 border-t-[1px] border-b-[1px] bg-white p-4">
            <div className="flex flex-col gap-2">
              <Label>Title</Label>
              <Input
                defaultValue={contractName}
                onChange={(e) => onTitleChange?.(e.target.value)}
              />
            </div>
          </div>

          {/* Tools Section */}
          <div className="bg-midnight-gray-50 flex items-center gap-4 p-4">
            <div>
              <p className="text-midnight-gray-900 text-lg font-[600]">Tools</p>
              <p className="text-midnight-gray-600 text-sm">
                Add all relevant fields for each recipient.
              </p>
            </div>
          </div>

          <div className="border-midnight-gray-200 grid grid-cols-2 gap-3 border-t-[1px] border-b-[1px] bg-white px-5 py-4">
            {tools.map((tool) => (
              <div key={tool.label}>
                <Button
                  className={cn(
                    "w-full gap-2 px-[10px] py-[20px] active:border-blue-200",
                    selectedTool === tool.label && "border-blue-400",
                  )}
                  variant={"outline"}
                  onClick={tool.onClick}
                >
                  <span className="text-midnight-gray-600 text-md leading-5 font-[500]">
                    {tool.label}
                  </span>
                </Button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Signers Section */}
      <div className="bg-midnight-gray-50 border-midnight-gray-200 flex items-center gap-4 border-b-[1px] px-5 py-4">
        <div>
          <p className="text-midnight-gray-900 text-lg font-[600]">Signers</p>
          <p className="text-midnight-gray-600 text-sm">
            {contractStatus === "fully signed"
              ? "List of people who have signed the document"
              : "List of people who will sign the document"}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 bg-white px-5 py-3">
        {/* Add Yourself Toggle - Only show in draft mode */}
        {contractStatus === "draft" && (
          <div className="bg-midnight-gray-50 border-midnight-gray-200 flex justify-between rounded-[8px] border-[1px] p-[10px]">
            <span className="text-midnight-gray-900 text-sm font-[600]">
              Add yourself
            </span>
            <Switch
              onCheckedChange={onAddRemoveSelf}
              checked={addMyselfChecked}
            />
          </div>
        )}

        {/* Signers List */}
        {signers.map((signer, index) => (
          <div className="flex justify-between" key={index}>
            <div className="flex gap-3">
              <Image
                src="/placeholder.png"
                alt="placeholder"
                height={36}
                width={36}
                className="rounded-full"
              />
              <div className="flex flex-col">
                <span className="text-midnight-gray-900 text-xs font-[600]">
                  {signer.name || "User"} &nbsp;
                  <span className="text-silicon">
                    {signer.email === userEmail && "(You)"}
                  </span>
                </span>
                <span className="text-midnight-gray-600 truncate text-xs">
                  {signer.email}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
