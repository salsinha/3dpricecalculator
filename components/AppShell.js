"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { ToastProvider } from "@/components/Toast";

export default function AppShell({ email, children }) {
  const [open, setOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-paper">
        <Sidebar open={open} email={email} onClose={() => setOpen(false)} />
        {open ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
          />
        ) : null}
        <div className="lg:pl-64">
          <Header email={email} onMenu={() => setOpen(true)} />
          <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
