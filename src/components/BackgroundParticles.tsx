"use client";

import { useEffect, useRef } from "react";

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  phase: number;
}

export default function BackgroundParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Fewer, subtler particles — like dust in warm light
    const motes: Mote[] = [];
    const count = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 35000), 40);

    for (let i = 0; i < count; i++) {
      motes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.08,
        radius: Math.random() * 1.8 + 0.5,
        opacity: Math.random() * 0.15 + 0.03,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let animId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isLight = document.body.classList.contains("light-theme");
      const color = isLight ? "70, 57, 43" : "197, 168, 128";

      const time = Date.now() * 0.0003;

      for (const m of motes) {
        // Slow drifting with gentle sine modulation
        m.x += m.vx + Math.sin(time + m.phase) * 0.03;
        m.y += m.vy + Math.cos(time + m.phase) * 0.02;

        // Wrap around edges
        if (m.x < -10) m.x = canvas.width + 10;
        if (m.x > canvas.width + 10) m.x = -10;
        if (m.y < -10) m.y = canvas.height + 10;
        if (m.y > canvas.height + 10) m.y = -10;

        // Pulsing opacity
        const pulseOpacity = m.opacity + Math.sin(time * 2 + m.phase) * 0.02;

        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${Math.max(0.01, pulseOpacity)})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
