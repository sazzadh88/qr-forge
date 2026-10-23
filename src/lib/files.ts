// Allowed upload types. SVG/HTML are excluded on purpose: they could run script on our origin.
export const MIME: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  m4a: "audio/mp4",
};
export const EXT = Object.fromEntries(Object.entries(MIME).map(([e, m]) => [m, e]));
