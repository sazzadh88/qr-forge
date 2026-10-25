"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { encode, isStatic, TYPES, type QrType } from "@/lib/payload";
import { DEFAULT_DESIGN, type Design } from "@/lib/design";
import { saveQr, saveTemplate } from "@/lib/actions";
import ContentForm from "./qr/ContentForm";
import DesignPanel from "./qr/DesignPanel";
import Preview, { SectionHead } from "./qr/Preview";
import { TypeIcon } from "./icons";

type Initial = { id: number; name: string; slug: string; folderId: number | null; content: Record<string, unknown>; design: Design; hasPassword: boolean };
const input = "w-full rounded-lg border border-ink/20 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

export default function Editor({
  type,
  origin,
  initial,
  folders,
  templates,
  startDesign,
}: {
  type: QrType;
  origin: string;
  initial?: Initial;
  folders: { id: number; name: string }[];
  templates: { id: number; name: string; design: Design }[];
  startDesign?: Design;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [folderId, setFolderId] = useState(initial?.folderId ?? null);
  const [content, setContent] = useState<Record<string, unknown>>(initial?.content ?? {});
  const [design, setDesign] = useState<Design>(initial?.design ?? startDesign ?? DEFAULT_DESIGN);
  const [password, setPassword] = useState("");
  const [removePassword, setRemovePassword] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  const dynamic = !isStatic(type);
  const hosted = dynamic && type !== "url";
  // New dynamic codes get their slug on save; preview with a same-length placeholder so density matches.
  const data = dynamic ? `${origin}/q/${initial?.slug ?? "preview0"}` : encode(type, content);

  const save = () =>
    start(async () => {
      setError("");
      const r = await saveQr({ id: initial?.id, type, name, folderId, content, design, password, removePassword });
      if (r?.error) setError(r.error);
    });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center gap-3">
        <Link href={initial ? "/dashboard" : "/dashboard/new"} className="text-sm text-slate-500 hover:text-brand">
          ← Back
        </Link>
        <span className="grid size-9 place-items-center rounded-lg bg-brand-50 text-brand">
          <TypeIcon type={type} />
        </span>
        <h1 className="text-2xl font-bold">
          {initial ? "Edit" : "New"} {TYPES[type].label} QR code
        </h1>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 space-y-4">
          <section className="rounded-lg border border-ink/10 bg-white p-5 sm:p-8">
            <SectionHead label="Content" title={TYPES[type].hint} />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium">
                QR code name <span className="text-red-500">*</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Spring flyer" className={`mt-1.5 ${input}`} />
              </label>
              <label className="block text-sm font-medium">
                Folder
                <select value={folderId ?? ""} onChange={(e) => setFolderId(e.target.value ? Number(e.target.value) : null)} className={`mt-1.5 ${input}`}>
                  <option value="">No folder</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <hr className="my-6 border-slate-100" />
            <ContentForm type={type} value={content} onChange={setContent} />
            {dynamic && (
              <div className="mt-6 grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                {hosted && (
                  <label className="flex items-center gap-3 text-sm font-medium">
                    <input
                      type="color"
                      value={typeof content.color === "string" ? content.color : "#1f5bff"}
                      onChange={(e) => setContent({ ...content, color: e.target.value })}
                      className="size-9 cursor-pointer rounded border-0 bg-transparent"
                    />
                    Page color
                  </label>
                )}
                <label className="block text-sm font-medium">
                  {initial?.hasPassword ? "Change password" : "Password protection (optional)"}
                  <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave empty for public access" className={`mt-1.5 ${input}`} />
                  {initial?.hasPassword && (
                    <span className="mt-2 flex items-center gap-2 font-normal">
                      <input type="checkbox" checked={removePassword} onChange={(e) => setRemovePassword(e.target.checked)} /> Remove password
                    </span>
                  )}
                </label>
              </div>
            )}
          </section>

          <section className="rounded-lg border border-ink/10 bg-white p-5 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SectionHead label="Style" title="Make it yours" />
              <div className="flex gap-2">
                {templates.length > 0 && (
                  <select
                    value=""
                    onChange={(e) => {
                      const t = templates.find((x) => x.id === Number(e.target.value));
                      if (t) setDesign({ ...DEFAULT_DESIGN, ...t.design });
                    }}
                    className="rounded-lg border border-ink/20 px-3 py-2 text-sm"
                  >
                    <option value="">Apply template…</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  onClick={async () => {
                    const n = prompt("Template name");
                    if (!n) return;
                    await saveTemplate(n, design);
                    setNote(`Saved template “${n}”.`);
                  }}
                  className="rounded-lg border border-ink/20 px-3 py-2 text-sm font-medium hover:border-brand hover:text-brand"
                >
                  Save as template
                </button>
              </div>
            </div>
            {note && <p className="mt-2 text-sm text-emerald-700">{note}</p>}
            <div className="mt-5">
              <DesignPanel design={design} onChange={setDesign} />
            </div>
          </section>
        </div>

        <Preview data={data} design={design} name={name || "qr-code"}>
          {error && <p className="mt-4 w-full rounded-md bg-red-100 px-3 py-2 text-sm text-red-800">{error}</p>}
          <button onClick={save} disabled={pending} className="mt-4 w-full rounded-md bg-ember py-3 text-sm font-semibold text-ink hover:bg-ember-600 hover:text-paper disabled:opacity-60">
            {pending ? "Saving…" : initial ? "Save changes" : "Create QR code"}
          </button>
          {dynamic && !initial && <p className="mt-2 text-center text-xs text-paper/50">The final short link is assigned when you save.</p>}
        </Preview>
      </div>
    </div>
  );
}
