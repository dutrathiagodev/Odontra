import { describe, expect, it } from "vitest";
import { choosePrintStrategy, isAppleMobile, type PrintEnvironment } from "@/presentation/pdf/print-strategy";

const UA = {
  iphoneSafari: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1",
  iphoneChrome: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.6778.73 Mobile/15E148 Safari/604.1",
  iphonePwa: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
  ipadAsMac: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15",
  macChrome: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  windows: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  android: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
};

const env = (patch: Partial<PrintEnvironment>): PrintEnvironment => ({
  userAgent: UA.windows,
  platform: "Win32",
  maxTouchPoints: 0,
  standalone: false,
  canShareFiles: false,
  ...patch,
});

describe("isAppleMobile", () => {
  it("reconhece iPhone e o iPad que se apresenta como Mac", () => {
    expect(isAppleMobile(env({ userAgent: UA.iphoneSafari, platform: "iPhone", maxTouchPoints: 5 }))).toBe(true);
    expect(isAppleMobile(env({ userAgent: UA.ipadAsMac, platform: "MacIntel", maxTouchPoints: 5 }))).toBe(true);
  });

  it("Mac de verdade não tem tela de toque", () => {
    expect(isAppleMobile(env({ userAgent: UA.macChrome, platform: "MacIntel", maxTouchPoints: 0 }))).toBe(false);
  });
});

describe("choosePrintStrategy", () => {
  it("computador continua com o diálogo de impressão", () => {
    expect(choosePrintStrategy(env({}))).toBe("iframe");
    expect(choosePrintStrategy(env({ userAgent: UA.macChrome, platform: "MacIntel", canShareFiles: true }))).toBe("iframe");
  });

  it("Safari do iPhone abre o PDF numa aba aberta no toque", () => {
    expect(choosePrintStrategy(env({ userAgent: UA.iphoneSafari, platform: "iPhone", maxTouchPoints: 5, canShareFiles: true }))).toBe("new-tab");
  });

  it("Safari do iPad (como Mac com toque) também", () => {
    expect(choosePrintStrategy(env({ userAgent: UA.ipadAsMac, platform: "MacIntel", maxTouchPoints: 5, canShareFiles: true }))).toBe("new-tab");
  });

  it("app instalado no iPhone usa a folha de compartilhamento", () => {
    expect(choosePrintStrategy(env({ userAgent: UA.iphonePwa, platform: "iPhone", maxTouchPoints: 5, standalone: true, canShareFiles: true }))).toBe("share");
    expect(choosePrintStrategy(env({ userAgent: UA.iphoneSafari, platform: "iPhone", maxTouchPoints: 5, standalone: true, canShareFiles: true }))).toBe("share");
  });

  it("Chrome no iPhone usa a folha de compartilhamento", () => {
    expect(choosePrintStrategy(env({ userAgent: UA.iphoneChrome, platform: "iPhone", maxTouchPoints: 5, canShareFiles: true }))).toBe("share");
  });

  it("sem compartilhamento de arquivo, abre o PDF numa aba", () => {
    expect(choosePrintStrategy(env({ userAgent: UA.iphonePwa, platform: "iPhone", maxTouchPoints: 5, standalone: true }))).toBe("new-tab");
    expect(choosePrintStrategy(env({ userAgent: UA.android, platform: "Linux armv8l", maxTouchPoints: 5 }))).toBe("new-tab");
  });

  it("Android com compartilhamento de arquivo usa a folha do sistema", () => {
    expect(choosePrintStrategy(env({ userAgent: UA.android, platform: "Linux armv8l", maxTouchPoints: 5, canShareFiles: true }))).toBe("share");
  });
});
