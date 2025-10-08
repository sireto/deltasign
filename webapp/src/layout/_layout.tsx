"use client";
import NavBar from "./components/nav-bar";
import Footer from "./components/footer";
import { usePathname } from "next/navigation";

interface ILayoutProps {
  className?: string;
}

export default function Layout({
  children,
  className,
}: React.PropsWithChildren<ILayoutProps>) {
  const pathName = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      {children}
      {pathName === "/sign-in" && <Footer />}
    </div>
  );
}
