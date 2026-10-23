// Run: node src/lib/payload.check.ts
import assert from "node:assert/strict";
import { encode, missingField, qrData, safeHref } from "./payload.ts";

assert.equal(encode("url", { url: "example.com" }), "https://example.com");
assert.equal(encode("url", { url: "ftp://x.y" }), "ftp://x.y");
assert.equal(encode("url", { url: "  " }), "");
assert.equal(encode("email", { to: "a@b.c", body: "hi there" }), "mailto:a@b.c?body=hi%20there");
assert.equal(encode("sms", { phone: "+1 (555) 12", message: "yo" }), "SMSTO:+155512:yo");
assert.equal(encode("whatsapp", { phone: "+1 555", message: "a b" }), "https://wa.me/1555?text=a%20b");
assert.equal(encode("wifi", { ssid: 'my;net', password: 'p:"w', enc: "WPA" }), 'WIFI:T:WPA;S:my\\;net;P:p\\:\\"w;;');
assert.equal(encode("wifi", { ssid: "open", enc: "nopass" }), "WIFI:T:nopass;S:open;;");
assert.equal(
  encode("vcard", { first: "Jane", last: "Doe", org: "A, B" }),
  "BEGIN:VCARD\nVERSION:3.0\nN:Doe;Jane\nFN:Jane Doe\nORG:A\\, B\nEND:VCARD",
);
assert.equal(encode("vcard", {}), "");
assert.equal(safeHref("javascript:alert(1)"), null);
assert.equal(safeHref("example.com"), "https://example.com");
assert.equal(safeHref("tel:+1"), "tel:+1");
assert.equal(qrData({ type: "pdf", slug: "abc", content: {} }, "http://x"), "http://x/q/abc");
assert.equal(qrData({ type: "text", slug: "abc", content: { text: "hi" } }, "http://x"), "hi");
assert.equal(missingField("images", { images: [] }), "Images");
assert.equal(missingField("video", { title: "x" }), "YouTube link or video file");
assert.equal(missingField("url", { url: "a.com" }), null);
console.log("payload ok");
