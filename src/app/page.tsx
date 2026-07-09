"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import BackgroundParticles from "@/components/BackgroundParticles";
import ConfettiCanvas from "@/components/ConfettiCanvas";
import ThemeToggle from "@/components/ThemeToggle";
import SynthPlayer from "@/components/SynthPlayer";
import PortfolioSection from "@/components/PortfolioSection";
import WishesSlideshow from "@/components/WishesSlideshow";
import GuestRegistry from "@/components/GuestRegistry";
import HeroCarousel from "@/components/HeroCarousel";
import ScrollReveal from "@/components/ScrollReveal";

interface Wish {
  id: number;
  name: string;
  role: string;
  initials: string;
  wish: string;
  color: string;
}

export default function Home() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isBirthday: false,
  });

  // Fetch wishes
  useEffect(() => {
    async function fetchWishes() {
      try {
        const res = await fetch("/api/wishes");
        if (res.ok) {
          const data = await res.json();
          setWishes(data);
        }
      } catch (err) {
        console.error("Could not fetch wishes:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchWishes();
  }, []);

  // Countdown to July 21, 2026
  useEffect(() => {
    const target = new Date("2026-07-21T00:00:00").getTime();

    const tick = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isBirthday: true });
        return;
      }

      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        isBirthday: false,
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleWishAdded = (newWish: Wish) => {
    setWishes((prev) => [...prev, newWish]);
  };

  return (
    <div className={styles.app}>
      <div className="radial-glow" />
      <BackgroundParticles />
      <ConfettiCanvas />

      {/* ─── NAV BAR ─── */}
      <header className={styles.nav}>
        <div className={styles.navBrand}>
          <Image
            src="/jm-dark-logo.png"
            alt="JM Logo"
            width={52}
            height={52}
            loading="eager"
            priority
            className={`${styles.navLogo} ${styles.navLogoDark}`}
          />
          <Image
            src="/jm-light-logo.png"
            alt="JM Logo"
            width={52}
            height={52}
            loading="eager"
            priority
            className={`${styles.navLogo} ${styles.navLogoLight}`}
          />
          <span className={styles.navBrandText}>Julius Mattai</span>
        </div>
        <div className={styles.navControls}>
          <SynthPlayer />
          <ThemeToggle />
        </div>
      </header>

      {/* ─── HERO SECTION ─── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroEyebrow}>Birthday Celebration · July 21</span>
          <h1 className={styles.heroTitle}>
            Julius Daniel<br />Mattai
          </h1>
          <p className={styles.heroDesc}>
            Minister of Mines &amp; Mineral Resources · Geoscientist · Visionary Leader
          </p>

          {/* Countdown */}
          {countdown.isBirthday ? (
            <div className={styles.birthdayLive}>
              <span className={styles.birthdayDot} />
              Happy Birthday, Mr. Mattai
            </div>
          ) : (
            <div className={styles.countdownRow}>
              <div className={styles.countdownSlot}>
                <span className={styles.countdownNum}>
                  {String(countdown.days).padStart(2, "0")}
                </span>
                <span className={styles.countdownLabel}>Days</span>
              </div>
              <span className={styles.countdownSep}>:</span>
              <div className={styles.countdownSlot}>
                <span className={styles.countdownNum}>
                  {String(countdown.hours).padStart(2, "0")}
                </span>
                <span className={styles.countdownLabel}>Hours</span>
              </div>
              <span className={styles.countdownSep}>:</span>
              <div className={styles.countdownSlot}>
                <span className={styles.countdownNum}>
                  {String(countdown.minutes).padStart(2, "0")}
                </span>
                <span className={styles.countdownLabel}>Mins</span>
              </div>
              <span className={styles.countdownSep}>:</span>
              <div className={styles.countdownSlot}>
                <span className={styles.countdownNum}>
                  {String(countdown.seconds).padStart(2, "0")}
                </span>
                <span className={styles.countdownLabel}>Secs</span>
              </div>
            </div>
          )}
        </div>

        {/* Hero Portrait Carousel */}
        <div className={styles.heroImageWrap}>
          <HeroCarousel />
        </div>
      </section>

      {/* ─── DIVIDER ─── */}
      <ScrollReveal>
        <div className={styles.divider}>
          <span className={styles.dividerText}>Over 30 years of distinguished service across four nations</span>
        </div>
      </ScrollReveal>

      {/* ─── PORTFOLIO SECTION ─── */}
      <section className={styles.portfolioSection}>
        <div className={styles.portfolioWatermark}>60th</div>
        <PortfolioSection />
      </section>

      {/* ─── WISHES & REGISTRY ─── */}
      <section className={styles.wishesSection}>
        <div className={styles.wishesGrid}>
          <ScrollReveal>
            <div className={styles.wishesCol}>
              {loading ? (
                <p className={styles.loadingText}>Loading wishes...</p>
              ) : (
                <WishesSlideshow wishes={wishes} />
              )}
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <div className={styles.registryCol}>
              <GuestRegistry onWishAdded={handleWishAdded} />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className={styles.footer}>
        <span>A tribute to Mr. Julius Daniel Mattai</span>
        <span className={styles.footerRight}>July 21, 2026</span>
      </footer>
    </div>
  );
}
