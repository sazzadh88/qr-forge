/* eslint-disable @next/next/no-img-element -- user uploads of unknown size */
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getQrBySlug } from "@/lib/db";
import { unlockToken } from "@/lib/auth";
import { unlockQr } from "@/lib/actions";
import { encode, safeHref, type QrType } from "@/lib/payload";

type C = Record<string, unknown>;
const s = (c: C, k: string) => (typeof c[k] === "string" ? (c[k] as string).trim() : "");
// Uploaded files only: content is user JSON, so never trust it as an arbitrary URL (javascript: in an iframe = XSS).
const FILE = /^\/files\/[a-f0-9]{32}\.[a-z0-9]+$/;
const f = (c: C, k: string) => (FILE.test(s(c, k)) ? s(c, k) : "");
const rows = (c: C, k: string) => (Array.isArray(c[k]) ? (c[k] as Record<string, string>[]) : []);

export async function generateMetadata({ params }: PageProps<"/p/[slug]">) {
  const qr = getQrBySlug((await params).slug);
  // Protected or paused pages must not leak their content through the <title>.
  const c = qr && !qr.password && !qr.paused ? qr.content : {};
  return { title: s(c, "title") || s(c, "name") || "QRForge", robots: { index: false } };
}

export default async function Hosted({ params, searchParams }: PageProps<"/p/[slug]">) {
  const { slug } = await params;
  const { error } = await searchParams;
  const qr = getQrBySlug(slug);
  if (!qr) notFound();
  const color = typeof qr.content.color === "string" ? qr.content.color : "#1f5bff";

  if (qr.paused) return <Shell color={color}><Notice title="This QR code is inactive" text="The owner has paused it. Please check back later." /></Shell>;

  if (qr.password && (await cookies()).get(`u_${qr.id}`)?.value !== unlockToken(qr.id, qr.password)) {
    return (
      <Shell color={color}>
        <form action={unlockQr} className="space-y-4">
          <h1 className="text-xl font-bold">Protected content</h1>
          <p className="text-sm text-slate-600">Enter the password to continue.</p>
          <input type="hidden" name="slug" value={slug} />
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{String(error)}</p>}
          <input name="password" type="password" required autoFocus className="w-full rounded-lg border border-ink/20 px-3 py-2.5" />
          <Button color={color} as="button">Unlock</Button>
        </form>
      </Shell>
    );
  }

  if (qr.type === "url") redirect(safeHref(qr.content.url) ?? "/");
  return (
    <Shell color={color}>
      <Body type={qr.type} c={qr.content} color={color} />
    </Shell>
  );
}

function Shell({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      <main className="mx-auto max-w-md px-4 py-10">
        <div className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-xl shadow-ink/10">
          <div className="h-2" style={{ background: color }} />
          <div className="p-6">{children}</div>
        </div>
        <p className="mt-6 text-center text-xs text-ink-600/70">
          Served by{" "}
          <Link href="/" className="font-semibold">
            QRForge
          </Link>
        </p>
      </main>
    </div>
  );
}

function Notice({ title, text }: { title: string; text: string }) {
  return (
    <div className="py-8 text-center">
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-slate-600">{text}</p>
    </div>
  );
}

function Button({ href, color, children, as, outline }: { href?: string | null; color: string; children: React.ReactNode; as?: "button"; outline?: boolean }) {
  const style = outline ? { borderColor: color, color } : { background: color };
  const cls = `block w-full rounded-full py-3 text-center font-semibold ${outline ? "border-2" : "text-white"}`;
  if (as === "button") return <button className={cls} style={style}>{children}</button>;
  if (!href) return null;
  return (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className={cls} style={style}>
      {children}
    </a>
  );
}

function Heading({ title, text, img, round }: { title: string; text?: string; img?: string; round?: boolean }) {
  return (
    <div className="text-center">
      {img && <img src={img} alt="" className={`mx-auto mb-4 object-cover ${round ? "size-28 rounded-full" : "max-h-48 w-full rounded-lg"}`} />}
      {title && <h1 className="text-2xl font-bold">{title}</h1>}
      {text && <p className="mt-2 whitespace-pre-line text-slate-600">{text}</p>}
    </div>
  );
}

function Row({ label, value, href }: { label: string; value: string; href?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-3 text-sm last:border-0">
      <span className="text-slate-500">{label}</span>
      {href ? (
        <a href={href} className="text-right font-medium break-all">
          {value}
        </a>
      ) : (
        <span className="text-right font-medium whitespace-pre-line">{value}</span>
      )}
    </div>
  );
}

const ytId = (u: string) => /(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/.exec(u)?.[1];
const maps = (a: string) => (a ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a)}` : null);

function Body({ type, c, color }: { type: QrType; c: C; color: string }) {
  switch (type) {
    case "pdf":
      return (
        <div className="space-y-5">
          <Heading title={s(c, "title") || "Document"} text={s(c, "description")} />
          <iframe src={f(c, "file")} title="PDF" className="h-[60vh] w-full rounded-xl border border-slate-200" />
          <Button href={f(c, "file")} color={color}>Open PDF</Button>
        </div>
      );
    case "images":
      return (
        <div className="space-y-5">
          <Heading title={s(c, "title")} text={s(c, "description")} />
          <div className="grid grid-cols-2 gap-2">
            {(Array.isArray(c.images) ? (c.images as unknown[]) : []).filter((u): u is string => typeof u === "string" && FILE.test(u)).map((u) => (
              <a key={u} href={u} target="_blank">
                <img src={u} alt="" className="aspect-square w-full rounded-xl object-cover" />
              </a>
            ))}
          </div>
        </div>
      );
    case "video": {
      const id = ytId(s(c, "youtube"));
      return (
        <div className="space-y-5">
          <Heading title={s(c, "title")} text={s(c, "description")} />
          {id ? (
            <iframe src={`https://www.youtube-nocookie.com/embed/${id}`} title="Video" allowFullScreen className="aspect-video w-full rounded-xl" />
          ) : f(c, "file") ? (
            <video src={f(c, "file")} controls playsInline className="w-full rounded-xl" />
          ) : (
            <Button href={safeHref(s(c, "youtube"))} color={color}>Watch video</Button>
          )}
        </div>
      );
    }
    case "mp3":
      return (
        <div className="space-y-5">
          <Heading title={s(c, "title")} text={s(c, "artist")} img={f(c, "cover")} />
          <audio src={f(c, "file")} controls className="w-full" />
        </div>
      );
    case "vcardplus": {
      const vcf = `data:text/vcard;charset=utf-8,${encodeURIComponent(encode("vcardplus", c))}`;
      const name = `${s(c, "first")} ${s(c, "last")}`.trim();
      return (
        <div className="space-y-5">
          <Heading title={name} text={[s(c, "title"), s(c, "org")].filter(Boolean).join(" · ")} img={f(c, "photo")} round />
          <div className="grid grid-cols-3 gap-2 text-sm font-medium">
            {[
              ["Call", s(c, "phone") && `tel:${s(c, "phone")}`],
              ["Email", s(c, "email") && `mailto:${s(c, "email")}`],
              ["Website", safeHref(s(c, "site"))],
            ].map(([l, h]) =>
              h ? (
                <a key={l} href={h} className="rounded-xl bg-slate-50 py-3 text-center" style={{ color }}>
                  {l}
                </a>
              ) : null,
            )}
          </div>
          {s(c, "summary") && <p className="whitespace-pre-line text-sm text-slate-600">{s(c, "summary")}</p>}
          <div>
            <Row label="Phone" value={s(c, "phone")} href={`tel:${s(c, "phone")}`} />
            <Row label="Email" value={s(c, "email")} href={`mailto:${s(c, "email")}`} />
            <Row label="Address" value={s(c, "address")} href={maps(s(c, "address"))} />
          </div>
          <a href={vcf} download={`${name || "contact"}.vcf`} className="block w-full rounded-full py-3 text-center font-semibold text-white" style={{ background: color }}>
            Save contact
          </a>
        </div>
      );
    }
    case "links":
      return (
        <div className="space-y-5">
          <Heading title={s(c, "title")} text={s(c, "description")} img={f(c, "avatar")} round />
          <div className="space-y-3">
            {rows(c, "links").map((l, i) => (
              <Button key={i} href={safeHref(l.url)} color={color} outline>
                {l.label || l.url}
              </Button>
            ))}
          </div>
        </div>
      );
    case "business":
      return (
        <div className="space-y-5">
          <Heading title={s(c, "name")} text={s(c, "tagline")} img={f(c, "logo")} round />
          {s(c, "description") && <p className="whitespace-pre-line text-sm text-slate-600">{s(c, "description")}</p>}
          <div>
            <Row label="Phone" value={s(c, "phone")} href={`tel:${s(c, "phone")}`} />
            <Row label="Email" value={s(c, "email")} href={`mailto:${s(c, "email")}`} />
            <Row label="Website" value={s(c, "site")} href={safeHref(s(c, "site"))} />
            <Row label="Address" value={s(c, "address")} href={maps(s(c, "address"))} />
            <Row label="Hours" value={s(c, "hours")} />
          </div>
        </div>
      );
    case "menu":
      return (
        <div className="space-y-5">
          <Heading title={s(c, "name")} text={s(c, "description")} img={f(c, "cover")} />
          <ul className="divide-y divide-slate-100">
            {rows(c, "items").map((d, i) => (
              <li key={i} className="flex justify-between gap-4 py-3">
                <div>
                  <p className="font-semibold">{d.name}</p>
                  {d.description && <p className="text-sm text-slate-500">{d.description}</p>}
                </div>
                <span className="font-semibold whitespace-nowrap" style={{ color }}>
                  {d.price}
                </span>
              </li>
            ))}
          </ul>
        </div>
      );
    case "coupon":
      return (
        <div className="space-y-5 text-center">
          {f(c, "image") && <img src={f(c, "image")} alt="" className="max-h-48 w-full rounded-lg object-cover" />}
          <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase">{s(c, "company")}</p>
          <h1 className="text-3xl font-extrabold" style={{ color }}>
            {s(c, "title")}
          </h1>
          {s(c, "description") && <p className="text-slate-600">{s(c, "description")}</p>}
          {s(c, "code") && (
            <div className="rounded-xl border-2 border-dashed py-4 font-mono text-2xl font-bold tracking-widest" style={{ borderColor: color }}>
              {s(c, "code")}
            </div>
          )}
          {s(c, "until") && <p className="text-sm text-slate-500">Valid until {s(c, "until")}</p>}
          <Button href={safeHref(s(c, "url"))} color={color}>Redeem now</Button>
          {s(c, "terms") && <p className="whitespace-pre-line text-left text-xs text-slate-400">{s(c, "terms")}</p>}
        </div>
      );
    case "apps":
      return (
        <div className="space-y-4">
          <Heading title={s(c, "name")} text={s(c, "description")} img={f(c, "logo")} round />
          <Button href={safeHref(s(c, "ios"))} color={color}>Download on the App Store</Button>
          <Button href={safeHref(s(c, "android"))} color={color}>Get it on Google Play</Button>
          <Button href={safeHref(s(c, "web"))} color={color} outline>Visit website</Button>
        </div>
      );
    case "product":
      return (
        <div className="space-y-5">
          {f(c, "image") && <img src={f(c, "image")} alt="" className="w-full rounded-lg object-cover" />}
          <div>
            <p className="text-sm text-slate-500">{s(c, "brand")}</p>
            <h1 className="text-2xl font-bold">{s(c, "name")}</h1>
            <p className="mt-1 text-xl font-semibold" style={{ color }}>
              {s(c, "price")}
            </p>
          </div>
          {s(c, "description") && <p className="whitespace-pre-line text-slate-600">{s(c, "description")}</p>}
          <div>
            {rows(c, "specs").map((r, i) => (
              <Row key={i} label={r.label} value={r.value} />
            ))}
          </div>
          <Button href={safeHref(s(c, "url"))} color={color}>Buy now</Button>
        </div>
      );
    case "landing":
      return (
        <div className="space-y-5">
          <Heading title={s(c, "title")} text={s(c, "body")} img={f(c, "cover")} />
          <Button href={safeHref(s(c, "url"))} color={color}>{s(c, "button") || "Learn more"}</Button>
        </div>
      );
    default:
      // Static types never route here; show their encoded text as a fallback.
      return <Notice title="QR content" text={encode(type, c)} />;
  }
}
