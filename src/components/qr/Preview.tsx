"use client";

import type { Design } from "@/lib/design";
import { useQr } from "./useQr";

export function Step({ n, title, muted }: { n: number; title: string; muted?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${muted ? "opacity-60" : ""}`}>
      <span className="grid size-7 place-items-center rounded-md bg-slate-900 text-sm font-semibold text-white">{n}</span>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
    </div>
  );
}

export default function Preview({ data, design, name, children }: { data: string; design: Design; name?: string; children?: React.ReactNode }) {
  const { png, download } = useQr(data, design);
  return (
    <aside className="flex flex-col items-center rounded-xl bg-slate-100 p-6 lg:sticky lg:top-24 lg:self-start">
      <Step n={3} title="Download your QR" muted={!png} />
      <div className="mt-8 grid aspect-square w-52 place-items-center rounded-xl bg-white p-3 shadow-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {png ? <img src={png} alt="Your QR code" className="max-h-full max-w-full" /> : <EmptyQr />}
      </div>
      <div className="mt-6 grid w-full grid-cols-3 gap-2">
        {(["png", "jpg", "svg"] as const).map((ext) => (
          <button
            key={ext}
            type="button"
            disabled={!png}
            onClick={() => download(ext, name)}
            title={ext === "svg" ? "SVG export does not include the frame" : undefined}
            className="rounded-full border border-slate-300 bg-white py-2 text-sm font-semibold uppercase text-slate-700 hover:border-brand hover:text-brand disabled:bg-transparent disabled:text-slate-400 disabled:hover:border-slate-300"
          >
            {ext}
          </button>
        ))}
      </div>
      {children}
    </aside>
  );
}

export function EmptyQr({ className = "size-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 21 21" className={`${className} text-slate-300`} fill="currentColor" aria-label="Empty QR code">
      {[0, 14].map((x) =>
        [0, 14].map((y) => (x === 14 && y === 14 ? null : <path key={`${x}${y}`} d={`M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5zM${x + 2} ${y + 2}h3v3h-3z`} fillRule="evenodd" />)),
      )}
      <path d="M9 1h2v2H9zM9 5h3v2H9zM1 9h2v2H1zM5 9h4v2H5zM11 9h3v3h-3zM16 9h4v2h-4zM9 13h2v4H9zM14 14h3v2h-3zM18 17h2v3h-2zM13 18h3v2h-3z" />
    </svg>
  );
}
