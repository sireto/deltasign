"use client";

import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Circle,
  CircleCheck,
  Mail,
} from "lucide-react";
import NavBar from "./components/nav-bar";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Select, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import dynamic from "next/dynamic";

export default function Page() {
  const tools = [
    {
      label: "Signature",
    },
    {
      label: "Initials",
    },
    {
      label: "Name",
    },
    {
      label: "Number",
    },
    {
      label: "Date",
      icon: Calendar,
    },
    {
      label: "Email",
      icon: Mail,
    },
    { label: "Radio", icon: Circle },
    { label: "Checkbox", icon: CircleCheck },
    { label: "Dropdown", icon: ChevronDown },
  ];

  const PDFViewer = dynamic(() => import("./components/pdf-viewer"), {
    ssr: false,
  });

  return (
    <div>
      <NavBar className="sticky top-0" />
      <div className="flex w-full h-full justify-between p-3">
        <PDFViewer file={"/sample.pdf"} />
        <div className="border-midnight-gray-200 border-[1px] rounded-lg overflow-clip">
          <div className="flex gap-4 items-center bg-midnight-gray-50 py-4 px-5">
            <div>
              <p className="text-lg text-midnight-gray-900 font-[600]">
                General Settings
              </p>
              <p className="text-sm text-midnight-gray-600">
                Configure general settings for the document.
              </p>
            </div>
            <ChevronUp size={16} />
          </div>
          <div className="flex flex-col gap-3 p-4 bg-white border-t-[1px] border-b-[1px] border-midnight-gray-200">
            <div className="flex flex-col gap-2">
              <Label>Title</Label>
              <Input defaultValue={"Lawyers Term and condition"} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Language</Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="english"></SelectValue>
                </SelectTrigger>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Document access</Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="No restrictions"></SelectValue>
                </SelectTrigger>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Document visibility</Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Everyone"></SelectValue>
                </SelectTrigger>
              </Select>
            </div>
          </div>
          <div className="flex gap-4 items-center bg-midnight-gray-50 p-4 ">
            <div>
              <p className="text-lg text-midnight-gray-900 font-[600]">Tools</p>
              <p className="text-sm text-midnight-gray-600">
                Add all relevant fields for each recipent.
              </p>
            </div>
          </div>
          <div className="bg-white py-4 px-5 grid grid-cols-2 gap-3 border-t-[1px] border-b-[1px] border-midnight-gray-200">
            {tools.map((tool) => (
              <div key={tool.label}>
                <Button
                  className="w-full px-[10px] py-[20px] gap-2"
                  variant={"outline"}
                >
                  {tool.icon && (
                    <tool.icon className="text-midnight-gray-600" />
                  )}
                  <span className="text-midnight-gray-600 text-md font-[500] leading-5">
                    {tool.label}
                  </span>
                </Button>
              </div>
            ))}
          </div>
          <div className="bg-white h-12" />
        </div>
      </div>
    </div>
  );
}
