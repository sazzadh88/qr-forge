"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { DEFAULT_DESIGN, type Design } from "@/lib/design";
import { deleteTemplate, saveTemplate } from "@/lib/actions";
import DesignPanel from "@/components/qr/DesignPanel";
import { EmptyQr } from "@/components/qr/Preview";
import { useQr } from "@/components/qr/useQr";
import { ConfirmButton } from "@/components/dash";

type Template = { id: number; name: string; design: Design };
type Draft = { id?: number; name: string; design: Design };
const SAMPLE = "https://qrforge.example/template-preview";

function QrImage({ design, className }: { design: Design; className: string }) {
  const { png } = useQr(SAMPLE, design);
  // eslint-disable-next-line @next/next/no-img-element
  return png ? <img src={png} alt="" className={className} /> : <EmptyQr className={className} />;
}

export default function TemplatesView({ templates }: { templates: Template[] }) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pending, start] = useTransition();
  const open = (d: Draft) => {
    setDraft(d);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const save = () =>
    draft &&
    start(async () => {
      await saveTemplate(draft.name, draft.design, draft.id);
      setDraft(null);
    });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Templates</h1>
          <p className="text-sm text-slate-500">Save a look once and reuse it on new QR codes and bulk batches.</p>
        </div>
        {!draft && (
          <button onClick={() => open({ name: "", design: DEFAULT_DESIGN })} className="rounded-md bg-ink px-5 py-2 text-sm font-semibold text-paper hover:bg-ember hover:text-ink">
            + New template
          </button>
        )}
      </div>

      {draft && (
        <section className="mt-6 overflow-hidden rounded-lg border border-brand/40 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold">{draft.id ? "Edit template" : "New template"}</h2>
            <button onClick={() => setDraft(null)} aria-label="Close editor" className="text-xl leading-none text-slate-400 hover:text-slate-700">
              ×
            </button>
          </div>
          <div className="grid gap-8 p-6 lg:grid-cols-[1fr_260px]">
            <div className="min-w-0">
              <label className="block max-w-sm text-sm font-medium">
                Template name
                <input
                  autoFocus
                  value={draft.name}
                  maxLength={60}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="e.g. Brand blue with frame"
                  className="mt-1.5 w-full rounded-lg border border-ink/20 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </label>
              <div className="mt-6">
                <DesignPanel design={draft.design} onChange={(design) => setDraft({ ...draft, design })} />
              </div>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-slate-50 p-5">
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Preview</p>
              <div className="mt-4 grid aspect-square w-48 place-items-center rounded-xl bg-white p-3 shadow-md">
                <QrImage design={draft.design} className="max-h-full max-w-full" />
              </div>
              <button
                onClick={save}
                disabled={!draft.name.trim() || pending}
                className="mt-6 w-full rounded-full bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
              >
                {pending ? "Saving…" : draft.id ? "Save changes" : "Save template"}
              </button>
              <button onClick={() => setDraft(null)} className="mt-2 text-sm text-slate-500 hover:text-slate-800">
                Cancel
              </button>
            </div>
          </div>
        </section>
      )}

      {templates.length === 0 ? (
        !draft && (
          <div className="mt-8 flex flex-col items-center rounded-lg border border-dashed border-ink/20 bg-white px-6 py-16 text-center">
            <span className="grid size-14 place-items-center rounded-lg bg-brand-50 text-brand">
              <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4 4h16v6H4zM4 14h7v6H4zM15 14h5v6h-5z" />
              </svg>
            </span>
            <h2 className="mt-4 text-lg font-semibold">No templates yet</h2>
            <p className="mt-1 max-w-sm text-sm text-slate-500">Create a template with your colors, logo and frame, then apply it in one click whenever you make a QR code.</p>
            <button onClick={() => open({ name: "", design: DEFAULT_DESIGN })} className="mt-6 rounded-md bg-ink px-5 py-2 text-sm font-semibold text-paper hover:bg-ember hover:text-ink">
              Create your first template
            </button>
          </div>
        )
      ) : (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {templates.map((t) => (
            <li key={t.id} className="group flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:border-brand/50 hover:shadow-md">
              <div className="grid aspect-[4/3] place-items-center bg-slate-50 p-6">
                <QrImage design={t.design} className="max-h-full max-w-full drop-shadow-sm" />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="truncate font-semibold" title={t.name}>
                  {t.name}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
                  <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5">
                    <span className="size-3 rounded-full border border-ink/20" style={{ background: t.design.color }} />
                    <span className="size-3 rounded-full border border-ink/20" style={{ background: t.design.bg }} />
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 capitalize">{t.design.dots.replace("-", " ")}</span>
                  {t.design.frame !== "none" && <span className="rounded-full bg-slate-100 px-2 py-0.5 capitalize">{t.design.frame} frame</span>}
                  {t.design.logo && <span className="rounded-full bg-slate-100 px-2 py-0.5">Logo</span>}
                </div>
                <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                  <Link href={`/dashboard/new?template=${t.id}`} className="rounded-full bg-brand px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-white hover:bg-brand-600">
                    Use template
                  </Link>
                  <button onClick={() => open({ id: t.id, name: t.name, design: t.design })} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium hover:border-brand hover:text-brand">
                    Edit
                  </button>
                  <form action={deleteTemplate} className="ml-auto">
                    <input type="hidden" name="id" value={t.id} />
                    <ConfirmButton message={`Delete template “${t.name}”?`} className="text-xs text-slate-400 hover:text-red-600">
                      Delete
                    </ConfirmButton>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
