"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { useToast } from "@/components/Toast";
import { toUserMessage } from "@/lib/errors";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/services/auth";

const NAV = [
  { href: "/dashboard", label: "Painel", icon: "grid" },
  { href: "/pecas", label: "Peças", icon: "box" },
  { href: "/filamentos", label: "Filamentos", icon: "spool" },
  { href: "/calculadora", label: "Calculadora", icon: "calc" },
  { href: "/configuracoes", label: "Configurações", icon: "settings" },
];

function Icon({ name }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (name === "grid") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    );
  }
  if (name === "box") {
    return (
      <svg {...common}>
        <path d="M3 8l9-4 9 4-9 4-9-4z" />
        <path d="M3 8v8l9 4 9-4V8" />
        <path d="M12 12v8" />
      </svg>
    );
  }
  if (name === "spool") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3a9 9 0 100 18 9 9 0 000-18z" />
        <path d="M12 3v6M12 15v6" />
      </svg>
    );
  }
  if (name === "calc") {
    return (
      <svg {...common}>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M8 7h8M8 12h2M12 12h2M16 12h0M8 16h2M12 16h2M16 16h0" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" />
    </svg>
  );
}

export default function Sidebar({ open, email, onClose }) {
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
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-white transition-transform ${
        open ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
    >
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
              onClick={onClose}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className={active ? "text-accent" : ""}>
                <Icon name={item.icon} />
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
