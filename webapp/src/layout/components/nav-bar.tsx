"use client";
import Logo from "@/shared/icons/logo";
import { Button } from "../../shared/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import DocumentIcon from "@/shared/icons/document";
import InboxIcon from "@/shared/icons/inbox";
import TemplatesIcon from "@/shared/icons/templates";
import { Bell, ChevronDown, UserRound } from "lucide-react";
import Image from "next/image";

export default function NavBar() {
  const pathName = usePathname();

  const tabItems = [
    {
      label: "documents",
      icon: DocumentIcon,
    },
    {
      label: "inbox",
      icon: InboxIcon,
    },
    {
      label: "templates",
      icon: TemplatesIcon,
    },
  ];

  return (
    <div className="w-full flex justify-between px-4 py-3 bg-white">
      <div className="flex gap-2 items-center">
        <Logo />
        <Link href={"/"}>
          <span className="font-[700] text-xl text-silicon tracking-[-0.26px]">
            Delta Sign
          </span>
        </Link>
      </div>
      {pathName != "/sign-in" && (
        <div className="flex gap-4 justify-center items-center">
          {tabItems.map((item, index) => (
            <Link href={item.label} key={index}>
              <div
                className={cn(
                  "flex gap-2 items-center font-[500] text-midnight-gray-600 text-sm tracking-[-0.26px] leading-5 capitalize tracking-[-0.09px]",
                  pathName == "/" + item.label &&
                    "text-silicon bg-silicon-100 p-2 rounded-[100px] font-[600]",
                )}
              >
                {<item.icon />}
                {item.label}
              </div>
            </Link>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        {pathName == "/sign-in" ? (
          <>
            <Button variant={"outline"}>Sign Up</Button>
            <Link href={"/sign-in"}>
              <Button>Login</Button>
            </Link>
          </>
        ) : (
          <div className="flex h-full items-center gap-2">
            <div className="border border-midnight-gray-200 p-2 rounded-full">
              <Bell size={16} />
            </div>
            <div className="flex items-center gap-2 border-[1.5px] p-[6px] rounded-[100px]">
              <Image
                src="/placeholder.png"
                alt="placeholder"
                width={24}
                height={24}
                className="rounded-full"
              />
              <p className="text-sm text-midnight-gray-900 font-[600]">
                Bastion Zuid
              </p>
              <ChevronDown size={16} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
