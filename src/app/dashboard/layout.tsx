import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { logout } from "@/lib/actions";
import { Wordmark } from "@/components/icons";
import { NavLink } from "@/components/dash";

export const metadata = { title: "Dashboard · QRForge" };

const NAV: [string, string, string][] = [
  ["/dashboard", "My QR codes", "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 18h2v2h-2z"],
  ["/dashboard/new", "Create QR code", "M12 5v14M5 12h14"],
  ["/dashboard/analytics", "Analytics", "M4 20V10M10 20V4M16 20v-7M22 20H2"],
  ["/dashboard/templates", "Templates", "M4 4h16v6H4zM4 14h7v6H4zM15 14h5v6h-5z"],
  ["/dashboard/bulk", "Bulk creation", "M4 6h16M4 12h16M4 18h10"],
  ["/dashboard/settings", "Settings", "M12 15a3 3 0 100-6 3 3 0 000 6zM19 12a7 7 0 00-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 00-2-1.2L14 3h-4l-.5 2.6a7 7 0 00-2 1.2l-2.4-1-2 3.4 2 1.6a7 7 0 000 2.4l-2 1.6 2 3.4 2.4-1a7 7 0 002 1.2L10 21h4l.5-2.6a7 7 0 002-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z"],
];

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const user = await requireUser();
  return (
    <div className="flex min-h-screen flex-col bg-paper md:flex-row">
      <aside className="grid-bg bg-ink text-paper md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0">
        <div className="flex h-16 items-center px-5">
          <Link href="/">
            <Wordmark />
          </Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
          {NAV.map(([href, label, d]) => (
            <NavLink key={href} href={href}>
              <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={d} />
              </svg>
              {label}
            </NavLink>
          ))}
          <Link href="/api-docs" className="rounded-md px-3 py-2 text-sm text-paper/50 hover:text-paper md:mt-4">
            API docs ↗
          </Link>
        </nav>
        <div className="hidden border-t border-paper/10 p-4 md:absolute md:bottom-0 md:block md:w-full">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="truncate text-xs text-paper/50">{user.email}</p>
          <form action={logout}>
            <button className="mt-2 text-sm text-paper/70 hover:text-ember">Log out</button>
          </form>
        </div>
      </aside>
      <div className="min-w-0 flex-1 p-4 sm:p-8">{children}</div>
    </div>
  );
}
