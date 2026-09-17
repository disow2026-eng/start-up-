"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/loads", label: "Loads" },
  { href: "/dashboard/claims", label: "Claims" },
  { href: "/dashboard/settings", label: "Settings" },
] as const;

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-ink-100 bg-white/95 backdrop-blur lg:hidden">
      {NAV.map((item) => {
        const active = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 py-3 text-center text-xs font-semibold ${
              active ? "text-amber" : "text-ink-400"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
