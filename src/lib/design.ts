import type { DotType, CornerSquareType, ErrorCorrectionLevel } from "qr-code-styling";

export const DOTS: DotType[] = ["square", "rounded", "dots", "classy", "classy-rounded", "extra-rounded"];
export const CORNERS: CornerSquareType[] = ["square", "extra-rounded", "dot"];
export const FRAMES = ["none", "bottom", "top", "badge"] as const;
export const LEVELS: [ErrorCorrectionLevel, string][] = [
  ["L", "Low · 7%"],
  ["M", "Medium · 15%"],
  ["Q", "Quartile · 25%"],
  ["H", "High · 30%"],
];

export type Frame = (typeof FRAMES)[number];

export type Design = {
  frame: Frame;
  label: string;
  dots: DotType;
  corners: CornerSquareType;
  color: string;
  bg: string;
  level: ErrorCorrectionLevel;
  logo?: string;
};

export const DEFAULT_DESIGN: Design = {
  frame: "none",
  label: "Scan me",
  dots: "square",
  corners: "square",
  color: "#111827",
  bg: "#ffffff",
  level: "M",
};

const QR = 600;
const PAD = 40;
const BAR = 110;

// Browser-only: renders the styled QR and draws it inside the chosen frame.
export async function renderQr(data: string, d: Design) {
  const { default: QRCodeStyling } = await import("qr-code-styling");
  const qr = new QRCodeStyling({
    width: QR,
    height: QR,
    margin: 0,
    data,
    image: d.logo,
    qrOptions: { errorCorrectionLevel: d.level },
    dotsOptions: { type: d.dots, color: d.color },
    cornersSquareOptions: { type: d.corners, color: d.color },
    cornersDotOptions: { color: d.color },
    backgroundOptions: { color: d.bg },
    imageOptions: { margin: 8, imageSize: 0.35, hideBackgroundDots: true },
  });
  const img = await createImageBitmap((await qr.getRawData("png")) as Blob);

  const bar = d.frame === "none" ? 0 : BAR;
  const W = QR + PAD * 2;
  const H = QR + PAD * 2 + bar;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const x = c.getContext("2d")!;
  x.fillStyle = d.frame === "none" ? d.bg : "#fff";
  x.fillRect(0, 0, W, H);
  const qrY = d.frame === "top" ? PAD + bar : PAD;
  let textY = 0;
  x.fillStyle = d.color;
  if (d.frame === "badge") {
    x.lineWidth = 16;
    x.strokeStyle = d.color;
    x.beginPath();
    x.roundRect(8, 8, W - 16, QR + PAD * 2 - 16, 40);
    x.stroke();
    x.beginPath();
    x.roundRect(W / 2 - 200, QR + PAD * 2 + 15, 400, 80, 40);
    x.fill();
    textY = QR + PAD * 2 + 55;
  } else if (d.frame !== "none") {
    x.beginPath();
    x.roundRect(0, 0, W, H, 40);
    x.fill();
    x.fillStyle = "#fff";
    x.beginPath();
    x.roundRect(PAD / 2, qrY - PAD / 2, QR + PAD, QR + PAD, 24);
    x.fill();
    textY = d.frame === "top" ? (bar + PAD / 2) / 2 : H - (bar + PAD / 2) / 2;
  }
  x.drawImage(img, PAD, qrY, QR, QR);
  if (d.frame !== "none") {
    x.fillStyle = "#fff";
    x.font = "700 52px system-ui, sans-serif";
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillText(d.label.toUpperCase(), W / 2, textY, W - 80);
  }
  return { qr, canvas: c };
}
