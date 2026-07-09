"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./FloatingWishes.module.css";

interface Wish {
  id: number;
  name: string;
  role: string;
  initials: string;
  wish: string;
  color: string;
}

interface FloatingWishesProps {
  wishes: Wish[];
}

interface PhysicsItem {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  element: HTMLDivElement | null;
  phase: number;
}

export default function FloatingWishes({ wishes }: FloatingWishesProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const physicsItemsRef = useRef<PhysicsItem[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  // Initialize and update physics items when wishes change
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 400;

    // Filter out removed items, keep existing, and add new ones
    const currentItems = physicsItemsRef.current;
    
    const nextItems = wishes.map((wish) => {
      const existing = currentItems.find((item) => item.id === wish.id);
      if (existing) return existing;

      // New wish spawn position (random within container padding)
      const size = 120 + Math.random() * 40; // Bubble width/height estimation
      return {
        id: wish.id,
        x: Math.random() * (width - size - 40) + 20,
        y: Math.random() * (height - 120 - 40) + 20,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size,
        element: null,
        phase: Math.random() * 100,
      };
    });

    physicsItemsRef.current = nextItems;
  }, [wishes]);

  // Main physics animation loop
  useEffect(() => {
    let lastTime = Date.now();

    const loop = () => {
      const container = containerRef.current;
      if (!container) {
        animationFrameRef.current = requestAnimationFrame(loop);
        return;
      }

      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      const items = physicsItemsRef.current;
      const time = Date.now() * 0.001;

      items.forEach((item) => {
        // Skip physics update if hovered or if a wish modal is open
        if (hoveredId === item.id || selectedWish !== null) {
          if (item.element) {
            // Keep it fixed but apply very micro-scale hover drift
            item.element.style.transform = `translate3d(${item.x}px, ${item.y}px, 0) scale(1.05)`;
          }
          return;
        }

        // Apply slight sinusoidal drifting force
        item.vx += Math.sin(time + item.phase) * 0.006;
        item.vy += Math.cos(time + item.phase) * 0.006;

        // Speed capping
        const speed = Math.sqrt(item.vx * item.vx + item.vy * item.vy);
        const maxSpeed = 0.5;
        if (speed > maxSpeed) {
          item.vx = (item.vx / speed) * maxSpeed;
          item.vy = (item.vy / speed) * maxSpeed;
        }

        // Apply movement
        item.x += item.vx;
        item.y += item.vy;

        // Boundary collision handling (with padding)
        const bubbleWidth = 240; // rough width limit
        const bubbleHeight = 100; // rough height limit

        if (item.x < 10) {
          item.x = 10;
          item.vx *= -1;
        } else if (item.x > width - bubbleWidth - 10) {
          item.x = width - bubbleWidth - 10;
          item.vx *= -1;
        }

        if (item.y < 10) {
          item.y = 10;
          item.vy *= -1;
        } else if (item.y > height - bubbleHeight - 10) {
          item.y = height - bubbleHeight - 10;
          item.vy *= -1;
        }

        // Apply styles
        if (item.element) {
          item.element.style.transform = `translate3d(${item.x}px, ${item.y}px, 0) scale(1)`;
        }
      });

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [hoveredId, selectedWish]);

  return (
    <div className={styles.boardContainer}>
      <div className={styles.boardHeader}>
        <div className={styles.gridSignal} />
        <span className={styles.title}>ORBITAL WISHES GRID ({wishes.length})</span>
      </div>

      <div ref={containerRef} className={styles.physicsArea}>
        {wishes.map((wish) => {
          const isHovered = hoveredId === wish.id;
          return (
            <div
              key={wish.id}
              ref={(el) => {
                const items = physicsItemsRef.current;
                const found = items.find((item) => item.id === wish.id);
                if (found) found.element = el;
              }}
              className={`${styles.wishBubble} ${isHovered ? styles.bubbleHovered : ""}`}
              style={{
                borderColor: isHovered ? wish.color : "var(--border-solid)",
                boxShadow: isHovered ? `0 0 15px ${wish.color}` : "var(--shadow-glass)",
              }}
              onMouseEnter={() => setHoveredId(wish.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => setSelectedWish(wish)}
            >
              <div 
                className={styles.avatarCircle}
                style={{ 
                  background: `linear-gradient(135deg, ${wish.color}, rgba(0,0,0,0.4))`,
                  boxShadow: `0 0 8px ${wish.color}44` 
                }}
              >
                {wish.initials}
              </div>
              <div className={styles.bubbleContent}>
                <div className={styles.bubbleName} style={{ color: wish.color }}>{wish.name}</div>
                <div className={styles.bubbleRole}>{wish.role}</div>
                <div className={styles.bubbleText}>
                  {wish.wish.length > 60 ? `${wish.wish.slice(0, 57)}...` : wish.wish}
                </div>
              </div>
              <div className={styles.bubbleGlowBorder} style={{ background: wish.color }} />
            </div>
          );
        })}
      </div>

      {/* Futuristic Holographic Modal Popup */}
      {selectedWish && (
        <div className={styles.modalOverlay} onClick={() => setSelectedWish(null)}>
          <div 
            className={styles.modalContent} 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              borderTop: `3px solid ${selectedWish.color}`,
              boxShadow: `0 10px 40px rgba(0, 0, 0, 0.6), 0 0 30px ${selectedWish.color}33`
            }}
          >
            <div className={styles.holoGrid} />
            <button className={styles.closeButton} onClick={() => setSelectedWish(null)}>
              [CLOSE UPLINK]
            </button>
            <div className={styles.modalBody}>
              <div 
                className={styles.modalAvatar} 
                style={{ 
                  background: `linear-gradient(135deg, ${selectedWish.color}, #000)`,
                  boxShadow: `0 0 20px ${selectedWish.color}`
                }}
              >
                {selectedWish.initials}
              </div>
              <div className={styles.modalMeta}>
                <h3 style={{ color: selectedWish.color }} className={styles.modalName}>
                  {selectedWish.name}
                </h3>
                <span className={styles.modalRole}>{selectedWish.role}</span>
              </div>
              <div className={styles.divider} style={{ borderColor: `${selectedWish.color}33` }} />
              <p className={styles.modalWishText}>
                "{selectedWish.wish}"
              </p>
              <div className={styles.statusFooter}>
                <span className={styles.hologramIndicator} style={{ color: selectedWish.color }}>
                  ● HOLOGRAM RESOLVED // July 21
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
