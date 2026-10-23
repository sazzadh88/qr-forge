"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const path = usePathname();
  const on = href === "/dashboard" ? path === href : path.startsWith(href);
  return (
    <Link href={href} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap ${on ? "bg-brand-50 text-brand" : "text-slate-600 hover:bg-slate-100"}`}>
      {children}
    </Link>
  );
}

// Submit button that asks before running a destructive server action.
export function ConfirmButton({ message, className, children }: { message: string; className?: string; children: React.ReactNode }) {
  return (
    <button className={className} onClick={(e) => !confirm(message) && e.preventDefault()}>
      {children}
    </button>
  );
}
