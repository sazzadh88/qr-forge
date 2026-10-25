import Link from "next/link";

export const metadata = { title: "API · QRForge" };

const ENDPOINTS: [string, string, string, string][] = [
  ["GET", "/api/v1/qrcodes", "List your QR codes with their short links and scan counts.", `curl -H "Authorization: Bearer $KEY" $HOST/api/v1/qrcodes`],
  [
    "POST",
    "/api/v1/qrcodes",
    "Create a dynamic website QR code. Body: { name, url }.",
    `curl -X POST -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \\\n  -d '{"name":"Spring flyer","url":"https://example.com/spring"}' $HOST/api/v1/qrcodes`,
  ],
  ["GET", "/api/v1/qrcodes/:id", "One QR code with total and unique scans.", `curl -H "Authorization: Bearer $KEY" $HOST/api/v1/qrcodes/42`],
  ["PATCH", "/api/v1/qrcodes/:id", "Update name, url (website codes) or paused.", `curl -X PATCH -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \\\n  -d '{"paused":true}' $HOST/api/v1/qrcodes/42`],
  ["DELETE", "/api/v1/qrcodes/:id", "Delete a QR code and its scan history.", `curl -X DELETE -H "Authorization: Bearer $KEY" $HOST/api/v1/qrcodes/42`],
];

export default function ApiDocs() {
  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold">REST API</h1>
        <p className="mt-3 text-slate-600">
          Authenticate with the API key from{" "}
          <Link href="/dashboard/settings" className="font-semibold text-brand">
            Settings
          </Link>{" "}
          as a Bearer token. Requests and responses are JSON. Errors return <code className="rounded bg-slate-100 px-1">{`{ "error": "…" }`}</code> with a 4xx status.
        </p>
        <div className="mt-10 space-y-8">
          {ENDPOINTS.map(([m, path, desc, ex]) => (
            <div key={m + path} className="rounded-lg border border-slate-200 p-6">
              <p className="font-mono text-sm">
                <span className="mr-2 rounded bg-brand-50 px-2 py-1 font-semibold text-brand">{m}</span>
                {path}
              </p>
              <p className="mt-3 text-sm text-slate-600">{desc}</p>
              <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">{ex}</pre>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
