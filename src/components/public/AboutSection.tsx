"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: i === 0 ? 0 : 0.1 },
  }),
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const gains = [
  "Understanding of web-based medical tools",
  "Foundations of digital product thinking",
  "Exposure to AI-driven healthcare concepts",
  "Practical project-based development",
  "A new way of thinking about medicine",
];

const whoFor = [
  "Medical students curious about digital health",
  "Future clinicians interested in AI",
  "Those who want to build instead of just consume technology",
];

export function AboutSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const prefersReducedMotion = useReducedMotion();

  return (
    <section ref={ref} className="relative w-full border-t border-border bg-card/20">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          variants={prefersReducedMotion ? undefined : container}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="max-w-3xl mx-auto space-y-10"
        >
          <motion.h2
            variants={prefersReducedMotion ? undefined : item}
            className="text-2xl md:text-3xl font-mono font-semibold text-foreground"
          >
            Why Vibe Coding?
          </motion.h2>
          <motion.div
            variants={prefersReducedMotion ? undefined : item}
            className="text-muted-foreground space-y-4 text-base md:text-lg leading-relaxed"
          >
            <p>
              Have you ever thought about building something that actually improves medicine?
              A tool for patients. A workflow for clinicians. A web application that solves a real healthcare problem.
            </p>
            <p>
              Vibe Coding introduces medical students to practical digital development — from idea to functional prototype.
              You will not just learn syntax. You will learn how to turn clinical problems into digital solutions.
            </p>
          </motion.div>

          <motion.div
            variants={prefersReducedMotion ? undefined : container}
            className="pt-6"
          >
            <motion.h3
              variants={prefersReducedMotion ? undefined : item}
              className="text-xl font-mono font-semibold text-foreground mb-4"
            >
              What You&apos;ll Gain
            </motion.h3>
            <ul className="grid gap-3 sm:grid-cols-2">
              {gains.map((text, i) => (
                <motion.li
                  key={text}
                  variants={prefersReducedMotion ? undefined : item}
                  className="rounded-lg border border-border bg-background/60 px-4 py-3 text-sm text-muted-foreground shadow-sm transition-shadow hover:shadow-md"
                >
                  {text}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            variants={prefersReducedMotion ? undefined : container}
            className="pt-4"
          >
            <motion.h3
              variants={prefersReducedMotion ? undefined : item}
              className="text-xl font-mono font-semibold text-foreground mb-4"
            >
              Who Is This For?
            </motion.h3>
            <ul className="space-y-3">
              {whoFor.map((text, i) => (
                <motion.li
                  key={text}
                  variants={prefersReducedMotion ? undefined : item}
                  className="rounded-lg border border-border bg-background/60 px-4 py-3 text-sm text-muted-foreground shadow-sm transition-shadow hover:shadow-md"
                >
                  {text}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
