"use client";

import { useState } from "react";
import { CORNERS, DOTS, FRAMES, LEVELS, type Design, type Frame } from "@/lib/design";

const TABS = ["Frame", "Pattern", "Logo", "Error correction"] as const;
const MAX_LOGO = 500_000;

export default function DesignPanel({ design: d, onChange }: { design: Design; onChange: (d: Design) => void }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Frame");
  const [err, setErr] = useState("");
  const set = (p: Partial<Design>) => onChange({ ...d, ...p });

  return (
    <>
      <div className="inline-flex flex-wrap gap-px overflow-hidden rounded-md border border-ink/15 bg-ink/15">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium ${t === tab ? "bg-ink text-paper" : "bg-white text-ink-600 hover:bg-paper"}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tab === "Frame" && (
          <>
            <div className="flex flex-wrap gap-3">
              {FRAMES.map((f) => (
                <Choice key={f} on={d.frame === f} onClick={() => set({ frame: f })}>
                  <FrameThumb frame={f} />
                </Choice>
              ))}
            </div>
            {d.frame !== "none" && (
              <label className="mt-4 block max-w-xs text-sm font-medium">
                Frame text
                <input value={d.label} maxLength={18} onChange={(e) => set({ label: e.target.value })} className="mt-1.5 w-full rounded-lg border border-ink/20 px-3 py-2 text-sm" />
              </label>
            )}
          </>
        )}
        {tab === "Pattern" && (
          <div className="space-y-4">
            <Row label="Dots">
              {DOTS.map((s) => (
                <Choice key={s} on={d.dots === s} onClick={() => set({ dots: s })} text={s.replace("-", " ")} />
              ))}
            </Row>
            <Row label="Corners">
              {CORNERS.map((s) => (
                <Choice key={s} on={d.corners === s} onClick={() => set({ corners: s })} text={s.replace("-", " ")} />
              ))}
            </Row>
            <Row label="Colors">
              <ColorInput label="Foreground" value={d.color} onChange={(color) => set({ color })} />
              <ColorInput label="Background" value={d.bg} onChange={(bg) => set({ bg })} />
            </Row>
          </div>
        )}
        {tab === "Logo" && (
          <div className="flex flex-wrap items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {d.logo && <img src={d.logo} alt="Uploaded logo" className="size-16 rounded-lg border object-contain" />}
            <label className="cursor-pointer rounded-lg border border-dashed border-ink/20 px-4 py-3 text-sm text-slate-600 hover:border-brand">
              {d.logo ? "Replace logo" : "Upload logo (PNG, JPG, WebP · max 500 KB)"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > MAX_LOGO) return setErr("Logo must be under 500 KB.");
                  setErr("");
                  const r = new FileReader();
                  // logo covers modules; max redundancy keeps it scannable
                  r.onload = () => set({ logo: r.result as string, level: "H" });
                  r.readAsDataURL(file);
                }}
              />
            </label>
            {d.logo && (
              <button type="button" onClick={() => set({ logo: undefined })} className="text-sm text-red-600 hover:underline">
                Remove
              </button>
            )}
            {err && <p className="w-full text-sm text-red-600">{err}</p>}
          </div>
        )}
        {tab === "Error correction" && (
          <div className="flex flex-wrap gap-3">
            {LEVELS.map(([v, l]) => (
              <Choice key={v} on={d.level === v} onClick={() => set({ level: v })} text={l} />
            ))}
            <p className="w-full text-xs text-slate-500">Higher levels survive more damage and logos, but make the code denser.</p>
          </div>
        )}
      </div>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 eyebrow !text-ink-600">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Choice({ on, onClick, text, children }: { on: boolean; onClick: () => void; text?: string; children?: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`rounded-md border px-3 py-2 text-sm capitalize ${on ? "border-ink bg-ink text-paper" : "border-ink/15 text-ink-600 hover:border-ink/40"}`}
    >
      {children ?? text}
    </button>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="size-7 cursor-pointer rounded border-0 bg-transparent" />
      {label}
    </label>
  );
}

function FrameThumb({ frame }: { frame: Frame }) {
  if (frame === "none")
    return (
      <svg viewBox="0 0 48 56" className="h-14 w-12 text-ember" fill="none" stroke="currentColor" strokeWidth="3" aria-label="No frame">
        <circle cx="24" cy="28" r="14" />
        <path d="M14 18l20 20" />
      </svg>
    );
  return (
    <svg viewBox="0 0 48 56" className="h-14 w-12 text-current" aria-label={`${frame} frame`}>
      {frame === "badge" ? (
        <>
          <rect x="4" y="2" width="40" height="40" rx="6" fill="none" stroke="currentColor" strokeWidth="3" />
          <rect x="10" y="46" width="28" height="8" rx="4" fill="currentColor" />
          <rect x="12" y="10" width="24" height="24" fill="currentColor" opacity=".35" />
        </>
      ) : (
        <>
          <rect x="2" y="2" width="44" height="52" rx="6" fill="currentColor" />
          <rect x="7" y={frame === "top" ? 15 : 7} width="34" height="34" rx="3" fill="#fff" />
          <rect x="12" y={frame === "top" ? 20 : 12} width="24" height="24" fill="currentColor" opacity=".35" />
        </>
      )}
    </svg>
  );
}
