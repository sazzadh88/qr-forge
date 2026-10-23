import { NextResponse, userAgent, type NextRequest } from "next/server";
import { db, getQrBySlug } from "@/lib/db";
import { visitorId } from "@/lib/auth";
import { safeHref } from "@/lib/payload";

// Every dynamic QR encodes /q/<slug>: log the scan, then redirect or hand off to the hosted page.
export async function GET(req: NextRequest, ctx: RouteContext<"/q/[slug]">) {
  const { slug } = await ctx.params;
  const qr = getQrBySlug(slug);
  if (!qr) return new Response("QR code not found", { status: 404 });
  const page = new URL(`/p/${slug}`, req.url);
  if (qr.paused) return NextResponse.redirect(page);

  const ua = userAgent(req);
  if (!ua.isBot) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "";
    db.prepare("INSERT INTO scans (qr_id, at, visitor, os, device, browser) VALUES (?,?,?,?,?,?)").run(
      qr.id,
      Date.now(),
      visitorId(ip, ua.ua),
      ua.os.name ?? "Other",
      ua.device.type ?? "desktop",
      ua.browser.name ?? "Other",
    );
  }

  if (qr.password) return NextResponse.redirect(page);
  if (qr.type === "url") return NextResponse.redirect(safeHref(qr.content.url) ?? page);
  if (qr.type === "apps") {
    const store = ua.os.name === "iOS" ? qr.content.ios : ua.os.name === "Android" ? qr.content.android : null;
    const href = safeHref(store);
    if (href) return NextResponse.redirect(href);
  }
  return NextResponse.redirect(page);
}
