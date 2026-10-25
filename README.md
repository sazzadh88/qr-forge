# QRForge

Self-hosted QR code platform built with Next.js. Design branded codes, point them at a short link you can change later, host the content behind them, and track every scan. Every feature is included for every account; there are no plans or payments.

## Features

- **19 code types.** Static codes (website, text, Wi-Fi, vCard, email, SMS, WhatsApp) encode their data directly. Dynamic codes (PDF, images, video, MP3, vCard Plus, list of links, business, menu, coupon, apps, product, landing page) resolve through `/q/<slug>` and render a hosted mobile page.
- **Design.** Six dot patterns, three corner styles, colours, logo upload with automatic error-correction bump, and call-to-action frames. Save any design as a template.
- **Dashboard.** Folders, search and filters, pause/duplicate/delete, password-protected pages, bulk creation from CSV, scan analytics (totals, uniques, per day, OS, device, browser).
- **REST API.** Create, list, update and delete codes with a Bearer API key.
- **Exports.** PNG and JPG (with frame) and SVG.

## Requirements

- Node.js 22.13 or newer (uses the built-in `node:sqlite` module, which Node still marks experimental).
- npm.

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. The database and uploaded files are created under `data/` on first run; that folder is git-ignored.

### Production

```bash
npm run build
npm start
```

Set `PORT` and `HOSTNAME` as needed. Behind a reverse proxy, forward `x-forwarded-proto` so session cookies are marked `Secure` over HTTPS.

### Checks

```bash
npm run lint
npx tsc --noEmit
node src/lib/payload.check.ts   # QR payload encoder self-check
```

## Project layout

| Path | Purpose |
| --- | --- |
| `src/app/(site)` | Public pages: home with the anonymous generator, login, register, FAQ, API docs |
| `src/app/dashboard` | Authenticated app: codes, editor, analytics, templates, bulk, settings |
| `src/app/q/[slug]` | Scan endpoint: logs the scan and redirects or hands off to the hosted page |
| `src/app/p/[slug]` | Hosted pages for dynamic code types |
| `src/app/api/v1` | REST API |
| `src/lib/payload.ts` | Code type definitions and payload encoding |
| `src/lib/design.ts` | Design options and client-side rendering (`qr-code-styling`) |
| `src/lib/db.ts` | SQLite schema and queries |
| `src/lib/auth.ts` | Sessions, password hashing, API keys |

## Notes

- Storage is a single SQLite file plus a local uploads folder; suitable for one server. Swap for Postgres and object storage to scale out.
- Dynamic codes encode the origin they were created on. Create them on the public URL you intend to print.

## License

QRForge is open source under the [MIT License](LICENSE). You are free to use, modify and distribute it, including commercially, provided the copyright and license notice are kept. Contributions are welcome under the same terms.
