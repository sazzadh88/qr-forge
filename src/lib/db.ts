import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { randomBytes } from "node:crypto";
import path from "node:path";
import type { QrType } from "./payload";
import type { Design } from "./design";

export const DATA_DIR = path.join(process.cwd(), "data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
// Runtime-only path; tell Turbopack not to trace the whole project from it.
export const uploadPath = (name: string) => path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, name);

// ponytail: single-file SQLite; swap for Postgres if this runs on more than one server.
function open() {
  mkdirSync(UPLOAD_DIR, { recursive: true });
  const db = new DatabaseSync(path.join(DATA_DIR, "app.db"));
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, pass TEXT NOT NULL,
      api_key TEXT UNIQUE NOT NULL, created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE, expires_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE, name TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS qrcodes (
      id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
      folder_id INTEGER REFERENCES folders ON DELETE SET NULL, name TEXT NOT NULL, type TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL, content TEXT NOT NULL, design TEXT NOT NULL, password TEXT,
      paused INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS scans (
      id INTEGER PRIMARY KEY, qr_id INTEGER NOT NULL REFERENCES qrcodes ON DELETE CASCADE, at INTEGER NOT NULL,
      visitor TEXT, os TEXT, device TEXT, browser TEXT);
    CREATE INDEX IF NOT EXISTS scans_qr_at ON scans(qr_id, at);
    CREATE TABLE IF NOT EXISTS templates (
      id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE, name TEXT NOT NULL, design TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT NOT NULL);
  `);
  return db;
}

const g = globalThis as { __db?: DatabaseSync };
export const db = (g.__db ??= open());

export const SECRET = (() => {
  const row = db.prepare("SELECT v FROM meta WHERE k='secret'").get() as { v: string } | undefined;
  if (row) return row.v;
  const v = randomBytes(32).toString("hex");
  db.prepare("INSERT INTO meta VALUES ('secret', ?)").run(v);
  return v;
})();

export type QrRow = {
  id: number;
  user_id: number;
  folder_id: number | null;
  name: string;
  type: QrType;
  slug: string;
  content: string;
  design: string;
  password: string | null;
  paused: number;
  created_at: number;
  updated_at: number;
};

export type Qr = Omit<QrRow, "content" | "design"> & { content: Record<string, unknown>; design: Design };

export const parseQr = (r: QrRow): Qr => ({ ...r, content: JSON.parse(r.content), design: JSON.parse(r.design) });

export const newSlug = () => randomBytes(6).toString("base64url");

export function getQr(userId: number, id: number): Qr | null {
  const r = db.prepare("SELECT * FROM qrcodes WHERE id=? AND user_id=?").get(id, userId) as QrRow | undefined;
  return r ? parseQr(r) : null;
}

export function getQrBySlug(slug: string): Qr | null {
  const r = db.prepare("SELECT * FROM qrcodes WHERE slug=?").get(slug) as QrRow | undefined;
  return r ? parseQr(r) : null;
}

export function insertQr(userId: number, q: { name: string; type: QrType; folderId: number | null; content: object; design: object; password: string | null }) {
  const now = Date.now();
  const r = db
    .prepare("INSERT INTO qrcodes (user_id, folder_id, name, type, slug, content, design, password, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)")
    .run(userId, q.folderId, q.name, q.type, newSlug(), JSON.stringify(q.content), JSON.stringify(q.design), q.password, now, now);
  return Number(r.lastInsertRowid);
}

export const folderOwned = (userId: number, id: number | null) =>
  id === null || Boolean(db.prepare("SELECT 1 FROM folders WHERE id=? AND user_id=?").get(id, userId));

export const listFolders = (userId: number) =>
  db
    .prepare("SELECT f.id, f.name, COUNT(q.id) n FROM folders f LEFT JOIN qrcodes q ON q.folder_id=f.id WHERE f.user_id=? GROUP BY f.id ORDER BY f.name")
    .all(userId) as { id: number; name: string; n: number }[];

export const listTemplates = (userId: number) =>
  (db.prepare("SELECT id, name, design FROM templates WHERE user_id=? ORDER BY id DESC").all(userId) as { id: number; name: string; design: string }[]).map((t) => ({
    ...t,
    design: JSON.parse(t.design) as Design,
  }));
