"use client";

import { useEffect, useRef } from "react";

interface ConfettiParticle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  scaleY: number;
}

declare global {
  interface Window {
    triggerConfetti: () => void;
  }
}

export default function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<ConfettiParticle[]>([]);

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

    const colors = ["#00f2fe", "#ff007f", "#ffc837", "#b100ff", "#00ffcc", "#4facfe"];

    const addParticles = (count: number) => {
      const width = canvas.width;
      const height = canvas.height;
      
      // We trigger standard left and right explosions for a premium feel
      for (let i = 0; i < count; i++) {
        // Left side emitter
        particlesRef.current.push({
          x: 0,
          y: height * 0.8,
          size: Math.random() * 8 + 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedX: Math.random() * 15 + 10,
          speedY: -(Math.random() * 20 + 15),
          rotation: Math.random() * 360,
          rotationSpeed: Math.random() * 10 - 5,
          opacity: 1,
          scaleY: Math.random() * 2 - 1,
        });

        // Right side emitter
        particlesRef.current.push({
          x: width,
          y: height * 0.8,
          size: Math.random() * 8 + 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedX: -(Math.random() * 15 + 10),
          speedY: -(Math.random() * 20 + 15),
          rotation: Math.random() * 360,
          rotationSpeed: Math.random() * 10 - 5,
          opacity: 1,
          scaleY: Math.random() * 2 - 1,
        });
      }
    };

    // Attach to window so we can trigger confetti from other components
    window.triggerConfetti = () => {
      addParticles(75);
    };

    // Trigger an initial burst on load after a slight delay
    const initialTimeout = setTimeout(() => {
      window.triggerConfetti();
    }, 1500);

    let animationFrameId: number;

    const updateAndDraw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Apply gravity & drift
        p.x += p.speedX;
        p.y += p.speedY;
        p.speedY += 0.45; // Gravity
        p.speedX *= 0.98; // Air resistance
        p.rotation += p.rotationSpeed;
        p.scaleY = Math.sin(p.rotation * 0.05);

        // Fade out as they fall past the viewport
        if (p.speedY > 0) {
          p.opacity -= 0.008;
        }

        // Draw particle
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.scale(1, p.scaleY);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;

        // Custom rect/diamond shape
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();

        // Remove dead particles
        if (p.y > canvas.height || p.opacity <= 0 || p.x < 0 || p.x > canvas.width) {
          particles.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(updateAndDraw);
    };

    updateAndDraw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(initialTimeout);
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
        zIndex: 999, // Layer it above everything except modals
      }}
    />
  );
}
