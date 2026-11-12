"use client";

import { useEffect, useState } from "react";
import { createQrDataUrl } from "../qr-code";
import { getSiteUrl } from "../site-url";

export function useSiteQrCode(width = 240) {
  const [qr, setQr] = useState({ dataUrl: "", url: "" });

  useEffect(() => {
    const url = getSiteUrl();
    if (!url) return;
    let cancelled = false;
    void createQrDataUrl(url, width).then((dataUrl) => {
      if (!cancelled) setQr({ dataUrl, url });
    });
    return () => {
      cancelled = true;
    };
  }, [width]);

  return qr;
}
