"use client";

import confetti from "canvas-confetti";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    triggerConfetti: () => void;
  }
}

// Festive palette tuned to the site's gold / burgundy scheme
const COLORS = ["#c5a880", "#e8d5b0", "#ffd700", "#a13d43", "#ffffff", "#8e7a63"];

const base: confetti.Options = {
  colors: COLORS,
  zIndex: 999,
  disableForReducedMotion: true,
};

// A dense, layered celebratory burst from the centre + side cannons
function celebrate(myConfetti: confetti.CreateTypes) {
  const fireCenter = (particleRatio: number, opts: confetti.Options) => {
    myConfetti({
      ...base,
      origin: { x: 0.5, y: 0.62 },
      particleCount: Math.floor(280 * particleRatio),
      ...opts,
    });
  };

  // Layered center explosion — varied velocity/spread/shape for density & depth
  fireCenter(0.25, { spread: 26, startVelocity: 55, scalar: 1.1 });
  fireCenter(0.2, { spread: 60, startVelocity: 45 });
  fireCenter(0.35, { spread: 100, decay: 0.91, scalar: 0.9, shapes: ["star", "circle"] });
  fireCenter(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.3, shapes: ["star"] });
  fireCenter(0.1, { spread: 120, startVelocity: 45 });

  // Side cannons for a premium, full-width feel
  myConfetti({ ...base, particleCount: 90, angle: 60, spread: 75, startVelocity: 62, origin: { x: 0, y: 0.75 } });
  myConfetti({ ...base, particleCount: 90, angle: 120, spread: 75, startVelocity: 62, origin: { x: 1, y: 0.75 } });
}

interface ConfettiCanvasProps {
  /** When true, confetti keeps celebrating continuously (e.g. throughout the birthday). */
  continuous?: boolean;
}

export default function ConfettiCanvas({ continuous = false }: ConfettiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const confettiRef = useRef<confetti.CreateTypes | null>(null);

  // Initialise the confetti instance once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const myConfetti = confetti.create(canvas, { resize: true, useWorker: true });
    confettiRef.current = myConfetti;

    // Expose one-shot trigger so other components (e.g. the wish form) can fire it
    window.triggerConfetti = () => celebrate(myConfetti);

    // Initial welcome burst shortly after load
    const initial = setTimeout(() => window.triggerConfetti(), 1200);

    return () => {
      clearTimeout(initial);
      myConfetti.reset();
      confettiRef.current = null;
    };
  }, []);

  // Continuous celebration while `continuous` is true (birthday + not stopped)
  useEffect(() => {
    if (!continuous) return;
    const myConfetti = confettiRef.current;
    if (!myConfetti) return;

    let stopped = false;
    let rafId = 0;

    // Repeated big bursts
    celebrate(myConfetti);
    const burstTimer = setInterval(() => {
      if (!stopped) celebrate(myConfetti);
    }, 2800);

    // Constant gentle shower raining from the top
    const showerFrame = () => {
      if (stopped) return;
      myConfetti({
        ...base,
        particleCount: 3,
        startVelocity: 0,
        ticks: 320,
        gravity: 0.6,
        scalar: 0.9,
        spread: 100,
        origin: { x: Math.random(), y: -0.1 },
        shapes: ["square", "circle", "star"],
      });
      rafId = requestAnimationFrame(showerFrame);
    };
    showerFrame();

    return () => {
      stopped = true;
      clearInterval(burstTimer);
      cancelAnimationFrame(rafId);
    };
  }, [continuous]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 999,
      }}
    />
  );
}
