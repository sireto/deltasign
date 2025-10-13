'use client';
import NavBar from './components/nav-bar';
import Footer from './components/footer';
import { usePathname } from 'next/navigation';

interface ILayoutProps {
  className?: string;
}

export default function Layout({
  children,
  className,
}: React.PropsWithChildren<ILayoutProps>) {
  const pathName = usePathname();

  const hideNavBar =
    pathName.startsWith('/documents/') && pathName !== '/documents';

  return (
    <div className="flex min-h-screen flex-col">
      {!hideNavBar && <NavBar />}
      {children}
      {pathName === '/sign-in' && <Footer />}
    </div>
  );
}
