"use client";

import { motion, useReducedMotion } from "framer-motion";

export function SectionDivider() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative w-full h-px overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-border to-transparent" />
      {!prefersReducedMotion && (
        <motion.svg
          className="absolute inset-0 w-full h-4 -top-1.5 opacity-30"
          viewBox="0 0 400 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.3 }}
          viewport={{ once: true }}
        >
          <motion.path
            d="M0 8 L40 8 L50 4 L60 12 L70 8 L400 8"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeDasharray="8 4"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        </motion.svg>
      )}
    </div>
  );
}
