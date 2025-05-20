import { ReactNode } from "react";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar className="hidden lg:flex" />
        <MobileNav />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
