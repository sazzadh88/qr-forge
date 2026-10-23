import Link from "next/link";
import { AuthCard, btnCls, inputCls } from "@/components/site";
import { login } from "@/lib/actions";

export const metadata = { title: "Log in · QRForge" };

export default async function Login({ searchParams }: PageProps<"/login">) {
  const { error, next } = await searchParams;
  return (
    <AuthCard title="Welcome back">
      <form action={login} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={typeof next === "string" ? next : ""} />
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <label className="block text-sm font-medium">
          Email
          <input name="email" type="email" required autoComplete="email" className={inputCls} />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input name="password" type="password" required autoComplete="current-password" className={inputCls} />
        </label>
        <button className={`${btnCls} w-full`}>Log in</button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        No account?{" "}
        <Link href={`/register${typeof next === "string" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-brand">
          Register
        </Link>
      </p>
    </AuthCard>
  );
}
