import { apiUser } from "@/lib/auth";
import { db, type QrRow } from "@/lib/db";
import { safeHref } from "@/lib/payload";
import { unauthorized, view } from "@/lib/api";

const notFound = () => Response.json({ error: "QR code not found." }, { status: 404 });

function load(userId: number, id: number) {
  return db
    .prepare(
      "SELECT q.*, (SELECT COUNT(*) FROM scans s WHERE s.qr_id=q.id) scans, (SELECT COUNT(DISTINCT visitor) FROM scans s WHERE s.qr_id=q.id) unique_scans FROM qrcodes q WHERE id=? AND user_id=?",
    )
    .get(id, userId) as (QrRow & { scans: number; unique_scans: number }) | undefined;
}

export async function GET(req: Request, ctx: RouteContext<"/api/v1/qrcodes/[id]">) {
  const user = apiUser(req);
  if (!user) return unauthorized();
  const row = load(user.id, Number((await ctx.params).id));
  return row ? Response.json({ data: view(row, new URL(req.url).origin) }) : notFound();
}

export async function PATCH(req: Request, ctx: RouteContext<"/api/v1/qrcodes/[id]">) {
  const user = apiUser(req);
  if (!user) return unauthorized();
  const id = Number((await ctx.params).id);
  const row = load(user.id, id);
  if (!row) return notFound();
  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" && body.name.trim() ? body.name.trim().slice(0, 100) : row.name;
  const paused = typeof body.paused === "boolean" ? Number(body.paused) : row.paused;
  let content = row.content;
  if (body.url !== undefined) {
    const url = safeHref(body.url);
    if (row.type !== "url" || !url?.startsWith("http")) return Response.json({ error: "url can only be set on website codes and must be http(s)." }, { status: 422 });
    content = JSON.stringify({ ...JSON.parse(row.content), url });
  }
  db.prepare("UPDATE qrcodes SET name=?, paused=?, content=?, updated_at=? WHERE id=?").run(name, paused, content, Date.now(), id);
  return Response.json({ data: view(load(user.id, id)!, new URL(req.url).origin) });
}

export async function DELETE(req: Request, ctx: RouteContext<"/api/v1/qrcodes/[id]">) {
  const user = apiUser(req);
  if (!user) return unauthorized();
  const r = db.prepare("DELETE FROM qrcodes WHERE id=? AND user_id=?").run(Number((await ctx.params).id), user.id);
  return r.changes ? new Response(null, { status: 204 }) : notFound();
}
