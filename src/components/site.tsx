import Link from "next/link";
import { getUser } from "@/lib/auth";
import { TYPE_KEYS, TYPES } from "@/lib/payload";
import { Logo, TypeIcon } from "./icons";

function Dropdown({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="group relative">
      <button className="flex items-center gap-1 py-5 hover:text-brand">
        {label}
        <svg viewBox="0 0 20 20" className="size-4 transition group-hover:rotate-180" fill="currentColor" aria-hidden>
          <path d="M5.5 7.5L10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </button>
      <div className={`invisible absolute top-full left-0 rounded-2xl border border-slate-200 bg-white p-3 opacity-0 shadow-xl transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100 ${wide ? "w-[560px]" : "w-60"}`}>
        {children}
      </div>
    </div>
  );
}

export async function SiteHeader() {
  const user = await getUser();
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
          <Logo /> QRForge
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 lg:flex">
          <Dropdown label="Products" wide>
            <div className="grid grid-cols-3 gap-1">
              {TYPE_KEYS.map((t) => (
                <Link key={t} href={`/dashboard/new/${t}`} className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-slate-50">
                  <TypeIcon type={t} className="size-4 text-brand" /> {TYPES[t].label}
                </Link>
              ))}
            </div>
          </Dropdown>
          <Dropdown label="Resources">
            <Link href="/faq" className="block rounded-lg px-3 py-2 hover:bg-slate-50">
              Help center & FAQ
            </Link>
            <Link href="/api-docs" className="block rounded-lg px-3 py-2 hover:bg-slate-50">
              API documentation
            </Link>
            <Link href="/#features" className="block rounded-lg px-3 py-2 hover:bg-slate-50">
              Features
            </Link>
          </Dropdown>
          <Link href="/pricing" className="hover:text-brand">
            Plans and prices
          </Link>
          <Link href="/faq" className="hover:text-brand">
            FAQ
          </Link>
          <Link href="/api-docs" className="hover:text-brand">
            API
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <Link href="/dashboard" className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-brand hover:border-brand">
                Log in
              </Link>
              <Link href="/register" className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 px-4 py-12 sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1fr_3fr]">
        <div>
          <Link href="/" className="flex items-center gap-2 text-lg font-extrabold">
            <Logo /> QRForge
          </Link>
          <p className="mt-2 text-sm text-slate-500">Custom QR codes with hosted pages and scan analytics.</p>
          <div className="mt-4 flex flex-col gap-1 text-sm text-slate-600">
            <Link href="/pricing" className="hover:text-brand">Plans and prices</Link>
            <Link href="/faq" className="hover:text-brand">FAQ</Link>
            <Link href="/api-docs" className="hover:text-brand">API</Link>
          </div>
        </div>
        <ul className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3 lg:grid-cols-4">
          {TYPE_KEYS.map((t) => (
            <li key={t}>
              <Link href={`/dashboard/new/${t}`} className="flex items-start gap-2 text-slate-600 hover:text-brand">
                <TypeIcon type={t} className="mt-0.5 size-4 shrink-0" />
                <span>
                  <span className="block font-medium text-slate-800">{TYPES[t].label}</span>
                  <span className="text-xs">{TYPES[t].hint}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

export function FaqList({ items }: { items: [string, string][] }) {
  return (
    <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
      {items.map(([q, a], i) => (
        <details key={q} open={i === 0} className="group p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
            {q}
            <span className="ml-4 text-xl text-brand transition group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 text-sm text-slate-600">{a}</p>
        </details>
      ))}
    </div>
  );
}

export function AuthCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-1 items-center justify-center bg-gradient-to-br from-white to-brand-50 px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">{title}</h1>
        {children}
      </div>
    </section>
  );
}

export const inputCls = "mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
export const btnCls = "rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600";
