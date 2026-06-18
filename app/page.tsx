import { headers } from "next/headers";

import { NavBar } from "@/components/ui/nav-bar";
import { LandingPage } from "@/components/landing/landing-page";
import { resolveConsultationUrl } from "@/lib/site-url";

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
