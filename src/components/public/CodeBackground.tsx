"use client";

import { useMemo } from "react";

const SNIPPETS = [
  "0x1A", "42", "0.7", "1024", "const", "=>", "{}", "()", "[]",
  "api", "fn", "id", "req", "res", "db", "log", "true", "null",
  "1", "2", "3", "5", "8", "13", "21", "34", "0xFF", "0o7",
];

const ROWS = 14;
const COLS = 20;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function CodeBackground() {
  const cells = useMemo(() => {
    return Array.from({ length: ROWS * COLS }, () => pick(SNIPPETS));
  }, []);

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none font-mono text-[9px] sm:text-[10px] text-muted-foreground/50"
      aria-hidden
    >
      <div
        className="absolute inset-0 grid p-4 gap-x-2 gap-y-1"
        style={{
          gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
          gridAutoRows: "minmax(1.5rem, auto)",
        }}
      >
        {cells.map((snippet, i) => (
          <span key={i} className="truncate">
            {snippet}
          </span>
        ))}
      </div>
    </div>
  );
}
