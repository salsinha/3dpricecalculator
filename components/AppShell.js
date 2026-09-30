"use client";

import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";
import { ToastProvider } from "@/components/Toast";

export default function AppShell({ email, children }) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-paper">
        <Sidebar email={email} />
        <div className="lg:pl-64">
          <Header email={email} />
          <main className="mx-auto w-full max-w-6xl px-4 py-5 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-6 lg:px-8 lg:pb-8">
            {children}
          </main>
        </div>
        <MobileNav />
      </div>
    </ToastProvider>
  );
}
