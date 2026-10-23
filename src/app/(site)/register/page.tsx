import Link from "next/link";
import { AuthCard, btnCls, inputCls } from "@/components/site";
import { register } from "@/lib/actions";

export const metadata = { title: "Register · QRForge" };

export default async function Register({ searchParams }: PageProps<"/register">) {
  const { error, next } = await searchParams;
  return (
    <AuthCard title="Create your free account">
      <p className="mt-1 text-sm text-slate-600">Dynamic codes, hosted pages and analytics. No credit card.</p>
      <form action={register} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={typeof next === "string" ? next : ""} />
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <label className="block text-sm font-medium">
          Name
          <input name="name" required autoComplete="name" className={inputCls} />
        </label>
        <label className="block text-sm font-medium">
          Email
          <input name="email" type="email" required autoComplete="email" className={inputCls} />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input name="password" type="password" required minLength={8} autoComplete="new-password" className={inputCls} />
          <span className="mt-1 block text-xs font-normal text-slate-500">At least 8 characters.</span>
        </label>
        <button className={`${btnCls} w-full`}>Create account</button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        Already registered?{" "}
        <Link href="/login" className="font-semibold text-brand">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
