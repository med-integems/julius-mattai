"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import styles from "./WishesSlideshow.module.css";

interface Wish {
  id: number;
  name: string;
  role: string;
  initials: string;
  wish: string;
  color: string;
}

interface WishesSlideshowProps {
  wishes: Wish[];
}

export default function WishesSlideshow({ wishes }: WishesSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = wishes.length;

  const goTo = useCallback(
    (nextIndex: number, dir: "next" | "prev") => {
      if (isAnimating || total === 0) return;
      setIsAnimating(true);
      setDirection(dir);

      setTimeout(() => {
        setCurrentIndex(nextIndex);
        setIsAnimating(false);
      }, 500);
    },
    [isAnimating, total]
  );

  const goNext = useCallback(() => {
    const next = (currentIndex + 1) % total;
    goTo(next, "next");
  }, [currentIndex, total, goTo]);

  const goPrev = useCallback(() => {
    const prev = (currentIndex - 1 + total) % total;
    goTo(prev, "prev");
  }, [currentIndex, total, goTo]);

  // Auto-advance every 10 seconds; respects pause state
  useEffect(() => {
    if (total <= 1 || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(goNext, 10000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [goNext, total, isPaused]);

  if (total === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No wishes yet. Be the first to leave a message.</p>
        </div>
      </div>
    );
  }

  const wish = wishes[currentIndex];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.watermark}>60th</div>
        <h2 className={styles.label}>
          Birthday <span className={styles.labelAccent}>Wishes</span>
        </h2>
      </div>

      <div className={styles.sliderContainer}>
        <button
          className={`${styles.chevronBtn} ${styles.prevBtn}`}
          onClick={goPrev}
          disabled={isAnimating}
          aria-label="Previous wish"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className={styles.slideArea}>
          <div
            key={wish.id}
            className={`${styles.slideWrapper} ${
              isAnimating
                ? direction === "next"
                  ? styles.cardExitLeft
                  : styles.cardExitRight
                : styles.cardEnter
            }`}
          >
            <div className={styles.attribution}>
              <div
                className={styles.avatar}
                style={{
                  background: `linear-gradient(135deg, ${wish.color}, var(--accent-bronze))`,
                }}
              >
                {wish.initials}
              </div>
              <div className={styles.meta}>
                <span className={styles.name}>{wish.name}</span>
                <span className={styles.role}>{wish.role}</span>
              </div>
            </div>

            <div className={styles.bubble}>
              <blockquote className={styles.quoteText}>
                &ldquo;{wish.wish}&rdquo;
              </blockquote>
            </div>
          </div>
        </div>

        <button
          className={`${styles.chevronBtn} ${styles.nextBtn}`}
          onClick={goNext}
          disabled={isAnimating}
          aria-label="Next wish"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className={styles.dotsRow}>
        <div className={styles.dots}>
          {wishes.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === currentIndex ? styles.dotActive : ""}`}
              onClick={() => {
                if (i !== currentIndex && !isAnimating) {
                  goTo(i, i > currentIndex ? "next" : "prev");
                }
              }}
              aria-label={`Go to wish ${i + 1}`}
            />
          ))}
        </div>

        {/* Pause / Play toggle */}
        <button
          className={styles.pauseBtn}
          onClick={() => setIsPaused((p) => !p)}
          aria-label={isPaused ? "Resume wishes" : "Pause wishes"}
          title={isPaused ? "Resume" : "Pause"}
        >
          {isPaused ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
