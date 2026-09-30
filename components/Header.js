"use client";

import { usePathname, useRouter } from "next/navigation";
import Button from "@/components/Button";
import { NAV } from "@/components/navigation";
import { useToast } from "@/components/Toast";
import { toUserMessage } from "@/lib/errors";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/services/auth";

export default function Header({ email }) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const current = NAV.find((item) => item.href === pathname);

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
    <header className="sticky top-0 z-20 border-b border-line bg-white/90 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
        <p className="truncate text-sm font-semibold text-ink lg:hidden">{current?.label || "3D J.A."}</p>
        <p className="hidden text-sm font-medium text-ink lg:block">3D J.A. · Price Calculator</p>
        <div className="ml-auto flex items-center gap-3">
          <span className="hidden max-w-[14rem] truncate text-sm text-muted md:block">{email}</span>
          <Button variant="secondary" className="px-3 py-2 lg:hidden" onClick={logout}>
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
