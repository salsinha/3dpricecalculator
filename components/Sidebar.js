"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { NAV, NavIcon } from "@/components/navigation";
import { useToast } from "@/components/Toast";
import { toUserMessage } from "@/lib/errors";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/services/auth";

export default function Sidebar({ email }) {
  const pathname = usePathname();
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
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-sidebar text-white lg:flex">
      <div className="flex items-center gap-3 px-5 py-6">
        <Logo className="h-20 w-auto" />
        <div>
          <p className="text-sm font-semibold">3D J.A.</p>
          <p className="text-xs text-white/55">Price Calculator</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className={active ? "text-accent" : ""}>
                <NavIcon name={item.icon} />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <p className="truncate text-xs text-white/50">{email}</p>
        <button
          type="button"
          onClick={logout}
          className="mt-3 w-full rounded-xl px-3 py-2 text-left text-sm text-white/80 hover:bg-white/5"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}
