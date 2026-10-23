"use client";

import { useState, useTransition } from "react";
import { DEFAULT_DESIGN } from "@/lib/design";
import { saveTemplate } from "@/lib/actions";
import DesignPanel from "@/components/qr/DesignPanel";
import QrThumb from "@/components/qr/QrThumb";

export default function TemplateMaker() {
  const [design, setDesign] = useState(DEFAULT_DESIGN);
  const [name, setName] = useState("");
  const [pending, start] = useTransition();
  return (
    <details className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
      <summary className="cursor-pointer font-semibold text-brand">+ New template</summary>
      <div className="mt-4 grid gap-6 md:grid-cols-[1fr_auto]">
        <DesignPanel design={design} onChange={setDesign} />
        <div className="space-y-3">
          <QrThumb data="https://example.com" design={design} downloads={false} />
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Template name" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <button
            disabled={!name.trim() || pending}
            onClick={() =>
              start(async () => {
                await saveTemplate(name, design);
                setName("");
                setDesign(DEFAULT_DESIGN);
              })
            }
            className="w-full rounded-full bg-brand py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Save template
          </button>
        </div>
      </div>
    </details>
  );
}
