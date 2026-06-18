export function resolveConsultationUrl(headersList: Headers) {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configuredSiteUrl) {
    return `${configuredSiteUrl}/consultation`;
  }

  const devLanUrl = process.env.NEXT_PUBLIC_DEV_LAN_URL?.replace(/\/$/, "");
  if (devLanUrl) {
    return `${devLanUrl}/consultation`;
  }

  const host = headersList.get("x-forwarded-host") ?? headersList.get("host") ?? "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") ?? "http";

  return `${protocol}://${host}/consultation`;
}

export function isLocalhostUrl(url: string) {
  try {
    const hostname = new URL(url).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return url.includes("localhost") || url.includes("127.0.0.1");
  }
}
