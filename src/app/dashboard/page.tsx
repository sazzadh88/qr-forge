import Link from "next/link";
import { getOrigin, requireUser } from "@/lib/auth";
import { db, listFolders, parseQr, type QrRow } from "@/lib/db";
import { isStatic, qrData, TYPE_KEYS, TYPES } from "@/lib/payload";
import { createFolder, deleteFolder, deleteQr, duplicateQr, togglePause } from "@/lib/actions";
import QrThumb from "@/components/qr/QrThumb";
import { ConfirmButton } from "@/components/dash";
import { TypeIcon } from "@/components/icons";

const btn = "rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-brand hover:text-brand";

export default async function MyQrCodes({ searchParams }: PageProps<"/dashboard">) {
  const user = await requireUser();
  const origin = await getOrigin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const type = typeof sp.type === "string" && sp.type in TYPES ? sp.type : "";
  const status = sp.status === "active" || sp.status === "paused" ? sp.status : "";
  const folder = Number(sp.folder) || 0;

  const where = ["q.user_id = ?"];
  const args: (string | number)[] = [user.id];
  const add = (sql: string, v: string | number) => {
    where.push(sql);
    args.push(v);
  };
  if (q) add("q.name LIKE ?", `%${q}%`);
  if (type) add("q.type = ?", type);
  if (status) add("q.paused = ?", status === "paused" ? 1 : 0);
  if (folder) add("q.folder_id = ?", folder);
  const rows = (
    db
      .prepare(`SELECT q.*, (SELECT COUNT(*) FROM scans s WHERE s.qr_id=q.id) scans FROM qrcodes q WHERE ${where.join(" AND ")} ORDER BY q.created_at DESC`)
      .all(...args) as (QrRow & { scans: number })[]
  ).map((r) => ({ ...parseQr(r), scans: r.scans }));
  const folders = listFolders(user.id);
  const current = folders.find((f) => f.id === folder);
  const total = (db.prepare("SELECT COUNT(*) n FROM qrcodes WHERE user_id=?").get(user.id) as { n: number }).n;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_240px]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">{current ? current.name : "My QR codes"}</h1>
          <Link href="/dashboard/new" className="rounded-md bg-ink px-5 py-2 text-sm font-semibold text-paper hover:bg-ember hover:text-ink">
            + Create QR code
          </Link>
        </div>

        <form className="mt-5 flex flex-wrap gap-2 rounded-lg border border-ink/10 bg-white p-3">
          {folder > 0 && <input type="hidden" name="folder" value={folder} />}
          <input name="q" defaultValue={q} placeholder="Search by name" className="min-w-40 flex-1 rounded-lg border border-ink/20 px-3 py-2 text-sm" />
          <select name="type" defaultValue={type} className="rounded-lg border border-ink/20 px-3 py-2 text-sm">
            <option value="">All types</option>
            {TYPE_KEYS.map((t) => (
              <option key={t} value={t}>
                {TYPES[t].label}
              </option>
            ))}
          </select>
          <select name="status" defaultValue={status} className="rounded-lg border border-ink/20 px-3 py-2 text-sm">
            <option value="">Any status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>
          <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Filter</button>
        </form>

        {rows.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-ink/20 bg-white p-12 text-center">
            <p className="font-semibold">{total ? "No QR codes match these filters." : "You haven't created any QR codes yet."}</p>
            <Link href="/dashboard/new" className="mt-3 inline-block text-sm font-semibold text-brand">
              Create your first QR code →
            </Link>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {rows.map((r) => {
              const dynamic = !isStatic(r.type);
              return (
                <li key={r.id} className="flex flex-wrap items-center gap-4 rounded-lg border border-ink/10 bg-white p-4">
                  <QrThumb data={qrData(r, origin)} design={r.design} name={r.name} />
                  <div className="min-w-48 flex-1">
                    <div className="flex items-center gap-2">
                      <TypeIcon type={r.type} className="size-4 text-brand" />
                      <span className="text-xs font-medium text-slate-500">{TYPES[r.type].label}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.paused ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                        {r.paused ? "Paused" : "Active"}
                      </span>
                      {r.password && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">🔒 Protected</span>}
                    </div>
                    <p className="mt-1 font-semibold">{r.name}</p>
                    <p className="text-xs text-slate-500">
                      {dynamic ? (
                        <a href={`/q/${r.slug}`} target="_blank" className="text-brand hover:underline">
                          {origin.replace(/^https?:\/\//, "")}/q/{r.slug}
                        </a>
                      ) : (
                        "Static code"
                      )}{" "}
                      · Created {new Date(r.created_at).toLocaleDateString("en-US", { dateStyle: "medium" })}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">{dynamic ? r.scans : "—"}</p>
                    <p className="text-xs text-slate-500">Scans</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Link href={`/dashboard/qr/${r.id}`} className={btn}>
                      Edit
                    </Link>
                    {dynamic && (
                      <Link href={`/dashboard/analytics?qr=${r.id}`} className={btn}>
                        Stats
                      </Link>
                    )}
                    <form action={duplicateQr}>
                      <input type="hidden" name="id" value={r.id} />
                      <button className={btn}>Duplicate</button>
                    </form>
                    {dynamic && (
                      <form action={togglePause}>
                        <input type="hidden" name="id" value={r.id} />
                        <button className={btn}>{r.paused ? "Activate" : "Pause"}</button>
                      </form>
                    )}
                    <form action={deleteQr}>
                      <input type="hidden" name="id" value={r.id} />
                      <ConfirmButton message={`Delete “${r.name}” and its scan history?`} className={`${btn} hover:border-red-500 hover:text-red-600`}>
                        Delete
                      </ConfirmButton>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <aside className="space-y-4">
        <div className="rounded-lg border border-ink/10 bg-white p-4">
          <h2 className="text-sm font-semibold">Folders</h2>
          <ul className="mt-2 space-y-0.5 text-sm">
            <li>
              <Link href="/dashboard" className={`flex justify-between rounded-lg px-2 py-1.5 ${!folder ? "bg-brand-50 text-brand" : "hover:bg-slate-50"}`}>
                All QR codes <span>{total}</span>
              </Link>
            </li>
            {folders.map((f) => (
              <li key={f.id}>
                <Link href={`/dashboard?folder=${f.id}`} className={`flex justify-between rounded-lg px-2 py-1.5 ${f.id === folder ? "bg-brand-50 text-brand" : "hover:bg-slate-50"}`}>
                  <span className="truncate">📁 {f.name}</span> <span>{f.n}</span>
                </Link>
              </li>
            ))}
          </ul>
          <form action={createFolder} className="mt-3 flex gap-1">
            <input name="name" placeholder="New folder" required className="min-w-0 flex-1 rounded-lg border border-ink/20 px-2 py-1.5 text-sm" />
            <button className="rounded-lg bg-slate-900 px-3 text-sm text-white">Add</button>
          </form>
          {current && (
            <form action={deleteFolder} className="mt-2">
              <input type="hidden" name="id" value={current.id} />
              <ConfirmButton message={`Delete folder “${current.name}”? Its QR codes are kept.`} className="text-xs text-red-600 hover:underline">
                Delete this folder
              </ConfirmButton>
            </form>
          )}
        </div>
      </aside>
    </div>
  );
}
