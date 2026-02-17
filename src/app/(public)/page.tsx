import { HeroSection } from "@/components/public/HeroSection";
import { AboutSection } from "@/components/public/AboutSection";
import { GlowGridCanvas } from "@/components/public/GlowGridCanvas";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden bg-black">
      {/* Hero area: black-first look (no text/symbol background) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-black" />
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% -20%, oklch(0.72 0.17 195 / 0.10), transparent),
              radial-gradient(ellipse 60% 40% at 82% 50%, oklch(0.65 0.15 165 / 0.05), transparent),
              radial-gradient(ellipse 50% 30% at 20% 82%, oklch(0.7 0.15 280 / 0.04), transparent)
            `,
          }}
        />
        <GlowGridCanvas />
      </div>
      <HeroSection />
      <AboutSection />
    </div>
  );
}
