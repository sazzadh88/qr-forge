"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db, folderOwned, getQr, getQrBySlug, insertQr } from "./db";
import { endSession, hashPassword, newApiKey, requireUser, startSession, unlockToken, verifyPassword } from "./auth";
import { isType, missingField, safeHref, type QrType } from "./payload";
import { DEFAULT_DESIGN, type Design } from "./design";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
function back(path: string, params: Record<string, string>): never {
  redirect(`${path}?${new URLSearchParams(params)}`);
}
// Only same-site relative paths, so ?next= can't bounce users to another domain.
const safeNext = (n: string) => (n.startsWith("/") && !n.startsWith("//") ? n : "/dashboard");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------- auth ----------

export async function register(fd: FormData) {
  const name = str(fd, "name");
  const email = str(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  const next = str(fd, "next");
  if (!name || !EMAIL.test(email)) back("/register", { error: "Enter your name and a valid email.", next });
  if (password.length < 8) back("/register", { error: "Password must be at least 8 characters.", next });
  if (db.prepare("SELECT 1 FROM users WHERE email=?").get(email)) back("/register", { error: "An account with this email already exists.", next });
  const r = db.prepare("INSERT INTO users (email, name, pass, api_key, created_at) VALUES (?,?,?,?,?)").run(email, name, hashPassword(password), newApiKey(), Date.now());
  await startSession(Number(r.lastInsertRowid));
  redirect(safeNext(next));
}

export async function login(fd: FormData) {
  const email = str(fd, "email").toLowerCase();
  const next = str(fd, "next");
  const u = db.prepare("SELECT id, pass FROM users WHERE email=?").get(email) as { id: number; pass: string } | undefined;
  if (!u || !verifyPassword(String(fd.get("password") ?? ""), u.pass)) back("/login", { error: "Wrong email or password.", next });
  await startSession(u.id);
  redirect(safeNext(next));
}

export async function logout() {
  await endSession();
  redirect("/");
}

// ---------- QR codes ----------

export type QrInput = {
  id?: number;
  type: QrType;
  name: string;
  folderId: number | null;
  content: Record<string, unknown>;
  design: Design;
  password?: string;
  removePassword?: boolean;
};

export async function saveQr(input: QrInput): Promise<{ error: string } | undefined> {
  const user = await requireUser();
  const { id, type, content, design, folderId } = input;
  const name = (input.name ?? "").trim().slice(0, 100);
  if (!isType(type)) return { error: "Unknown QR type." };
  if (!name) return { error: "Give your QR code a name." };
  if (typeof content !== "object" || content === null || Array.isArray(content)) return { error: "Invalid content." };
  const missing = missingField(type, content);
  if (missing) return { error: `${missing} is required.` };
  if (type === "url" && !safeHref(content.url)) return { error: "Enter a valid http(s) link." };
  if (!folderOwned(user.id, folderId)) return { error: "Folder not found." };
  const d = { ...DEFAULT_DESIGN, ...design };
  if (d.logo && !(typeof d.logo === "string" && d.logo.startsWith("data:image/") && d.logo.length < 700_000)) return { error: "Invalid logo." };

  const pw = input.password?.trim();
  if (id) {
    const old = getQr(user.id, id);
    if (!old) return { error: "QR code not found." };
    const password = input.removePassword ? null : pw ? hashPassword(pw) : old.password;
    db.prepare("UPDATE qrcodes SET name=?, folder_id=?, content=?, design=?, password=?, updated_at=? WHERE id=? AND user_id=?").run(
      name,
      folderId,
      JSON.stringify(content),
      JSON.stringify(d),
      password,
      Date.now(),
      id,
      user.id,
    );
  } else {
    insertQr(user.id, { name, type, folderId, content, design: d, password: pw ? hashPassword(pw) : null });
  }
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

const ownedId = async (fd: FormData) => {
  const user = await requireUser();
  return { user, id: Number(fd.get("id")) };
};

export async function deleteQr(fd: FormData) {
  const { user, id } = await ownedId(fd);
  db.prepare("DELETE FROM qrcodes WHERE id=? AND user_id=?").run(id, user.id);
  revalidatePath("/dashboard");
}

export async function togglePause(fd: FormData) {
  const { user, id } = await ownedId(fd);
  db.prepare("UPDATE qrcodes SET paused = 1 - paused, updated_at=? WHERE id=? AND user_id=?").run(Date.now(), id, user.id);
  revalidatePath("/dashboard");
}

export async function duplicateQr(fd: FormData) {
  const { user, id } = await ownedId(fd);
  const q = getQr(user.id, id);
  if (!q) return;
  insertQr(user.id, { name: `${q.name} (copy)`, type: q.type, folderId: q.folder_id, content: q.content, design: q.design, password: q.password });
  revalidatePath("/dashboard");
}

// ---------- folders ----------

export async function createFolder(fd: FormData) {
  const user = await requireUser();
  const name = str(fd, "name").slice(0, 60);
  if (name) db.prepare("INSERT INTO folders (user_id, name) VALUES (?,?)").run(user.id, name);
  revalidatePath("/dashboard");
}

export async function deleteFolder(fd: FormData) {
  const { user, id } = await ownedId(fd);
  db.prepare("DELETE FROM folders WHERE id=? AND user_id=?").run(id, user.id);
  redirect("/dashboard");
}

// ---------- templates ----------

export async function saveTemplate(name: string, design: Design) {
  const user = await requireUser();
  const n = String(name ?? "").trim().slice(0, 60);
  if (!n) return;
  db.prepare("INSERT INTO templates (user_id, name, design) VALUES (?,?,?)").run(user.id, n, JSON.stringify({ ...DEFAULT_DESIGN, ...design }));
  revalidatePath("/dashboard/templates");
}

export async function deleteTemplate(fd: FormData) {
  const { user, id } = await ownedId(fd);
  db.prepare("DELETE FROM templates WHERE id=? AND user_id=?").run(id, user.id);
  revalidatePath("/dashboard/templates");
}

// ---------- bulk ----------

const MAX_BULK = 500;

export async function bulkCreate(fd: FormData) {
  const user = await requireUser();
  const file = fd.get("file");
  const text = [str(fd, "rows"), file instanceof File && file.size ? await file.text() : ""].join("\n");
  const rows = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const i = l.lastIndexOf(",");
      return i < 0 ? { name: l, url: l } : { name: l.slice(0, i).trim().replace(/^"|"$/g, ""), url: l.slice(i + 1).trim() };
    })
    .filter((r) => !/^name$/i.test(r.name) && safeHref(r.url)?.startsWith("http"));
  if (!rows.length) back("/dashboard/bulk", { error: "No valid rows found. Use one “name,url” per line." });
  if (rows.length > MAX_BULK) back("/dashboard/bulk", { error: `At most ${MAX_BULK} rows per batch.` });

  const folderName = str(fd, "folder") || `Bulk ${new Date().toISOString().slice(0, 16).replace("T", " ")}`;
  const folderId = Number(db.prepare("INSERT INTO folders (user_id, name) VALUES (?,?)").run(user.id, folderName.slice(0, 60)).lastInsertRowid);
  const tpl = Number(fd.get("template"));
  const t = tpl ? (db.prepare("SELECT design FROM templates WHERE id=? AND user_id=?").get(tpl, user.id) as { design: string } | undefined) : undefined;
  const design = t ? JSON.parse(t.design) : DEFAULT_DESIGN;

  db.exec("BEGIN");
  try {
    for (const r of rows) insertQr(user.id, { name: r.name.slice(0, 100) || r.url, type: "url", folderId, content: { url: safeHref(r.url) }, design, password: null });
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
  redirect(`/dashboard?folder=${folderId}`);
}

// ---------- settings ----------

export async function updateProfile(fd: FormData) {
  const user = await requireUser();
  const name = str(fd, "name");
  const email = str(fd, "email").toLowerCase();
  if (!name || !EMAIL.test(email)) back("/dashboard/settings", { error: "Enter a name and a valid email." });
  if (db.prepare("SELECT 1 FROM users WHERE email=? AND id<>?").get(email, user.id)) back("/dashboard/settings", { error: "That email is already in use." });
  db.prepare("UPDATE users SET name=?, email=? WHERE id=?").run(name, email, user.id);
  back("/dashboard/settings", { ok: "Profile updated." });
}

export async function changePassword(fd: FormData) {
  const user = await requireUser();
  const { pass } = db.prepare("SELECT pass FROM users WHERE id=?").get(user.id) as { pass: string };
  const next = String(fd.get("new") ?? "");
  if (!verifyPassword(String(fd.get("current") ?? ""), pass)) back("/dashboard/settings", { error: "Current password is wrong." });
  if (next.length < 8) back("/dashboard/settings", { error: "New password must be at least 8 characters." });
  db.prepare("UPDATE users SET pass=? WHERE id=?").run(hashPassword(next), user.id);
  back("/dashboard/settings", { ok: "Password changed." });
}

export async function regenerateApiKey() {
  const user = await requireUser();
  db.prepare("UPDATE users SET api_key=? WHERE id=?").run(newApiKey(), user.id);
  back("/dashboard/settings", { ok: "New API key generated. The old one no longer works." });
}

export async function deleteAccount(fd: FormData) {
  const user = await requireUser();
  const { pass } = db.prepare("SELECT pass FROM users WHERE id=?").get(user.id) as { pass: string };
  if (!verifyPassword(String(fd.get("password") ?? ""), pass)) back("/dashboard/settings", { error: "Password is wrong; account not deleted." });
  await endSession();
  db.prepare("DELETE FROM users WHERE id=?").run(user.id);
  redirect("/");
}

// ---------- public: password-protected QR pages ----------

export async function unlockQr(fd: FormData) {
  const slug = str(fd, "slug");
  const qr = getQrBySlug(slug);
  if (!qr?.password) redirect(`/p/${slug}`);
  if (!verifyPassword(String(fd.get("password") ?? ""), qr.password)) back(`/p/${slug}`, { error: "Wrong password." });
  (await cookies()).set(`u_${qr.id}`, unlockToken(qr.id, qr.password), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 86400 });
  redirect(`/p/${slug}`);
}

