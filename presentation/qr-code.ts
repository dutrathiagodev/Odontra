import QRCode from "qrcode";

export function createQrDataUrl(text: string, width = 240): Promise<string> {
  return QRCode.toDataURL(text, {
    width,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#071b3f", light: "#ffffff" },
  });
}
