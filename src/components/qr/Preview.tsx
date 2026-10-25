"use client";

import type { Design } from "@/lib/design";
import { useQr } from "./useQr";

// Section heading: small uppercase label plus title, no step numbers.
export function SectionHead({ label, title, muted }: { label: string; title: string; muted?: boolean }) {
  return (
    <div className={muted ? "opacity-50" : ""}>
      <p className="eyebrow">{label}</p>
      <h2 className="mt-1 text-xl font-semibold">{title}</h2>
    </div>
  );
}

export default function Preview({ data, design, name, children }: { data: string; design: Design; name?: string; children?: React.ReactNode }) {
  const { png, download } = useQr(data, design);
  return (
    <aside className="flex flex-col bg-ink p-6 text-paper lg:sticky lg:top-20 lg:self-start">
      <p className="eyebrow">Output</p>
      <div className="mt-4 grid aspect-square place-items-center rounded-md bg-paper p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {png ? <img src={png} alt="Your QR code" className="max-h-full max-w-full" /> : <EmptyQr className="size-28 text-ink/15" />}
      </div>
      <p className="mt-3 text-xs text-paper/50">{png ? "Live preview. Scan it with your phone to test." : "Fill in the content to render a code."}</p>
      <div className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-md border border-paper/20">
        {(["png", "jpg", "svg"] as const).map((ext) => (
          <button
            key={ext}
            type="button"
            disabled={!png}
            onClick={() => download(ext, name)}
            title={ext === "svg" ? "SVG export does not include the frame" : undefined}
            className="bg-ink-800 py-2.5 text-sm font-semibold uppercase hover:bg-ember hover:text-ink disabled:text-paper/30 disabled:hover:bg-ink-800"
          >
            {ext}
          </button>
        ))}
      </div>
      {children}
    </aside>
  );
}

export function EmptyQr({ className = "size-24 text-ink/20" }: { className?: string }) {
  return (
    <svg viewBox="0 0 21 21" className={className} fill="currentColor" aria-label="Empty QR code">
      {[0, 14].map((x) =>
        [0, 14].map((y) => (x === 14 && y === 14 ? null : <path key={`${x}${y}`} d={`M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5zM${x + 2} ${y + 2}h3v3h-3z`} fillRule="evenodd" />)),
      )}
      <path d="M9 1h2v2H9zM9 5h3v2H9zM1 9h2v2H1zM5 9h4v2H5zM11 9h3v3h-3zM16 9h4v2h-4zM9 13h2v4H9zM14 14h3v2h-3zM18 17h2v3h-2zM13 18h3v2h-3z" />
    </svg>
  );
}
