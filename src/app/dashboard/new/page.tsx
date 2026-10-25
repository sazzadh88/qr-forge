import Link from "next/link";
import { TypeIcon } from "@/components/icons";
import { isStatic, TYPE_KEYS, TYPES } from "@/lib/payload";

export default async function NewQr({ searchParams }: PageProps<"/dashboard/new">) {
  const tpl = Number((await searchParams).template);
  const qs = tpl ? `?template=${tpl}` : "";
  const groups: [string, string, typeof TYPE_KEYS][] = [
    ["Dynamic", "Editable after printing, with scan tracking and hosted pages.", TYPE_KEYS.filter((t) => !isStatic(t))],
    ["Static", "Content is stored in the code itself. Works offline, never expires, no tracking.", TYPE_KEYS.filter(isStatic)],
  ];
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold">Choose a QR code type</h1>
      {tpl > 0 && <p className="mt-1 text-sm text-brand">Your template will be applied to the new code.</p>}
      {groups.map(([title, desc, types]) => (
        <section key={title} className="mt-8">
          <h2 className="font-semibold">{title}</h2>
          <p className="text-sm text-slate-500">{desc}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {types.map((t) => (
              <Link key={t} href={`/dashboard/new/${t}${qs}`} className="rounded-lg border border-ink/10 bg-white p-4 transition hover:border-brand hover:shadow-md">
                <span className="grid size-10 place-items-center rounded-lg bg-brand-50 text-brand">
                  <TypeIcon type={t} />
                </span>
                <p className="mt-3 font-semibold">{TYPES[t].label}</p>
                <p className="text-sm text-slate-500">{TYPES[t].hint}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
