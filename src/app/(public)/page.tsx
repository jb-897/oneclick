import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/public/HeroSection";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Subtle grid / terminal vibe background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />
      <HeroSection />
    </div>
  );
}
