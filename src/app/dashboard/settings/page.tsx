import { requireUser } from "@/lib/auth";
import { changePassword, deleteAccount, regenerateApiKey, updateProfile } from "@/lib/actions";
import { ConfirmButton } from "@/components/dash";

const input = "mt-1.5 w-full rounded-lg border border-ink/20 px-3 py-2.5 text-sm";
const btn = "rounded-md bg-ink px-5 py-2 text-sm font-semibold text-paper hover:bg-ember hover:text-ink";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-6">
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function Settings({ searchParams }: PageProps<"/dashboard/settings">) {
  const user = await requireUser();
  const { ok, error } = await searchParams;
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      {ok && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{String(ok)}</p>}
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{String(error)}</p>}

      <Card title="Profile">
        <form action={updateProfile} className="space-y-4">
          <label className="block text-sm font-medium">
            Name
            <input name="name" defaultValue={user.name} required className={input} />
          </label>
          <label className="block text-sm font-medium">
            Email
            <input name="email" type="email" defaultValue={user.email} required className={input} />
          </label>
          <button className={btn}>Save profile</button>
        </form>
      </Card>

      <Card title="Password">
        <form action={changePassword} className="space-y-4">
          <label className="block text-sm font-medium">
            Current password
            <input name="current" type="password" required autoComplete="current-password" className={input} />
          </label>
          <label className="block text-sm font-medium">
            New password
            <input name="new" type="password" required minLength={8} autoComplete="new-password" className={input} />
          </label>
          <button className={btn}>Change password</button>
        </form>
      </Card>

      <Card title="API key">
        <p className="text-sm text-slate-600">Use this key as a Bearer token for the REST API. Keep it secret.</p>
        <code className="mt-3 block overflow-x-auto rounded-lg bg-slate-900 px-3 py-2 text-sm text-slate-100">{user.api_key}</code>
        <form action={regenerateApiKey} className="mt-3">
          <ConfirmButton message="Generate a new key? The current one stops working immediately." className="text-sm font-semibold text-brand hover:underline">
            Regenerate key
          </ConfirmButton>
        </form>
      </Card>

      <Card title="Delete account">
        <form action={deleteAccount} className="space-y-3">
          <p className="text-sm text-slate-600">Permanently deletes your account, QR codes and scan history. Dynamic codes stop working.</p>
          <input name="password" type="password" required placeholder="Confirm with your password" className={input} />
          <ConfirmButton message="Delete your account permanently? This cannot be undone." className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700">
            Delete account
          </ConfirmButton>
        </form>
      </Card>
    </div>
  );
}
