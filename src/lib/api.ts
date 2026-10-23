import type { QrRow } from "./db";

export const unauthorized = () => Response.json({ error: "Missing or invalid API key." }, { status: 401 });

export const view = (q: QrRow & { scans?: number; unique_scans?: number }, origin: string) => ({
  id: q.id,
  name: q.name,
  type: q.type,
  short_url: `${origin}/q/${q.slug}`,
  content: JSON.parse(q.content),
  paused: Boolean(q.paused),
  scans: q.scans ?? 0,
  ...(q.unique_scans !== undefined && { unique_scans: q.unique_scans }),
  created_at: new Date(q.created_at).toISOString(),
  updated_at: new Date(q.updated_at).toISOString(),
});
