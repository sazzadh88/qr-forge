import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { uploadPath } from "@/lib/db";
import { MIME } from "@/lib/files";

// Serves uploads with Range support (Safari won't play video without it).
export async function GET(req: Request, ctx: RouteContext<"/files/[name]">) {
  const { name } = await ctx.params;
  const m = /^[a-f0-9]{32}\.([a-z0-9]+)$/.exec(name);
  const type = m && MIME[m[1]];
  if (!type) return new Response("Not found", { status: 404 });
  const file = uploadPath(name);
  const size = await stat(file).then((s) => s.size, () => -1);
  if (size < 0) return new Response("Not found", { status: 404 });

  const headers: Record<string, string> = {
    "Content-Type": type,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  };
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get("range") ?? "");
  let start = 0;
  let end = size - 1;
  if (range && (range[1] || range[2])) {
    start = range[1] ? Number(range[1]) : size - Number(range[2]);
    end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    if (start < 0 || start > end) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    headers["Content-Range"] = `bytes ${start}-${end}/${size}`;
  }
  headers["Content-Length"] = String(end - start + 1);
  const body = Readable.toWeb(createReadStream(file, { start, end })) as ReadableStream;
  return new Response(body, { status: range && (range[1] || range[2]) ? 206 : 200, headers });
}
