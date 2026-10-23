"use client";

import { useState } from "react";
import Link from "next/link";
import { encode, isStatic, TYPE_KEYS, TYPES, type QrType } from "@/lib/payload";
import { DEFAULT_DESIGN } from "@/lib/design";
import ContentForm from "./qr/ContentForm";
import DesignPanel from "./qr/DesignPanel";
import Preview, { Step } from "./qr/Preview";
import { TypeIcon } from "./icons";

// Anonymous generator: static types (and plain URLs) are encoded directly; hosted types need an account.
export default function Generator() {
  const [type, setType] = useState<QrType>("url");
  const [content, setContent] = useState<Record<string, unknown>>({});
  const [design, setDesign] = useState(DEFAULT_DESIGN);
  const hosted = type !== "url" && !isStatic(type);
  const data = hosted ? "" : encode(type, content);

  return (
    <div id="generator" className="mx-auto max-w-6xl scroll-mt-24 rounded-2xl bg-slate-200/60 p-2 sm:p-3">
      <div className="flex gap-2 overflow-x-auto rounded-xl bg-white p-2">
        {TYPE_KEYS.map((t) => (
          <button
            key={t}
            onClick={() => {
              setType(t);
              setContent({});
            }}
            className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${t === type ? "bg-brand-50 text-brand" : "text-slate-600 hover:bg-slate-50"}`}
          >
            <span className={`grid size-9 place-items-center rounded-lg border ${t === type ? "border-brand" : "border-slate-200"}`}>
              <TypeIcon type={t} />
            </span>
            {TYPES[t].label}
          </button>
        ))}
      </div>

      <div className="mt-2 grid gap-4 rounded-xl bg-white p-4 sm:p-8 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <Step n={1} title="Complete the content" />
          <div className="mt-5">
            {hosted ? (
              <div className="rounded-xl border border-brand/30 bg-brand-50 p-6">
                <p className="font-semibold text-slate-900">{TYPES[type].label} QR codes host your content on a page we serve for you.</p>
                <p className="mt-1 text-sm text-slate-600">Create a free account to upload files, edit the content any time and see scan statistics.</p>
                <Link href={`/register?next=/dashboard/new/${type}`} className="mt-4 inline-block rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600">
                  Sign up free
                </Link>
              </div>
            ) : (
              <ContentForm type={type} value={content} onChange={setContent} />
            )}
          </div>
          <hr className="my-8 border-slate-200" />
          <Step n={2} title="Design your QR" />
          <div className="mt-5">
            <DesignPanel design={design} onChange={setDesign} />
          </div>
        </div>
        <Preview data={data} design={design} />
      </div>
    </div>
  );
}
