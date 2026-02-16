import { HeroSection } from "@/components/public/HeroSection";
import { SectionDivider } from "@/components/public/SectionDivider";
import { AboutSection } from "@/components/public/AboutSection";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero area: gradient mesh + subtle grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% -20%, oklch(0.72 0.17 195 / 0.15), transparent),
              radial-gradient(ellipse 60% 40% at 80% 50%, oklch(0.65 0.15 165 / 0.08), transparent),
              radial-gradient(ellipse 50% 30% at 20% 80%, oklch(0.7 0.15 280 / 0.06), transparent)
            `,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)
            `,
            backgroundSize: "32px 32px",
          }}
        />
      </div>
      <HeroSection />
      <SectionDivider />
      <AboutSection />
    </div>
  );
}
