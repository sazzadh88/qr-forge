import type { QrType } from "@/lib/payload";

const PATHS: Record<QrType, string> = {
  url: "M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c2.5 2.7 3.5 5.7 3.5 9s-1 6.3-3.5 9c-2.5-2.7-3.5-5.7-3.5-9s1-6.3 3.5-9z",
  text: "M6 3h9l4 4v14H6zM9 10h7M9 14h7M9 18h4",
  pdf: "M6 3h9l4 4v14H6zM15 3v4h4M9 13h1.5a1.5 1.5 0 010 3H9v-3zm0 3v2M14 13v5M14 13h2M14 15.5h1.5",
  images: "M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M15.5 9.5h.01",
  vcardplus: "M4 3h16v18H4zM12 11a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM7.5 17c.8-2.2 2.5-3.5 4.5-3.5s3.7 1.3 4.5 3.5",
  video: "M3 5h18v14H3zM10 9l5 3-5 3z",
  wifi: "M2 9a15 15 0 0120 0M5 12.5a10 10 0 0114 0M8.5 16a5 5 0 017 0M12 19.5h.01",
  vcard: "M3 5h18v14H3zM9 11a2 2 0 100-4 2 2 0 000 4zM5.5 16c.6-2 2-3 3.5-3s2.9 1 3.5 3M14 9h4M14 13h4",
  email: "M3 5h18v14H3zM3 6l9 7 9-7",
  sms: "M4 4h16v12H8l-4 4zM8 9h8M8 12h5",
  whatsapp: "M4 20l1.3-4A8 8 0 1112 20a8 8 0 01-3.8-1zM9 9c0 3 3 6 6 6l1-1.5-2-1-1 1c-1-.5-2-1.5-2.5-2.5l1-1-1-2z",
  links: "M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1",
  business: "M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6M9 11h.01M15 11h.01",
  menu: "M7 3v8M5 3v4a2 2 0 004 0V3M7 11v10M16 3c-2 1-3 4-3 7h3v11",
  coupon: "M3 7a2 2 0 002-2h14a2 2 0 002 2v3a2 2 0 000 4v3a2 2 0 00-2 2H5a2 2 0 00-2-2v-3a2 2 0 000-4zM10 9l4 6M10 9h.01M14 15h.01",
  mp3: "M9 18V5l11-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zM20 16a3 3 0 11-6 0 3 3 0 016 0z",
  apps: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 17h6M17 14v6",
  product: "M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10",
  landing: "M3 4h18v16H3zM3 8h18M7 12h6M7 16h10",
};

export function TypeIcon({ type, className = "size-5" }: { type: QrType; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={PATHS[type]} />
    </svg>
  );
}

export function Logo() {
  return (
    <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
      <rect width="32" height="32" rx="8" className="fill-brand" />
      <path d="M8 8h7v7H8zM17 17h7v7h-7zM17 8h3v3h-3zM21 12h3v3h-3zM8 17h3v3H8zM12 21h3v3h-3z" fill="#fff" />
    </svg>
  );
}
