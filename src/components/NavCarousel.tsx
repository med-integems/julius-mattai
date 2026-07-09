"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./NavCarousel.module.css";

const IMAGES = [
  "/images/jm-1.jpg",
  "/images/jm-2.jpg",
  "/images/jm-3.jpg",
  "/images/jm-4.jpg"
];

export default function NavCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex((prev) => (prev - 1 + IMAGES.length) % IMAGES.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex((prev) => (prev + 1) % IMAGES.length);
  };

  return (
    <div className={styles.carouselContainer} title="Mr. Julius Mattai Gallery">
      <div className={styles.frame}>
        {IMAGES.map((src, i) => (
          <div
            key={src}
            className={`${styles.slide} ${i === index ? styles.active : ""}`}
          >
            <Image
              src={src}
              alt={`Julius Mattai ${i + 1}`}
              fill
              sizes="80px"
              className={styles.image}
              priority={i === 0}
            />
          </div>
        ))}
        <div className={styles.controls}>
          <button onClick={handlePrev} className={styles.navBtn} aria-label="Previous image">
            ‹
          </button>
          <button onClick={handleNext} className={styles.navBtn} aria-label="Next image">
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
