"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import styles from "./HeroCarousel.module.css";

const IMAGES = [
  "/images/jm-3.jpg",
  "/images/jm-1.jpg",
  "/images/jm-2.jpg",
  "/images/jm-4.jpg"
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback((nextIndex: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setIndex(nextIndex);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 800);
  }, [isTransitioning]);

  const handleNext = useCallback(() => {
    goTo((index + 1) % IMAGES.length);
  }, [index, goTo]);

  const handlePrev = useCallback(() => {
    goTo((index - 1 + IMAGES.length) % IMAGES.length);
  }, [index, goTo]);

  useEffect(() => {
    const timer = setInterval(handleNext, 6000);
    return () => clearInterval(timer);
  }, [handleNext]);

  return (
    <div className={styles.container}>
      <div className={styles.slidesWrapper}>
        {IMAGES.map((src, i) => (
          <div
            key={src}
            className={`${styles.slide} ${i === index ? styles.active : ""} ${i === (index - 1 + IMAGES.length) % IMAGES.length ? styles.prevSlide : ""
              }`}
          >
            <Image
              src={src}
              alt={`Mr. Julius Daniel Mattai ${i + 1}`}
              fill
              loading="eager"
              priority
              className={styles.image}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        ))}
      </div>

      {/* Decorative gradient overlay */}
      <div className={styles.overlay} />

      {/* Arrow controls */}
      <button
        onClick={handlePrev}
        className={`${styles.controlBtn} ${styles.prevBtn}`}
        aria-label="Previous image"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={handleNext}
        className={`${styles.controlBtn} ${styles.nextBtn}`}
        aria-label="Next image"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dot indicators */}
      <div className={styles.indicators}>
        {IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`${styles.indicator} ${i === index ? styles.indicatorActive : ""}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
