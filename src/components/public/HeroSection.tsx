"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative container mx-auto px-4 py-24 md:py-32 text-center">
      <motion.h1
        className="text-4xl md:text-6xl font-mono font-bold tracking-tight text-foreground max-w-3xl mx-auto"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        Vibe Coding <span className="text-primary">Classes</span>
      </motion.h1>
      <motion.p
        className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        Build digital health tools and medical web applications. Explore healthcare innovation through hands-on development — from idea to prototype.
      </motion.p>
      <motion.div
        className="mt-10 flex justify-center"
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Button
          asChild
          size="lg"
          className="font-mono bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
        >
          <Link href="/sessions">Browse Dates & Join</Link>
        </Button>
      </motion.div>
    </section>
  );
}
