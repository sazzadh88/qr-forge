import Link from "next/link";
import { getUser } from "@/lib/auth";
import { isStatic, TYPE_KEYS, TYPES } from "@/lib/payload";
import { TypeIcon, Wordmark } from "./icons";

export async function SiteHeader() {
  const user = await getUser();
  return (
    <header className="sticky top-0 z-30 bg-ink text-paper">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-8 px-4 sm:px-6">
        <Link href="/">
          <Wordmark />
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-paper/70 md:flex">
          <Link href="/#workbench" className="hover:text-paper">Generator</Link>
          <Link href="/#types" className="hover:text-paper">QR types</Link>
          <Link href="/#platform" className="hover:text-paper">Platform</Link>
          <Link href="/faq" className="hover:text-paper">Help</Link>
          <Link href="/api-docs" className="hover:text-paper">API</Link>
        </nav>
        <div className="ml-auto flex items-center gap-3 text-sm font-semibold">
          {user ? (
            <Link href="/dashboard" className="rounded-md bg-ember px-4 py-2 text-ink hover:bg-ember-600 hover:text-paper">
              Open dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="px-2 text-paper/80 hover:text-paper">
                Log in
              </Link>
              <Link href="/register" className="rounded-md bg-ember px-4 py-2 text-ink hover:bg-ember-600 hover:text-paper">
                Start free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const dynamic = TYPE_KEYS.filter((t) => !isStatic(t));
  const stat = TYPE_KEYS.filter(isStatic);
  const col = (title: string, keys: typeof TYPE_KEYS) => (
    <div>
      <p className="eyebrow">{title}</p>
      <ul className="mt-3 space-y-2 text-sm">
        {keys.map((t) => (
          <li key={t}>
            <Link href={`/dashboard/new/${t}`} className="flex items-center gap-2 text-paper/70 hover:text-paper">
              <TypeIcon type={t} className="size-4" /> {TYPES[t].label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <footer className="bg-ink px-4 py-14 text-paper sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_1fr_1fr_0.8fr]">
        <div>
          <Wordmark />
          <p className="mt-4 max-w-xs text-sm text-paper/60">Branded QR codes with hosted content and scan analytics. Every feature free, no card required.</p>
        </div>
        {col("Dynamic codes", dynamic)}
        {col("Static codes", stat)}
        <div>
          <p className="eyebrow">Resources</p>
          <ul className="mt-3 space-y-2 text-sm text-paper/70">
            <li><Link href="/faq" className="hover:text-paper">Help center</Link></li>
            <li><Link href="/api-docs" className="hover:text-paper">REST API</Link></li>
            <li><Link href="/register" className="hover:text-paper">Create account</Link></li>
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-12 max-w-7xl border-t border-paper/10 pt-6 text-xs text-paper/40">QRForge. Codes you generate are yours to use anywhere.</p>
    </footer>
  );
}

export function FaqList({ items }: { items: [string, string][] }) {
  return (
    <div className="divide-y divide-paper-200 border-y border-paper-200">
      {items.map(([q, a]) => (
        <details key={q} className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display font-semibold">
            {q}
            <span className="grid size-6 shrink-0 place-items-center rounded-full border border-ink/20 text-sm transition group-open:rotate-45 group-open:bg-ink group-open:text-paper">+</span>
          </summary>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-600">{a}</p>
        </details>
      ))}
    </div>
  );
}

export function AuthCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid flex-1 lg:grid-cols-2">
      <div className="grid-bg hidden flex-col justify-between bg-ink p-12 text-paper lg:flex">
        <Wordmark />
        <div>
          <p className="eyebrow">Why QRForge</p>
          <p className="mt-3 max-w-sm font-display text-3xl font-semibold leading-tight">Change where a printed code points. Without reprinting.</p>
          <ul className="mt-6 space-y-2 text-sm text-paper/70">
            <li>· 19 code types, 12 with hosted pages</li>
            <li>· Scan analytics by day, device and system</li>
            <li>· Templates, folders, bulk import and an API</li>
          </ul>
        </div>
        <p className="text-xs text-paper/40">Everything included. No plan to pick.</p>
      </div>
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-semibold">{title}</h1>
          {children}
        </div>
      </div>
    </section>
  );
}

export const inputCls = "mt-1.5 w-full rounded-md border border-ink/20 bg-white px-3 py-2.5 text-sm outline-none focus:border-ember focus:ring-2 focus:ring-ember/20";
export const btnCls = "rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:bg-ember hover:text-ink";
