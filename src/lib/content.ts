export const FAQ: { group: string; items: [string, string][] }[] = [
  {
    group: "Basics",
    items: [
      ["Is QRForge free?", "Yes. Static codes from the home page need no account. With a free account you also get dynamic codes, hosted pages and scan statistics."],
      ["What's the difference between static and dynamic QR codes?", "A static code stores its content directly in the pattern and can never change. A dynamic code points to a short link on our server, so you can edit where it goes, pause it and count scans without reprinting."],
      ["Will my QR codes expire?", "No. Static codes work forever. Dynamic codes keep working as long as your account exists and the code isn't paused."],
      ["Can I use the codes commercially?", "Yes, on packaging, flyers, menus, business cards or anything else."],
    ],
  },
  {
    group: "Design & creation",
    items: [
      ["Can I add my logo?", "Yes. Upload a PNG, JPG or WebP in the Logo tab. Error correction is raised to High automatically so the code stays scannable."],
      ["Which error correction level should I use?", "Medium is fine for screens and clean prints. Use High when adding a logo or printing on surfaces that may get scratched."],
      ["Can I reuse a design?", "Save any design as a template from the editor, then apply it to new codes or bulk batches."],
      ["Can I create many codes at once?", "Yes. Bulk creation turns a list or CSV of “name,url” rows into dynamic codes in one folder."],
    ],
  },
  {
    group: "Scanning & printing",
    items: [
      ["Why can't I scan my code?", "Keep strong contrast (dark on light), leave a quiet zone around it, and avoid printing it smaller than about 2 × 2 cm."],
      ["Which format should I download?", "PNG or JPG for screens and documents, SVG for professional print since it scales without losing quality."],
      ["What do scan statistics include?", "Every scan of a dynamic code records the time, device type, operating system and browser. Unique scans are counted per device."],
    ],
  },
];
