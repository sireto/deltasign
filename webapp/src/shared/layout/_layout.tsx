"use client";
import NavBar from "./components/nav-bar";
import Footer from "./components/footer";
import { usePathname } from "next/navigation";
import { useGetDemoApiQuery } from "../store/demo";
import { useEffect } from "react";
import ReduxProvider from "../store/provider/redux-provider";
import { cn } from "@/lib/utils";

interface ILayoutProps {
  className?: string;
}

export default function Layout({
  children,
  className,
}: React.PropsWithChildren<ILayoutProps>) {
  const pathName = usePathname();

  const { data } = useGetDemoApiQuery({ name: "World" });

  useEffect(() => {
    console.log(data);
  }, [data]);

  const hideNavBar =
    pathName.startsWith("/documents/") && pathName !== "/documents";

  return (
    <ReduxProvider>
      <div className={cn("flex min-h-screen flex-col", className)}>
        {!hideNavBar && <NavBar />}
        {children}
        {pathName === "/sign-in" && <Footer />}
      </div>
    </ReduxProvider>
  );
}
