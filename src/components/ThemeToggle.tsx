"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "./ThemeToggle.module.css";

function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const applyTheme = (t: "dark" | "light") => {
    if (t === "light") document.body.classList.add("light-theme");
    else document.body.classList.remove("light-theme");
  };

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    const initial = saved ?? getSystemTheme();
    setTheme(initial);
    applyTheme(initial);

    // Follow the OS/PC theme while the user hasn't set an explicit preference
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem("theme")) return;
      const next = e.matches ? "light" : "dark";
      setTheme(next);
      applyTheme(next);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  };

  return (
    <button className={styles.toggle} onClick={toggle} aria-label="Toggle theme">
      <span className={styles.icon}>
        {theme === "dark" ? <Sun size={16} strokeWidth={1.75} /> : <Moon size={16} strokeWidth={1.75} />}
      </span>
    </button>
  );
}
