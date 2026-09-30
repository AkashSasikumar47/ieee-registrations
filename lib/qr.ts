import QRCode from "qrcode";

export function qrSvg(text: string) {
  return QRCode.toString(text, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#0a0a0a", light: "#ffffff" },
  });
}

export function ticketUrl(origin: string, code: string) {
  return `${origin}/t/${code}`;
}
