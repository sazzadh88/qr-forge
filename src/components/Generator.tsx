"use client";

import { useState } from "react";
import Link from "next/link";
import { encode, isStatic, TYPE_KEYS, TYPES, type QrType } from "@/lib/payload";
import { DEFAULT_DESIGN } from "@/lib/design";
import ContentForm from "./qr/ContentForm";
import DesignPanel from "./qr/DesignPanel";
import Preview, { SectionHead } from "./qr/Preview";
import { TypeIcon } from "./icons";

// Anonymous workbench: a vertical type rail, a content + style column, and a dark output panel.
// Static types (and plain URLs) are encoded directly; hosted types need an account.
export default function Generator() {
  const [type, setType] = useState<QrType>("url");
  const [content, setContent] = useState<Record<string, unknown>>({});
  const [design, setDesign] = useState(DEFAULT_DESIGN);
  const hosted = type !== "url" && !isStatic(type);
  const data = hosted ? "" : encode(type, content);

  return (
    <div id="workbench" className="mx-auto grid max-w-7xl scroll-mt-20 overflow-hidden rounded-lg border border-ink/10 bg-white shadow-2xl shadow-ink/20 lg:grid-cols-[200px_1fr_300px]">
      <nav aria-label="QR type" className="flex gap-1 overflow-x-auto border-b border-paper-200 bg-paper p-2 lg:flex-col lg:border-r lg:border-b-0 lg:overflow-visible">
        {TYPE_KEYS.map((t) => {
          const on = t === type;
          return (
            <button
              key={t}
              onClick={() => {
                setType(t);
                setContent({});
              }}
              aria-pressed={on}
              className={`flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm whitespace-nowrap ${on ? "bg-ink text-paper" : "text-ink-600 hover:bg-paper-200 hover:text-ink"}`}
            >
              <TypeIcon type={t} className={`size-4 ${on ? "text-ember" : ""}`} />
              {TYPES[t].label}
            </button>
          );
        })}
      </nav>

      <div className="min-w-0 p-6 sm:p-8">
        <SectionHead label="Content" title={TYPES[type].hint} />
        <div className="mt-5">
          {hosted ? (
            <div className="rounded-md border border-ember/40 bg-ember-50 p-5">
              <p className="font-semibold">{TYPES[type].label} codes live on a hosted page.</p>
              <p className="mt-1 text-sm text-ink-600">Create a free account to upload files, edit the content any time and see who scans it.</p>
              <Link href={`/register?next=/dashboard/new/${type}`} className="mt-4 inline-block rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-ember hover:text-ink">
                Continue with an account
              </Link>
            </div>
          ) : (
            <ContentForm type={type} value={content} onChange={setContent} />
          )}
        </div>
        <div className="mt-10 border-t border-paper-200 pt-8">
          <SectionHead label="Style" title="Make it yours" />
          <div className="mt-5">
            <DesignPanel design={design} onChange={setDesign} />
          </div>
        </div>
      </div>

      <Preview data={data} design={design} />
    </div>
  );
}
