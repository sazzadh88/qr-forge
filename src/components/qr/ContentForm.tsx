"use client";

import { useState } from "react";
import { TYPES, type Field, type QrType } from "@/lib/payload";

type Value = Record<string, unknown>;
const cls = "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

async function upload(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch("/api/upload", { method: "POST", body: fd });
  if (!r.ok) throw new Error(await r.text());
  return (await r.json()).url;
}

export default function ContentForm({ type, value, onChange }: { type: QrType; value: Value; onChange: (v: Value) => void }) {
  const fields = TYPES[type].fields as Field[];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) => (
        <FieldInput key={f.k} f={f} wide={fields.length === 1} value={value[f.k]} onChange={(v) => onChange({ ...value, [f.k]: v })} />
      ))}
    </div>
  );
}

function FieldInput({ f, value, onChange, wide }: { f: Field; value: unknown; onChange: (v: unknown) => void; wide?: boolean }) {
  const str = typeof value === "string" ? value : "";
  const full = wide || ["textarea", "file", "files", "repeat"].includes(f.kind ?? "");
  const label = (
    <>
      {f.label}
      {f.required && <span className="text-red-500"> *</span>}
    </>
  );
  const box = (inner: React.ReactNode) => (
    <div className={`text-sm font-medium text-slate-800 ${full ? "sm:col-span-2" : ""}`}>
      {inner}
    </div>
  );

  if (f.kind === "file" || f.kind === "files") return box(<><span>{label}</span><Uploader f={f} value={value} onChange={onChange} /></>);
  if (f.kind === "repeat") return box(<><span>{label}</span><Repeat f={f} value={value} onChange={onChange} /></>);
  return box(
    <label className="block">
      {label}
      <div className="mt-1.5">
        {f.kind === "select" ? (
          <select value={str || f.options![0]} onChange={(e) => onChange(e.target.value)} className={cls}>
            {f.options!.map((o) => (
              <option key={o} value={o}>
                {o === "nopass" ? "None" : o}
              </option>
            ))}
          </select>
        ) : f.kind === "textarea" ? (
          <textarea rows={4} value={str} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} className={cls} />
        ) : (
          <input type={f.kind === "date" ? "date" : "text"} value={str} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} className={cls} />
        )}
      </div>
    </label>,
  );
}

function Uploader({ f, value, onChange }: { f: Field; value: unknown; onChange: (v: unknown) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const multi = f.kind === "files";
  const list = multi ? (Array.isArray(value) ? (value as string[]) : []) : typeof value === "string" && value ? [value] : [];
  const isImg = f.accept?.startsWith("image");

  return (
    <div className="mt-1.5 space-y-2">
      {list.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {list.map((u) => (
            <div key={u} className="relative rounded-lg border border-slate-200 p-1">
              {isImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={u} alt="" className="size-16 rounded object-cover" />
              ) : (
                <a href={u} target="_blank" className="block px-3 py-2 text-xs text-brand underline">
                  View file
                </a>
              )}
              <button
                type="button"
                aria-label="Remove file"
                onClick={() => onChange(multi ? list.filter((x) => x !== u) : "")}
                className="absolute -top-2 -right-2 grid size-5 place-items-center rounded-full bg-slate-800 text-xs text-white"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <label className="inline-block cursor-pointer rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm font-normal text-slate-600 hover:border-brand">
        {busy ? "Uploading…" : multi ? "Add files" : list.length ? "Replace file" : "Upload file"}
        <input
          type="file"
          accept={f.accept}
          multiple={multi}
          disabled={busy}
          className="sr-only"
          onChange={async (e) => {
            const files = [...(e.target.files ?? [])];
            e.target.value = "";
            if (!files.length) return;
            setBusy(true);
            setErr("");
            try {
              const urls = await Promise.all(files.map(upload));
              onChange(multi ? [...list, ...urls] : urls[0]);
            } catch (x) {
              setErr((x as Error).message || "Upload failed");
            } finally {
              setBusy(false);
            }
          }}
        />
      </label>
      {err && <p className="text-sm text-red-600">{err}</p>}
    </div>
  );
}

function Repeat({ f, value, onChange }: { f: Field; value: unknown; onChange: (v: unknown) => void }) {
  const rows = Array.isArray(value) ? (value as Record<string, string>[]) : [];
  const set = (i: number, k: string, v: string) => onChange(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  return (
    <div className="mt-1.5 space-y-2">
      {rows.map((r, i) => (
        <div key={i} className="flex items-start gap-2 rounded-lg bg-slate-50 p-2">
          <div className={`grid flex-1 gap-2 ${f.fields!.length > 2 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
            {f.fields!.map((sf) => (
              <input key={sf.k} aria-label={sf.label} placeholder={sf.placeholder ?? sf.label} value={r[sf.k] ?? ""} onChange={(e) => set(i, sf.k, e.target.value)} className={cls} />
            ))}
          </div>
          <button type="button" aria-label="Remove row" onClick={() => onChange(rows.filter((_, j) => j !== i))} className="px-2 py-2.5 text-slate-400 hover:text-red-600">
            ✕
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...rows, {}])} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:border-brand hover:text-brand">
        + Add
      </button>
    </div>
  );
}
