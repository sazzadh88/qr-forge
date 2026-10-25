"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const path = usePathname();
  const on = href === "/dashboard" ? path === href : path.startsWith(href);
  return (
    <Link href={href} className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap ${on ? "bg-paper text-ink" : "text-paper/70 hover:bg-paper/10 hover:text-paper"}`}>
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
