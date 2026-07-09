"use client";

import { useEffect, useState } from "react";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    const initial = saved || "dark";
    setTheme(initial);
    if (initial === "light") document.body.classList.add("light-theme");
    else document.body.classList.remove("light-theme");
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    if (next === "light") document.body.classList.add("light-theme");
    else document.body.classList.remove("light-theme");
  };

  return (
    <button className={styles.toggle} onClick={toggle} aria-label="Toggle theme">
      <span className={styles.icon}>{theme === "dark" ? "☀" : "☾"}</span>
    </button>
  );
}
