import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { CURRENT_PLAN, PLANS } from "@/lib/content";
import { isStatic, TYPE_KEYS } from "@/lib/payload";

export const metadata = { title: "Plans and payments · QRForge" };

const card = "rounded-xl border border-slate-200 bg-white p-6";
const STATIC = TYPE_KEYS.filter(isStatic);

export default async function PlansAndPayments({ searchParams }: PageProps<"/dashboard/plans-and-payments">) {
  const user = await requireUser();
  const yearly = (await searchParams).cycle === "yearly";
  const current = PLANS.find((p) => p.id === CURRENT_PLAN)!;
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();

  const count = (sql: string, ...args: (string | number)[]) => (db.prepare(sql).get(user.id, ...args) as { n: number }).n;
  const marks = STATIC.map(() => "?").join(",");
  const usage: [string, number][] = [
    ["Dynamic QR codes", count(`SELECT COUNT(*) n FROM qrcodes WHERE user_id=? AND type NOT IN (${marks})`, ...STATIC)],
    ["Static QR codes", count(`SELECT COUNT(*) n FROM qrcodes WHERE user_id=? AND type IN (${marks})`, ...STATIC)],
    ["Scans this month", count("SELECT COUNT(*) n FROM scans s JOIN qrcodes q ON q.id=s.qr_id WHERE q.user_id=? AND s.at>=?", monthStart)],
    ["Templates", count("SELECT COUNT(*) n FROM templates WHERE user_id=?")],
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Plans and payments</h1>
        <p className="text-sm text-slate-500">Manage your subscription, payment method and invoices.</p>
      </div>

      <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Payments aren&apos;t connected in this build. Your account has every {current.name} feature at no cost, and nothing will be charged.
      </p>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <section className={card}>
          <p className="text-sm text-slate-500">Current plan</p>
          <div className="mt-1 flex items-center gap-2">
            <h2 className="text-2xl font-bold">{current.name}</h2>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">Active</span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            <span className="font-semibold">$0</span> during beta <span className="text-slate-400 line-through">${current.monthly}/month</span>
          </p>
          <dl className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Billing cycle</dt>
              <dd className="font-medium">—</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Next payment</dt>
              <dd className="font-medium">None scheduled</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Account email</dt>
              <dd className="truncate font-medium">{user.email}</dd>
            </div>
          </dl>
        </section>

        <section className={card}>
          <h2 className="font-semibold">Usage</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {usage.map(([label, n]) => (
              <div key={label} className="rounded-lg bg-slate-50 p-4">
                <p className="text-2xl font-bold">{n}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">Your plan has no limits on QR codes or scans.</p>
        </section>
      </div>

      <section className={card}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">Change plan</h2>
          <div className="flex rounded-full bg-slate-100 p-1 text-sm font-medium">
            <Link href="?cycle=monthly" className={`rounded-full px-4 py-1.5 ${!yearly ? "bg-white shadow-sm" : "text-slate-500"}`}>
              Monthly
            </Link>
            <Link href="?cycle=yearly" className={`rounded-full px-4 py-1.5 ${yearly ? "bg-white shadow-sm" : "text-slate-500"}`}>
              Yearly <span className="text-emerald-600">· 2 months free</span>
            </Link>
          </div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {PLANS.map((p) => {
            const isCurrent = p.id === CURRENT_PLAN;
            return (
              <div key={p.id} className={`flex flex-col rounded-xl border p-5 ${isCurrent ? "border-brand bg-brand-50/40" : "border-slate-200"}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">{p.name}</h3>
                  {isCurrent && <span className="rounded-full bg-brand px-2.5 py-0.5 text-xs font-semibold text-white">Current</span>}
                </div>
                <p className="mt-3">
                  <span className="text-3xl font-bold">${yearly ? p.yearly : p.monthly}</span>{" "}
                  <span className="text-sm text-slate-500">{p.monthly ? (yearly ? "per year" : "per month") : "forever"}</span>
                </p>
                <ul className="mt-4 flex-1 space-y-1.5 text-sm text-slate-700">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="text-brand">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button
                  disabled
                  title="Payments aren't connected yet"
                  className={`mt-5 rounded-full py-2 text-sm font-semibold ${isCurrent ? "bg-transparent text-brand" : "border border-slate-300 text-slate-400"}`}
                >
                  {isCurrent ? "Your plan" : "Switch plan"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className={card}>
          <h2 className="font-semibold">Payment method</h2>
          <div className="mt-4 flex items-center gap-4 rounded-lg border border-dashed border-slate-300 p-4">
            <svg viewBox="0 0 24 24" className="size-8 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20M6 15h4" />
            </svg>
            <div>
              <p className="text-sm font-medium">No payment method on file</p>
              <p className="text-xs text-slate-500">You can add a card once payments are enabled.</p>
            </div>
          </div>
        </section>

        <section className={card}>
          <h2 className="font-semibold">Billing history</h2>
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-xs text-slate-500 uppercase">
              <tr>
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Description</th>
                <th className="pb-2 font-medium">Amount</th>
                <th className="pb-2 font-medium">Invoice</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="border-t border-slate-100 py-8 text-center text-slate-500">
                  No invoices yet.
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
