"use client";

import Logo from "@/shared/icons/logo";
import { Button } from "../../shared/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import DocumentIcon from "@/shared/icons/document";
import InboxIcon from "@/shared/icons/inbox";
import TemplatesIcon from "@/shared/icons/templates";
import { Bell, ChevronDown } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function NavBar() {
  const pathName = usePathname();

  const tabItems = [
    { label: "documents", icon: DocumentIcon },
    { label: "inbox", icon: InboxIcon },
    { label: "templates", icon: TemplatesIcon },
  ];

  return (
    <div className="w-full flex justify-between px-4 py-3 bg-white relative">
      {/* Left - Logo */}
      <div className="flex gap-2 items-center">
        <Logo />
        <Link href={"/"}>
          <span className="font-[700] text-xl text-silicon tracking-[-0.26px]">
            Delta Sign
          </span>
        </Link>
      </div>

      {/* Center - Tabs */}
      {pathName !== "/sign-in" && (
        <div className="flex gap-4 justify-center items-center absolute left-1/2 top-0 transform -translate-x-1/2 h-full">
          {tabItems.map((item, index) => {
            const isActive = pathName === "/" + item.label;

            return (
              <div key={index} className="h-full flex items-center relative">
                <Link href={`/${item.label}`}>
                  <div
                    className={cn(
                      "relative flex gap-2 items-center font-[500] text-midnight-gray-600 text-sm leading-5 capitalize px-3 py-2",
                      isActive && "font-[600] text-silicon",
                    )}
                  >
                    {<item.icon />}
                    {item.label}

                    {/* Grow/Shrink background animation */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 bg-silicon-100 rounded-[100px] z-[-1]"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                          }}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </Link>

                {/* Underline scale animation */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 h-[3px] w-full bg-silicon rounded-full"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      exit={{ scaleX: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                    />
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* Right - Profile / Buttons */}
      <div className="flex gap-2">
        {pathName === "/sign-in" ? (
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
