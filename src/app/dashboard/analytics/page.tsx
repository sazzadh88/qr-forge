import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { isStatic, type QrType } from "@/lib/payload";

const RANGES = [7, 30, 90, 365];
const DAY = 864e5;

export default async function Analytics({ searchParams }: PageProps<"/dashboard/analytics">) {
  const user = await requireUser();
  const sp = await searchParams;
  const days = RANGES.includes(Number(sp.days)) ? Number(sp.days) : 30;
  const qrs = (db.prepare("SELECT id, name, type FROM qrcodes WHERE user_id=? ORDER BY name").all(user.id) as { id: number; name: string; type: QrType }[]).filter(
    (q) => !isStatic(q.type),
  );
  const qr = qrs.find((q) => q.id === Number(sp.qr));
  const since = new Date(new Date().toISOString().slice(0, 10)).getTime() - (days - 1) * DAY;

  // Every query shares the same scoped WHERE; ownership is enforced by joining qrcodes on user_id.
  const where = `FROM scans s JOIN qrcodes q ON q.id=s.qr_id WHERE q.user_id=? AND s.at>=?${qr ? " AND q.id=?" : ""}`;
  const args = qr ? [user.id, since, qr.id] : [user.id, since];
  const totals = db.prepare(`SELECT COUNT(*) total, COUNT(DISTINCT s.visitor) uniq ${where}`).get(...args) as { total: number; uniq: number };
  const perDay = new Map(
    (db.prepare(`SELECT date(s.at/1000, 'unixepoch') d, COUNT(*) n ${where} GROUP BY d`).all(...args) as { d: string; n: number }[]).map((r) => [r.d, r.n]),
  );
  const series = Array.from({ length: days }, (_, i) => {
    const d = new Date(since + i * DAY).toISOString().slice(0, 10);
    return { d, n: perDay.get(d) ?? 0 };
  });
  const max = Math.max(1, ...series.map((x) => x.n));
  const by = (col: string) => db.prepare(`SELECT s.${col} k, COUNT(*) n ${where} GROUP BY k ORDER BY n DESC LIMIT 6`).all(...args) as { k: string; n: number }[];
  const top = db.prepare(`SELECT q.id, q.name, COUNT(*) n ${where} GROUP BY q.id ORDER BY n DESC LIMIT 8`).all(...args) as { id: number; name: string; n: number }[];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-slate-500">{qr ? qr.name : "All dynamic QR codes"}</p>
        </div>
        <form className="flex flex-wrap gap-2">
          <select name="qr" defaultValue={qr?.id ?? ""} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
            <option value="">All QR codes</option>
            {qrs.map((q) => (
              <option key={q.id} value={q.id}>
                {q.name}
              </option>
            ))}
          </select>
          <select name="days" defaultValue={days} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
            {RANGES.map((r) => (
              <option key={r} value={r}>
                Last {r} days
              </option>
            ))}
          </select>
          <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Apply</button>
        </form>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Total scans" value={totals.total} />
        <Stat label="Unique scans" value={totals.uniq} />
        <Stat label="Avg. per day" value={Math.round((totals.total / days) * 10) / 10} />
      </div>

      <section className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold">Scans per day</h2>
        {totals.total === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500">No scans in this period yet. Scan one of your dynamic codes to see data here.</p>
        ) : (
          <div className="mt-4 flex h-48 items-end gap-px">
            {series.map((x) => (
              <div key={x.d} className="group relative flex h-full flex-1 items-end">
                <div className="w-full rounded-t bg-brand/80 group-hover:bg-brand" style={{ height: `${(x.n / max) * 100}%`, minHeight: x.n ? 2 : 0 }} />
                <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded bg-slate-900 px-2 py-1 text-xs whitespace-nowrap text-white group-hover:block">
                  {x.d}: {x.n}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-2 flex justify-between text-xs text-slate-400">
          <span>{series[0].d}</span>
          <span>{series.at(-1)!.d}</span>
        </div>
      </section>

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Breakdown title="Operating system" rows={by("os")} total={totals.total} />
        <Breakdown title="Device" rows={by("device")} total={totals.total} />
        <Breakdown title="Browser" rows={by("browser")} total={totals.total} />
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold">Top QR codes</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {top.map((t) => (
              <li key={t.id} className="flex justify-between gap-2">
                <Link href={`/dashboard/analytics?qr=${t.id}&days=${days}`} className="truncate text-brand hover:underline">
                  {t.name}
                </Link>
                <span className="font-semibold">{t.n}</span>
              </li>
            ))}
            {!top.length && <li className="text-slate-400">—</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}

function Breakdown({ title, rows, total }: { title: string; rows: { k: string; n: number }[]; total: number }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="font-semibold">{title}</h2>
      <ul className="mt-3 space-y-3 text-sm">
        {rows.map((r) => (
          <li key={r.k}>
            <div className="flex justify-between">
              <span>{r.k === r.k.toLowerCase() ? r.k[0].toUpperCase() + r.k.slice(1) : r.k}</span>
              <span className="text-slate-500">{Math.round((r.n / total) * 100)}%</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-brand" style={{ width: `${(r.n / total) * 100}%` }} />
            </div>
          </li>
        ))}
        {!rows.length && <li className="text-slate-400">—</li>}
      </ul>
    </section>
  );
}
