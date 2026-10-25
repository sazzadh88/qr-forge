import { requireUser } from "@/lib/auth";
import { listTemplates } from "@/lib/db";
import { bulkCreate } from "@/lib/actions";

const input = "mt-1.5 w-full rounded-lg border border-ink/20 px-3 py-2.5 text-sm";

export default async function Bulk({ searchParams }: PageProps<"/dashboard/bulk">) {
  const user = await requireUser();
  const { error } = await searchParams;
  const templates = listTemplates(user.id);
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">Bulk creation</h1>
      <p className="text-sm text-slate-500">Create up to 500 dynamic website QR codes at once. They land in a new folder, ready to download.</p>
      <form action={bulkCreate} className="mt-6 space-y-5 rounded-lg border border-ink/10 bg-white p-6">
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{String(error)}</p>}
        <label className="block text-sm font-medium">
          Rows — one <code className="rounded bg-slate-100 px-1">name,url</code> per line
          <textarea name="rows" rows={8} placeholder={"Store window,https://example.com/store\nFlyer A,https://example.com/a"} className={`${input} font-mono`} />
        </label>
        <label className="block text-sm font-medium">
          …or upload a CSV file
          <input name="file" type="file" accept=".csv,text/csv,text/plain" className={input} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Folder name
            <input name="folder" placeholder="Defaults to today's date" className={input} />
          </label>
          <label className="block text-sm font-medium">
            Design
            <select name="template" className={input}>
              <option value="">Default design</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button className="rounded-md bg-ink px-6 py-2.5 text-sm font-semibold text-paper hover:bg-ember hover:text-ink">Create QR codes</button>
      </form>
    </div>
  );
}
