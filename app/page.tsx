import { NavBar } from "@/components/ui/nav-bar";
import { LandingPage } from "@/components/landing/landing-page";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface-1 text-text-1">
      <NavBar />
      <main>
        <LandingPage />
      </main>
    </div>
  );
}
