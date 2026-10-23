export type Field = {
  k: string;
  label: string;
  placeholder?: string;
  kind?: "text" | "textarea" | "select" | "date" | "file" | "files" | "repeat";
  options?: string[];
  accept?: string;
  fields?: Field[];
  required?: boolean;
};

type TypeDef = { label: string; hint: string; static?: true; fields: Field[] };

const t = (k: string, label: string, placeholder?: string, required?: boolean): Field => ({ k, label, placeholder, required });
const area = (k: string, label: string, placeholder?: string): Field => ({ k, label, placeholder, kind: "textarea" });
const file = (k: string, label: string, accept: string, required?: boolean): Field => ({ k, label, accept, kind: "file", required });
const IMG = "image/png,image/jpeg,image/gif,image/webp";

// static: the content itself is encoded in the QR. Everything else is dynamic:
// the QR encodes /q/<slug>, which logs the scan and redirects or shows a hosted page.
export const TYPES = {
  url: { label: "Website", hint: "Open a link", fields: [t("url", "Website URL", "e.g. https://example.com", true)] },
  text: { label: "Text", hint: "Show plain text", static: true, fields: [{ ...area("text", "Your text", "Type anything…"), required: true }] },
  pdf: { label: "PDF", hint: "Show a PDF", fields: [t("title", "Title", "Product brochure"), area("description", "Description"), file("file", "PDF file", "application/pdf", true)] },
  images: {
    label: "Images",
    hint: "Show an image gallery",
    fields: [t("title", "Gallery title", "Summer collection"), area("description", "Description"), { k: "images", label: "Images", kind: "files", accept: IMG, required: true }],
  },
  vcardplus: {
    label: "vCard Plus",
    hint: "Digital business card",
    fields: [
      file("photo", "Photo", IMG),
      t("first", "First name", "Jane", true),
      t("last", "Last name", "Doe"),
      t("title", "Job title", "Product designer"),
      t("org", "Company", "Acme Inc."),
      t("phone", "Phone", "+1 555 123 4567"),
      t("email", "Email", "jane@example.com"),
      t("site", "Website", "https://example.com"),
      t("address", "Address", "1 Main St, Springfield"),
      area("summary", "About me"),
    ],
  },
  video: {
    label: "Video",
    hint: "Play a video",
    fields: [t("title", "Title"), area("description", "Description"), t("youtube", "YouTube link", "https://youtu.be/…"), file("file", "…or upload a video", "video/mp4,video/webm,video/quicktime")],
  },
  wifi: {
    label: "Wi-Fi",
    hint: "Join a network",
    static: true,
    fields: [t("ssid", "Network name (SSID)", "MyHomeWiFi", true), t("password", "Password", "••••••••"), { k: "enc", label: "Security", kind: "select", options: ["WPA", "WEP", "nopass"] }],
  },
  vcard: {
    label: "vCard",
    hint: "Share a contact",
    static: true,
    fields: [t("first", "First name", "Jane", true), t("last", "Last name", "Doe"), t("phone", "Phone", "+1 555 123 4567"), t("email", "Email", "jane@example.com"), t("org", "Company", "Acme Inc."), t("site", "Website", "https://example.com")],
  },
  email: { label: "Email", hint: "Draft an email", static: true, fields: [t("to", "Recipient", "hello@example.com", true), t("subject", "Subject", "Hi there"), area("body", "Message")] },
  sms: { label: "SMS", hint: "Send a text", static: true, fields: [t("phone", "Phone number", "+1 555 123 4567", true), area("message", "Message")] },
  whatsapp: { label: "WhatsApp", hint: "Start a chat", static: true, fields: [t("phone", "Phone number (with country code)", "+1 555 123 4567", true), area("message", "Message")] },
  links: {
    label: "List of links",
    hint: "Group several links",
    fields: [
      file("avatar", "Avatar", IMG),
      t("title", "Title", "@janedoe", true),
      area("description", "Description"),
      { k: "links", label: "Links", kind: "repeat", fields: [t("label", "Label", "My portfolio"), t("url", "URL", "https://…")] },
    ],
  },
  business: {
    label: "Business",
    hint: "Share your business info",
    fields: [
      file("logo", "Logo", IMG),
      t("name", "Business name", "Blue Bottle Café", true),
      t("tagline", "Tagline", "Coffee roasted daily"),
      area("description", "About"),
      t("phone", "Phone"),
      t("email", "Email"),
      t("site", "Website"),
      t("address", "Address"),
      area("hours", "Opening hours", "Mon–Fri 8:00–18:00"),
    ],
  },
  menu: {
    label: "Menu",
    hint: "Show your restaurant menu",
    fields: [
      file("cover", "Cover image", IMG),
      t("name", "Restaurant name", "Trattoria Roma", true),
      area("description", "Description"),
      { k: "items", label: "Dishes", kind: "repeat", fields: [t("name", "Dish"), t("description", "Description"), t("price", "Price")] },
    ],
  },
  coupon: {
    label: "Coupon",
    hint: "Share a discount",
    fields: [
      file("image", "Image", IMG),
      t("company", "Company", "Acme Store"),
      t("title", "Offer", "20% off your next order", true),
      area("description", "Description"),
      t("code", "Coupon code", "SAVE20"),
      { k: "until", label: "Valid until", kind: "date" },
      t("url", "Redeem link", "https://…"),
      area("terms", "Terms & conditions"),
    ],
  },
  mp3: {
    label: "MP3",
    hint: "Play an audio file",
    fields: [file("cover", "Cover art", IMG), t("title", "Track title", "Episode 1", true), t("artist", "Artist"), file("file", "Audio file", "audio/mpeg,audio/wav,audio/ogg,audio/mp4", true)],
  },
  apps: {
    label: "Apps",
    hint: "Send to the right app store",
    fields: [file("logo", "App icon", IMG), t("name", "App name", "My App", true), area("description", "Description"), t("ios", "App Store link"), t("android", "Google Play link"), t("web", "Website")],
  },
  product: {
    label: "Product",
    hint: "Show product details",
    fields: [
      file("image", "Product image", IMG),
      t("brand", "Brand"),
      t("name", "Product name", "Trail Runner 2", true),
      t("price", "Price", "$129"),
      area("description", "Description"),
      t("url", "Buy link", "https://…"),
      { k: "specs", label: "Specifications", kind: "repeat", fields: [t("label", "Property", "Weight"), t("value", "Value", "240 g")] },
    ],
  },
  landing: {
    label: "Landing page",
    hint: "Build a simple page",
    fields: [file("cover", "Cover image", IMG), t("title", "Headline", "Welcome!", true), area("body", "Text"), t("button", "Button label", "Learn more"), t("url", "Button link", "https://…")],
  },
} satisfies Record<string, TypeDef>;

export type QrType = keyof typeof TYPES;
export const TYPE_KEYS = Object.keys(TYPES) as QrType[];
export const isType = (s: unknown): s is QrType => typeof s === "string" && s in TYPES;
export const isStatic = (type: QrType) => "static" in TYPES[type];

// Accepts http(s)/mailto/tel; prefixes bare hosts with https://; rejects other schemes (javascript:, data:…).
export function safeHref(u: unknown): string | null {
  const s = typeof u === "string" ? u.trim() : "";
  if (!s) return null;
  if (/^(https?:|mailto:|tel:)/i.test(s)) return s;
  if (/^[a-z][a-z\d+.-]*:/i.test(s)) return null;
  return `https://${s}`;
}

// WIFI: and vCard both use backslash escaping; WIFI also escapes ':' and '"'.
const wifiEsc = (s: string) => s.replace(/([\\;,:"])/g, "\\$1");
const vEsc = (s: string) => s.replace(/([\\;,])/g, "\\$1").replace(/\n/g, "\\n");
const phone = (s: string) => s.replace(/[^\d+]/g, "");

export function encode(type: QrType, f: Record<string, unknown>): string {
  const v = (k: string) => (typeof f[k] === "string" ? (f[k] as string).trim() : "");
  switch (type) {
    case "url": {
      const u = v("url");
      return !u ? "" : /^[a-z][a-z\d+.-]*:/i.test(u) ? u : `https://${u}`;
    }
    case "text":
      return v("text");
    case "email": {
      if (!v("to")) return "";
      const q = (["subject", "body"] as const).filter(v).map((k) => `${k}=${encodeURIComponent(v(k))}`).join("&");
      return `mailto:${v("to")}${q ? `?${q}` : ""}`;
    }
    case "sms":
      return v("phone") ? `SMSTO:${phone(v("phone"))}:${v("message")}` : "";
    case "whatsapp": {
      const n = phone(v("phone")).replace("+", "");
      return n ? `https://wa.me/${n}${v("message") ? `?text=${encodeURIComponent(v("message"))}` : ""}` : "";
    }
    case "wifi": {
      if (!v("ssid")) return "";
      const enc = v("enc") || "WPA";
      return `WIFI:T:${enc};S:${wifiEsc(v("ssid"))};${enc === "nopass" ? "" : `P:${wifiEsc(v("password"))};`};`;
    }
    case "vcard":
    case "vcardplus": {
      if (!v("first") && !v("last")) return "";
      return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${vEsc(v("last"))};${vEsc(v("first"))}`,
        `FN:${vEsc(`${v("first")} ${v("last")}`.trim())}`,
        v("org") && `ORG:${vEsc(v("org"))}`,
        v("title") && `TITLE:${vEsc(v("title"))}`,
        v("phone") && `TEL:${phone(v("phone"))}`,
        v("email") && `EMAIL:${v("email")}`,
        v("site") && `URL:${v("site")}`,
        v("address") && `ADR:;;${vEsc(v("address"))};;;;`,
        "END:VCARD",
      ]
        .filter(Boolean)
        .join("\n");
    }
    default:
      return "";
  }
}

// What the printed QR actually encodes.
export function qrData(qr: { type: QrType; slug: string; content: Record<string, unknown> }, origin: string) {
  return isStatic(qr.type) ? encode(qr.type, qr.content) : `${origin}/q/${qr.slug}`;
}

// Returns the label of the first empty required field, if any.
export function missingField(type: QrType, content: Record<string, unknown>): string | null {
  for (const f of TYPES[type].fields as Field[]) {
    const val = content[f.k];
    if (f.required && (Array.isArray(val) ? val.length === 0 : !(typeof val === "string" && val.trim()))) return f.label;
  }
  if (type === "video" && !content.youtube && !content.file) return "YouTube link or video file";
  return null;
}
