"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV, NavIcon } from "@/components/navigation";

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Secções"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 px-0.5 py-2 text-[11px] leading-none ${
                  active ? "text-accent" : "text-muted"
                }`}
              >
                <NavIcon name={item.icon} />
                <span>{item.mobileLabel}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
