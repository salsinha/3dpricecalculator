"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { useToast } from "@/components/Toast";
import { toUserMessage } from "@/lib/errors";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/services/auth";

export default function Header({ email, onMenu }) {
  const router = useRouter();
  const toast = useToast();

  async function logout() {
    try {
      await signOut(createClient());
      router.push("/login");
      router.refresh();
    } catch (error) {
      toast.error(toUserMessage(error));
    }
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-line bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenu}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line lg:hidden"
        aria-label="Abrir menu"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
      <p className="hidden text-sm font-medium text-ink lg:block">3D J.A. · Price Calculator</p>
      <div className="ml-auto flex items-center gap-3">
        <span className="hidden max-w-[14rem] truncate text-sm text-muted sm:block">{email}</span>
        <Button variant="secondary" className="px-3 py-2 lg:hidden" onClick={logout}>
          Sair
        </Button>
      </div>
    </header>
  );
}
