import { headers } from "next/headers";

import { NavBar } from "@/components/ui/nav-bar";
import { LandingPage } from "@/components/landing/landing-page";

function resolveConsultationUrl(headersList: Headers) {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configuredSiteUrl) {
    return `${configuredSiteUrl}/consultation`;
  }

  const host = headersList.get("x-forwarded-host") ?? headersList.get("host") ?? "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") ?? "http";

  return `${protocol}://${host}/consultation`;
}

export default async function HomePage() {
  const headersList = await headers();
  const consultationUrl = resolveConsultationUrl(headersList);

  return (
    <div className="min-h-screen bg-surface-1 text-text-1">
      <NavBar />
      <main>
        <LandingPage consultationUrl={consultationUrl} />
      </main>
    </div>
  );
}
