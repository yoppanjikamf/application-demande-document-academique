export function resolveConsultationUrl(headersList: Headers) {
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host") ?? "localhost:3000";
  const hostname = host.split(":")[0] ?? host;
  const onLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

  if (onLocalhost) {
    const devLanUrl = process.env.NEXT_PUBLIC_DEV_LAN_URL?.replace(/\/$/, "");
    if (devLanUrl) {
      return `${devLanUrl}/consultation`;
    }
  }

  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configuredSiteUrl) {
    return `${configuredSiteUrl}/consultation`;
  }

  const devLanUrl = process.env.NEXT_PUBLIC_DEV_LAN_URL?.replace(/\/$/, "");
  if (devLanUrl) {
    return `${devLanUrl}/consultation`;
  }

  const vercelUrl = process.env.VERCEL_URL?.replace(/\/$/, "");
  if (vercelUrl) {
    return `https://${vercelUrl}/consultation`;
  }

  const protocol = headersList.get("x-forwarded-proto") ?? "http";

  return `${protocol}://${host}/consultation`;
}

/** URL du QR : priorite au site public (Vercel) pour que le scan telephone fonctionne toujours. */
export function resolveConsultationQrUrl(fallback: string) {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configuredSiteUrl) {
    return `${configuredSiteUrl}/consultation`;
  }

  return resolveConsultationUrlClient(fallback);
}

/** URL utilisée côté client pour le QR (LAN en dev local, sinon prod ou origine courante). */
export function resolveConsultationUrlClient(fallback: string) {
  if (typeof window !== "undefined") {
    const { hostname, origin } = window.location;
    const onLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

    if (onLocalhost) {
      const devLanUrl = process.env.NEXT_PUBLIC_DEV_LAN_URL?.replace(/\/$/, "");
      if (devLanUrl) {
        return `${devLanUrl}/consultation`;
      }
    } else {
      return `${origin}/consultation`;
    }
  }

  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configuredSiteUrl) {
    return `${configuredSiteUrl}/consultation`;
  }

  const devLanUrl = process.env.NEXT_PUBLIC_DEV_LAN_URL?.replace(/\/$/, "");
  if (devLanUrl) {
    return `${devLanUrl}/consultation`;
  }

  return fallback;
}

export function isLocalhostUrl(url: string) {
  try {
    const hostname = new URL(url).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return url.includes("localhost") || url.includes("127.0.0.1");
  }
}
