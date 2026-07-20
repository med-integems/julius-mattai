"use client";

import BackgroundParticles from "@/components/BackgroundParticles";
import ConfettiCanvas from "@/components/ConfettiCanvas";
import GuestRegistry from "@/components/GuestRegistry";
import HeroCarousel from "@/components/HeroCarousel";
import PortfolioSection from "@/components/PortfolioSection";
import ScrollReveal from "@/components/ScrollReveal";
import SynthPlayer from "@/components/SynthPlayer";
import ThemeToggle from "@/components/ThemeToggle";
import WishesSlideshow from "@/components/WishesSlideshow";
import { Loader2, PartyPopper, Sparkles } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

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
  const [confettiOn, setConfettiOn] = useState(true);
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

    // Dev/preview override: ?birthday=true forces the birthday state
    const forceBirthday =
      new URLSearchParams(window.location.search).get("birthday") === "true";
    if (forceBirthday) {
      setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isBirthday: true });
      return;
    }

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
      <ConfettiCanvas continuous={countdown.isBirthday && confettiOn} />

      {/* Confetti stop / resume — shown throughout the birthday */}
      {countdown.isBirthday && (
        <button
          className={styles.confettiToggle}
          onClick={() => setConfettiOn((v) => !v)}
          aria-label={confettiOn ? "Stop confetti" : "Start confetti"}
        >
          {confettiOn ? <PartyPopper size={16} /> : <Sparkles size={16} />}
          <span>{confettiOn ? "Stop confetti" : "Start confetti"}</span>
        </button>
      )}

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

      {/* ─── BIRTHDAY TITLE ─── */}
      <ScrollReveal>
        <section className={styles.birthdaySection}>
          <span className={styles.birthdayEyebrow}>July 21 · 60th Birthday</span>
          <h2 className={styles.birthdayTitle}>
            <span className={styles.birthdayAccent}>Happy Birthday,</span><br />Julius Daniel Mattai
          </h2>
          <p className={styles.birthdaySubtitle}>
            Celebrating six decades of visionary leadership, service, and inspiration.
          </p>
        </section>
      </ScrollReveal>

      {/* ─── WISHES & REGISTRY ─── */}
      <section className={styles.wishesSection}>
        <div className={styles.wishesGrid}>
          <ScrollReveal>
            <div className={styles.wishesCol}>
              {/* Wishes photos */}
              <div className={styles.wishesPhotos}>
                <div className={styles.wishesPhoto}>
                  <Image
                    src="/images/jm-and-gents.jpeg"
                    alt="Julius Mattai birthday celebration"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className={styles.wishesPhotoImg}
                  />
                </div>
                <div className={styles.wishesPhoto}>
                  <Image
                    src="/images/jm-and-ladies.jpeg"
                    alt="Julius Mattai birthday celebration"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className={styles.wishesPhotoImg}
                  />
                </div>
              </div>

              {loading ? (
                <div className={styles.loadingState}>
                  <Loader2 className="animate-spin" size={28} strokeWidth={1.5} />
                  <span className={styles.loadingText}>Loading wishes...</span>
                </div>
              ) : (
                <WishesSlideshow wishes={wishes} />
              )}
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <div className={styles.registryCol}>
              <div className={styles.registryImage}>
                <Image
                  src="/images/jm-and-cake.jpeg"
                  alt="Julius Mattai with his birthday cake"
                  fill
                  sizes="(max-width: 900px) 100vw, 45vw"
                  className={styles.registryImageImg}
                />
              </div>
              <div className={styles.registryForm}>
                <GuestRegistry onWishAdded={handleWishAdded} />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className={styles.footer}>
        <span>A tribute to the birthday of Mr. Julius Daniel Mattai</span>
        <span className={styles.footerRight}>July 21, 2026</span>
      </footer>
    </div>
  );
}
