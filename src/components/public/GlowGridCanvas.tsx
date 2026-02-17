"use client";

import { useEffect, useMemo, useRef } from "react";
import { useReducedMotion } from "framer-motion";

type Cell = {
  x: number;
  y: number;
  alpha: number;
  fading: boolean;
  lastTouched: number;
  colorIndex: 0 | 1 | 2;
};

type Rgb = readonly [number, number, number];

export function GlowGridCanvas() {
  const prefersReducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const squareSize = 64;

  const palette = useMemo(() => {
    // Fixed, high-contrast neon RGB palette for obvious color changes.
    return [
      [0, 255, 204],   // cyan-mint
      [255, 64, 180],  // magenta
      [120, 110, 255], // violet-blue
    ] as const satisfies readonly [Rgb, Rgb, Rgb];
  }, []);

  const canAnimate = useMemo(() => {
    if (prefersReducedMotion) return false;
    if (typeof window === "undefined") return false;
    // Avoid heavy hover effects on coarse pointers (mobile/touch)
    return window.matchMedia?.("(pointer: fine)").matches ?? true;
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!canAnimate) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const el = canvas;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    const c = ctx;

    let width = 0;
    let height = 0;
    const grid: Cell[] = [];
    let nextColorIndex: 0 | 1 | 2 = 0;

    function resize() {
      const parent = el.parentElement;
      if (!parent) return;
      width = el.width = parent.clientWidth;
      height = el.height = parent.clientHeight;
      grid.length = 0;
      for (let x = 0; x < width; x += squareSize) {
        for (let y = 0; y < height; y += squareSize) {
          grid.push({ x, y, alpha: 0, fading: false, lastTouched: 0, colorIndex: 0 });
        }
      }
    }

    function getCellAt(x: number, y: number) {
      const gx = Math.floor(x / squareSize) * squareSize;
      const gy = Math.floor(y / squareSize) * squareSize;
      return grid.find((c) => c.x === gx && c.y === gy);
    }

    function onMove(e: MouseEvent) {
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const cell = getCellAt(mx, my);
      if (cell && cell.alpha === 0) {
        cell.alpha = 1;
        cell.lastTouched = Date.now();
        cell.fading = false;
        // Cycle through the palette so consecutive squares visibly change color.
        cell.colorIndex = nextColorIndex;
        nextColorIndex = ((nextColorIndex + 1) % 3) as 0 | 1 | 2;
      }
    }

    function draw() {
      c.clearRect(0, 0, width, height);
      const now = Date.now();

      for (let i = 0; i < grid.length; i++) {
        const cell = grid[i];
        if (cell.alpha > 0 && !cell.fading && now - cell.lastTouched > 450) {
          cell.fading = true;
        }
        if (cell.fading) {
          cell.alpha -= 0.02;
          if (cell.alpha <= 0) {
            cell.alpha = 0;
            cell.fading = false;
          }
        }
        if (cell.alpha > 0) {
          const centerX = cell.x + squareSize / 2;
          const centerY = cell.y + squareSize / 2;
          const gradient = c.createRadialGradient(
            centerX,
            centerY,
            6,
            centerX,
            centerY,
            squareSize
          );
          const [r, g, b] = palette[cell.colorIndex];
          gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${cell.alpha * 0.7})`);
          gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

          c.strokeStyle = gradient;
          c.lineWidth = 1.25;
          c.strokeRect(cell.x + 0.5, cell.y + 0.5, squareSize - 1, squareSize - 1);
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove, { passive: true });
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [canAnimate, palette, squareSize]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-[0.35]"
      aria-hidden
    />
  );
}

