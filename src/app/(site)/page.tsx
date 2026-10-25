import Link from "next/link";
import Generator from "@/components/Generator";
import { TypeIcon } from "@/components/icons";
import { FaqList } from "@/components/site";
import { FAQ } from "@/lib/content";
import { TYPE_KEYS, TYPES } from "@/lib/payload";

const STEPS = [
  ["Pick a type", "Choose what the code should open: a link, a PDF, a menu, Wi-Fi login and more."],
  ["Make it yours", "Add a frame with a call to action, change shapes and colors, drop in your logo."],
  ["Download & share", "Export PNG, JPG or SVG, then track every scan from your dashboard."],
];

const FEATURES = [
  ["Edit and organise", "Change content after printing, group codes into folders and search them.", "/dashboard"],
  ["Dynamic QR codes", "Short links you can repoint, pause or protect at any time.", "/dashboard/new/url"],
  ["Hosted pages", "PDFs, galleries, menus, coupons and business cards on mobile-ready pages.", "/dashboard/new"],
  ["Scan analytics", "Scans over time, unique visitors, devices, systems and browsers.", "/dashboard/analytics"],
  ["Several download formats", "PNG and JPG for screens, SVG for print.", "/#generator"],
  ["Design templates", "Save a look once and reuse it on every new code.", "/dashboard/templates"],
  ["Static QR codes", "Wi-Fi, vCard, email, SMS and text codes that never expire.", "/#generator"],
  ["Bulk creation", "Turn a CSV of links into hundreds of codes in one go.", "/dashboard/bulk"],
  ["Password protection", "Require a password before visitors see the content.", "/dashboard/new"],
  ["REST API", "Create codes and read scan counts from your own software.", "/api-docs"],
];

export default function Home() {
  return (
    <>
      <section className="bg-gradient-to-br from-white via-white to-brand-50 px-4 pt-12 pb-16 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            <span className="text-brand">QR Code Generator</span> with logo, frames & tracking
          </h1>
          <p className="mt-3 text-slate-600">Design an on-brand QR code in seconds, share it anywhere and watch the scans come in.</p>
        </div>
        <div className="mt-10">
          <Generator />
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-bold">How it works</h2>
        <ol className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3">
          {STEPS.map(([t, d], i) => (
            <li key={t} className="rounded-2xl border border-slate-200 p-6">
              <span className="grid size-10 place-items-center rounded-full bg-brand-50 font-bold text-brand">{i + 1}</span>
              <h3 className="mt-4 font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-slate-600">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="qr-types" className="scroll-mt-20 bg-slate-50 px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-bold">One generator, {TYPE_KEYS.length} QR types</h2>
        <div className="mx-auto mt-10 grid max-w-6xl grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
          {TYPE_KEYS.map((t) => (
            <Link key={t} href={`/dashboard/new/${t}`} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-brand hover:shadow-md">
              <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand">
                <TypeIcon type={t} className="size-6" />
              </span>
              <h3 className="mt-4 font-semibold">{TYPES[t].label}</h3>
              <p className="text-sm text-slate-600">{TYPES[t].hint}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="features" className="scroll-mt-20 px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-bold">An all-in-one QR platform</h2>
        <div className="mx-auto mt-10 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {FEATURES.map(([t, d, href]) => (
            <Link key={t} href={href} className="rounded-2xl bg-slate-50 p-5 transition hover:bg-brand-50">
              <h3 className="font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-slate-600">{d}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="faq" className="scroll-mt-20 bg-slate-50 px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-bold">Frequently asked questions</h2>
        <div className="mx-auto mt-10 max-w-3xl">
          <FaqList items={FAQ[0].items} />
          <p className="mt-6 text-center text-sm">
            <Link href="/faq" className="font-semibold text-brand hover:underline">
              See all questions →
            </Link>
          </p>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl rounded-3xl bg-brand px-6 py-14 text-center text-white">
          <h2 className="text-3xl font-bold">Ready to make yours?</h2>
          <p className="mt-2 text-white/80">Free account with every feature included.</p>
          <Link href="/register" className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-brand hover:bg-brand-50">
            Register now
          </Link>
        </div>
      </section>
    </>
  );
}
