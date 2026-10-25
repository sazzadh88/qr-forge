import Link from "next/link";
import Generator from "@/components/Generator";
import { TypeIcon } from "@/components/icons";
import { FaqList } from "@/components/site";
import { FAQ } from "@/lib/content";
import { isStatic, TYPE_KEYS, TYPES } from "@/lib/payload";

const PLATFORM: [string, string][] = [
  ["Repoint after printing", "Dynamic codes resolve through a short link you control. Change the destination, pause it or protect it with a password at any time."],
  ["Content, hosted", "PDFs, galleries, menus, coupons, contact cards and more render on a mobile page we serve for you. Upload once, share everywhere."],
  ["Scans, counted", "Every scan logs the time, device, system and browser. See totals, unique visitors and trends per code or across your whole account."],
  ["Your look, saved", "Patterns, corners, colours, logo and a call-to-action frame. Keep a design as a template and reuse it on the next hundred codes."],
  ["Work in batches", "Paste or upload a list of links and get a folder full of ready-to-download codes, all in your template."],
  ["Automate it", "A small REST API lets your own software create codes and read scan counts with an API key from your settings."],
];

export default function Home() {
  const dynamic = TYPE_KEYS.filter((t) => !isStatic(t));
  const stat = TYPE_KEYS.filter(isStatic);
  return (
    <>
      {/* Hero: dark band with the claim; the workbench overlaps into the paper section below. */}
      <section className="grid-bg bg-ink px-4 pt-16 pb-40 text-paper sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="eyebrow">Free QR code workbench</p>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-[1.05] sm:text-6xl">
              Forge a QR code that still works <span className="text-ember">next year.</span>
            </h1>
          </div>
          <div className="text-paper/70">
            <p className="max-w-md text-lg leading-relaxed">Style it, point it anywhere, host what&apos;s behind it and watch the scans. Static codes need no account; everything else is free too.</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
              <a href="#workbench" className="rounded-md bg-ember px-5 py-2.5 text-ink hover:bg-ember-600 hover:text-paper">
                Open the workbench
              </a>
              <Link href="/register" className="rounded-md border border-paper/30 px-5 py-2.5 text-paper hover:border-paper">
                Create account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="-mt-28 px-4 sm:px-6">
        <Generator />
      </section>

      {/* Three-up proof row. */}
      <section className="px-4 py-20 sm:px-6">
        <dl className="mx-auto grid max-w-7xl gap-px overflow-hidden rounded-lg border border-paper-200 bg-paper-200 sm:grid-cols-3">
          {[
            ["19", "code types", "7 static, 12 with a hosted page"],
            ["0", "limits", "No code caps, no watermarks, no plan"],
            ["3", "export formats", "PNG and JPG for screens, SVG for print"],
          ].map(([n, l, d]) => (
            <div key={l} className="bg-paper p-8">
              <dt className="font-display text-5xl font-semibold">
                {n} <span className="text-xl text-ink-600">{l}</span>
              </dt>
              <dd className="mt-2 text-sm text-ink-600">{d}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Types: two columns, dynamic vs static, as a list rather than a card grid. */}
      <section id="types" className="scroll-mt-16 border-y border-paper-200 bg-white px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1fr_1fr]">
          <div>
            <p className="eyebrow">What a code can do</p>
            <h2 className="mt-3 text-3xl font-semibold">Pick the behaviour, not just the shape.</h2>
            <p className="mt-3 text-ink-600">Dynamic codes point to a short link and can change later. Static codes carry the data inside the pattern and work offline forever.</p>
          </div>
          {[
            ["Dynamic · editable, tracked", dynamic],
            ["Static · permanent, offline", stat],
          ].map(([title, keys]) => (
            <div key={title as string}>
              <p className="border-b border-ink pb-2 font-display font-semibold">{title as string}</p>
              <ul className="divide-y divide-paper-200">
                {(keys as typeof TYPE_KEYS).map((t) => (
                  <li key={t}>
                    <Link href={`/dashboard/new/${t}`} className="group flex items-center gap-3 py-3 text-sm">
                      <TypeIcon type={t} className="size-4 text-ember" />
                      <span className="font-medium">{TYPES[t].label}</span>
                      <span className="ml-auto text-ink-600 group-hover:text-ink">{TYPES[t].hint}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Platform: numbered editorial list. */}
      <section id="platform" className="scroll-mt-16 px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow">After you print</p>
          <h2 className="mt-3 max-w-xl text-3xl font-semibold">The code is the easy part. QRForge handles what happens when it&apos;s scanned.</h2>
          <ol className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {PLATFORM.map(([t, d], i) => (
              <li key={t} className="border-t border-ink pt-4">
                <span className="font-display text-sm text-ember">0{i + 1}</span>
                <h3 className="mt-2 text-lg font-semibold">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="faq" className="scroll-mt-16 bg-white px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.6fr_1fr]">
          <div>
            <p className="eyebrow">Questions</p>
            <h2 className="mt-3 text-3xl font-semibold">Before you print 10,000 of them.</h2>
            <Link href="/faq" className="mt-4 inline-block text-sm font-semibold text-ember hover:underline">
              Full help center →
            </Link>
          </div>
          <FaqList items={FAQ[0].items} />
        </div>
      </section>

      <section className="bg-ink px-4 py-20 text-paper sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6">
          <h2 className="text-3xl font-semibold">Start with the workbench. Keep everything.</h2>
          <Link href="/register" className="rounded-md bg-ember px-6 py-3 font-semibold text-ink hover:bg-ember-600 hover:text-paper">
            Create a free account
          </Link>
        </div>
      </section>
    </>
  );
}
