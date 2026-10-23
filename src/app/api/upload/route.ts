import { writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { getUser } from "@/lib/auth";
import { uploadPath } from "@/lib/db";
import { EXT } from "@/lib/files";

const MAX = 50 * 1024 * 1024;

// ponytail: uploads live on local disk and are never garbage-collected; move to object storage for multi-server.
export async function POST(req: Request) {
  if (!(await getUser())) return new Response("Log in to upload files.", { status: 401 });
  const file = (await req.formData()).get("file");
  if (!(file instanceof File)) return new Response("No file.", { status: 400 });
  const ext = EXT[file.type];
  if (!ext) return new Response("This file type isn't supported.", { status: 415 });
  if (file.size > MAX) return new Response("Files must be under 50 MB.", { status: 413 });
  const name = `${randomBytes(16).toString("hex")}.${ext}`;
  await writeFile(uploadPath(name), Buffer.from(await file.arrayBuffer()));
  return Response.json({ url: `/files/${name}` });
}
