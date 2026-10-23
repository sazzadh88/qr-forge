"use client";

import { useEffect, useRef, useState } from "react";
import type QRCodeStyling from "qr-code-styling";
import { renderQr, type Design } from "@/lib/design";

export function useQr(data: string, design: Design) {
  const [png, setPng] = useState<string>();
  const ref = useRef<{ qr: QRCodeStyling; canvas: HTMLCanvasElement }>(null);

  useEffect(() => {
    if (!data) return;
    let stale = false;
    renderQr(data, design).then((r) => {
      if (stale) return;
      ref.current = r;
      setPng(r.canvas.toDataURL("image/png"));
    });
    return () => {
      stale = true;
    };
  }, [data, design]);

  const download = (ext: "png" | "jpg" | "svg", name = "qr-code") => {
    const r = ref.current;
    if (!r) return;
    if (ext === "svg") return r.qr.download({ name, extension: "svg" });
    const a = document.createElement("a");
    a.href = r.canvas.toDataURL(ext === "png" ? "image/png" : "image/jpeg", 0.95);
    a.download = `${name}.${ext}`;
    a.click();
  };

  return { png: data ? png : undefined, download };
}
