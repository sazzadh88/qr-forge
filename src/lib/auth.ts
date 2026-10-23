import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { db, SECRET } from "./db";

export type User = { id: number; email: string; name: string; api_key: string };

const COOKIE = "sid";
const TTL = 30 * 864e5;
const sha = (s: string) => createHash("sha256").update(s).digest("hex");

export function hashPassword(p: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(p, salt, 64).toString("hex")}`;
}

export function verifyPassword(p: string, stored: string) {
  const [salt, h] = stored.split(":");
  const a = Buffer.from(h, "hex");
  const b = scryptSync(p, salt, 64);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const newApiKey = () => `qrf_${randomBytes(24).toString("hex")}`;

export async function startSession(userId: number) {
  const token = randomBytes(32).toString("hex");
  db.prepare("INSERT INTO sessions VALUES (?,?,?)").run(sha(token), userId, Date.now() + TTL);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    // Secure only over https (direct or behind a proxy). Browsers drop Secure cookies on plain http
    // except on localhost, which would break login when the app is opened by LAN IP.
    secure: Boolean((await headers()).get("x-forwarded-proto")?.includes("https")),
    maxAge: TTL / 1000,
    path: "/",
  });
}

export async function endSession() {
  const c = await cookies();
  const t = c.get(COOKIE)?.value;
  if (t) db.prepare("DELETE FROM sessions WHERE token=?").run(sha(t));
  c.delete(COOKIE);
}

export const getUser = cache(async (): Promise<User | null> => {
  const t = (await cookies()).get(COOKIE)?.value;
  if (!t) return null;
  const u = db
    .prepare("SELECT u.id, u.email, u.name, u.api_key FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires_at>?")
    .get(sha(t), Date.now()) as User | undefined;
  return u ?? null;
});

export async function requireUser() {
  const u = await getUser();
  if (!u) redirect("/login");
  return u;
}

export function apiUser(req: Request) {
  const key = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!key) return null;
  return (db.prepare("SELECT id, email, name, api_key FROM users WHERE api_key=?").get(key) as User | undefined) ?? null;
}

// Proof that a visitor entered a QR's password; changing the password invalidates it.
export const unlockToken = (qrId: number, pwHash: string) => createHmac("sha256", SECRET).update(`${qrId}:${pwHash}`).digest("hex");

export const visitorId = (ip: string, ua: string) => createHmac("sha256", SECRET).update(`${ip}|${ua}`).digest("hex").slice(0, 16);

export async function getOrigin() {
  const h = await headers();
  return `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
}
