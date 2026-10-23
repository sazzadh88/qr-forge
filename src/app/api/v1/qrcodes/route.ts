import { apiUser } from "@/lib/auth";
import { db, insertQr, type QrRow } from "@/lib/db";
import { unauthorized, view } from "@/lib/api";
import { DEFAULT_DESIGN } from "@/lib/design";
import { safeHref } from "@/lib/payload";

export async function GET(req: Request) {
  const user = apiUser(req);
  if (!user) return unauthorized();
  const rows = db
    .prepare("SELECT q.*, (SELECT COUNT(*) FROM scans s WHERE s.qr_id=q.id) scans FROM qrcodes q WHERE user_id=? ORDER BY created_at DESC")
    .all(user.id) as (QrRow & { scans: number })[];
  return Response.json({ data: rows.map((r) => view(r, new URL(req.url).origin)) });
}

export async function POST(req: Request) {
  const user = apiUser(req);
  if (!user) return unauthorized();
  const body = await req.json().catch(() => null);
  const url = safeHref(body?.url);
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 100) : "";
  if (!name || !url?.startsWith("http")) return Response.json({ error: "Provide a name and an http(s) url." }, { status: 422 });
  const id = insertQr(user.id, { name, type: "url", folderId: null, content: { url }, design: DEFAULT_DESIGN, password: null });
  const row = db.prepare("SELECT * FROM qrcodes WHERE id=?").get(id) as QrRow;
  return Response.json({ data: view(row, new URL(req.url).origin) }, { status: 201 });
}
