"use client";

import Logo from "@/shared/icons/logo";
import { Button } from "@/shared/ui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import DocumentIcon from "@/shared/icons/document";
import InboxIcon from "@/shared/icons/inbox";
import TemplatesIcon from "@/shared/icons/templates";
import { Bell, ChevronDown, Settings } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/shared/store/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { useLogoutUserMutation } from "@/shared/store/api/user-auth";
import { contractsAPI } from "@/app/documents/api/contracts";
import { documentsAPI } from "@/app/documents/api/documents";
import { usersAPI } from "../../../../state/api/users";

export default function NavBar() {
  const pathName = usePathname();

  const tabItems = [
    { label: "documents", icon: DocumentIcon },
    { label: "inbox", icon: InboxIcon },
    { label: "templates", icon: TemplatesIcon },
  ];

  const userName = useSelector((state: RootState) => state.user.name);

  const [logout] = useLogoutUserMutation();

  const router = useRouter();

  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await logout(null).unwrap();
      dispatch(usersAPI.util.resetApiState())
      dispatch(contractsAPI.util.resetApiState())
      dispatch(documentsAPI.util.resetApiState())
      router.push("/sign-in");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="relative flex w-full justify-between bg-white px-4 py-3">
      {/* Left - Logo */}
      <div className="flex items-center gap-2">
        <Logo />
        <Link href={"/"}>
          <span className="text-silicon text-xl font-[700] tracking-[-0.26px]">
            Delta Sign
          </span>
        </Link>
      </div>

      {/* Center - Tabs */}
      {pathName !== "/sign-in" && (
        <div className="absolute top-0 left-1/2 flex h-full -translate-x-1/2 transform items-center justify-center gap-4">
          {tabItems.map((item, index) => {
            const isActive = pathName === "/" + item.label;

            return (
              <div key={index} className="relative flex h-full items-center">
                <Link href={`/${item.label}`}>
                  <div
                    className={cn(
                      "text-midnight-gray-600 relative flex items-center gap-2 px-3 py-2 text-sm leading-5 font-[500] capitalize",
                      isActive && "text-silicon font-[600]",
                    )}
                  >
                    {<item.icon />}
                    {item.label}

                    {/* Grow/Shrink background animation */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          className="bg-silicon-100 absolute inset-0 z-[-1] rounded-[100px]"
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
                      className="bg-silicon absolute bottom-0 h-[3px] w-full rounded-full"
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
            {/* <Button variant={"outline"}>Sign Up</Button> */}
            {/* <Link href={"/sign-in"}>
              <Button>Login</Button>
            </Link> */}
          </>
        ) : (
          <div className="flex h-full items-center gap-2">
            <div className="border-midnight-gray-200 rounded-full border p-2">
              <Bell size={16} />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className="border-none focus-visible:shadow-none focus-visible:ring-0 focus-visible:outline-none active:border-none active:ring-0">
                <div className="flex items-center gap-2 rounded-[100px] border-[1.5px] p-[6px]">
                  <Image
                    src="/placeholder.png"
                    alt="placeholder"
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  <p className="text-midnight-gray-900 text-sm font-[600]">
                    {userName || "User"}
                  </p>
                  <ChevronDown size={16} />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem className="text-midnight-gray-900 flex items-center gap-2 px-4 py-2 text-sm font-[500]">
                  <Settings className="text-midnight-gray-900" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-midnight-gray-900 flex items-center gap-2 px-4 py-2 text-sm font-[500]"
                  onClick={handleLogout}
                >
                  <LogOut className="text-midnight-gray-900" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}
