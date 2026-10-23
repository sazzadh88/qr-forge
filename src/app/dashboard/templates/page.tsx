import { requireUser } from "@/lib/auth";
import { listTemplates } from "@/lib/db";
import { deleteTemplate } from "@/lib/actions";
import QrThumb from "@/components/qr/QrThumb";
import { ConfirmButton } from "@/components/dash";
import TemplateMaker from "./TemplateMaker";

export default async function Templates() {
  const user = await requireUser();
  const templates = listTemplates(user.id);
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold">Templates</h1>
      <p className="text-sm text-slate-500">Save a design once and apply it to new QR codes or bulk batches.</p>
      <TemplateMaker />
      {templates.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          No templates yet. Create one above, or use “Save as template” while editing a QR code.
        </p>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <QrThumb data="https://example.com" design={t.design} downloads={false} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{t.name}</p>
                <p className="text-xs text-slate-500 capitalize">
                  {t.design.dots} · {t.design.frame === "none" ? "no frame" : `${t.design.frame} frame`}
                </p>
              </div>
              <form action={deleteTemplate}>
                <input type="hidden" name="id" value={t.id} />
                <ConfirmButton message={`Delete template “${t.name}”?`} className="text-sm text-red-600 hover:underline">
                  Delete
                </ConfirmButton>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
