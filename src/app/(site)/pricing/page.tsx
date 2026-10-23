import Link from "next/link";
import { PLANS } from "@/lib/content";

export const metadata = { title: "Plans and prices · QRForge" };

export default function Pricing() {
  return (
    <section className="bg-gradient-to-br from-white to-brand-50 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-5xl text-center">
        <h1 className="text-4xl font-bold">Plans and prices</h1>
        <p className="mt-2 text-slate-600">Start free. Upgrade when your codes need more.</p>
        <p className="mx-auto mt-4 max-w-xl rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">
          Billing isn&apos;t connected in this build, so every account gets all Business features for free.
        </p>
      </div>
      <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3">
        {PLANS.map((p) => (
          <div key={p.id} className={`flex flex-col rounded-2xl border bg-white p-8 ${p.popular ? "border-brand shadow-xl" : "border-slate-200"}`}>
            {p.popular && <span className="mb-3 self-start rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand">Most popular</span>}
            <h2 className="text-xl font-bold">{p.name}</h2>
            <p className="mt-4">
              <span className="text-4xl font-bold">${p.monthly}</span> <span className="text-slate-500">{p.monthly ? "per month" : "forever"}</span>
            </p>
            <ul className="mt-6 flex-1 space-y-2 text-sm text-slate-700">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-brand">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/register" className={`mt-8 rounded-full py-2.5 text-center text-sm font-semibold ${p.popular ? "bg-brand text-white hover:bg-brand-600" : "border border-slate-300 hover:border-brand hover:text-brand"}`}>
              Get started
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
