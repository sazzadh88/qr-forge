"use client";

import type { Design } from "@/lib/design";
import { useQr } from "./useQr";
import { EmptyQr } from "./Preview";

// Small rendered QR with a download menu, used in lists.
export default function QrThumb({ data, design, name, downloads = true }: { data: string; design: Design; name?: string; downloads?: boolean }) {
  const { png, download } = useQr(data, design);
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-20 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white p-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {png ? <img src={png} alt="" className="max-h-full max-w-full" /> : <EmptyQr className="size-12" />}
      </div>
      {downloads && png && (
        <details className="relative">
          <summary className="cursor-pointer list-none rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600">Download</summary>
          <div className="absolute z-10 mt-1 w-24 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
            {(["png", "jpg", "svg"] as const).map((ext) => (
              <button key={ext} type="button" onClick={() => download(ext, name)} className="block w-full px-3 py-1.5 text-left text-sm uppercase hover:bg-slate-50">
                {ext}
              </button>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
