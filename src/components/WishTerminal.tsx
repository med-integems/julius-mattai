"use client";

import { useState } from "react";
import styles from "./WishTerminal.module.css";

interface WishTerminalProps {
  onWishAdded: (newWish: any) => void;
}

const COLOR_PRESETS = [
  { value: "#00f2fe", name: "Cyber Cyan" },
  { value: "#ff007f", name: "Neon Pink" },
  { value: "#ffc837", name: "Gold Dust" },
  { value: "#b100ff", name: "Violet Flare" },
  { value: "#00ffcc", name: "Mantis Green" },
  { value: "#4facfe", name: "Deep Echo" }
];

export default function WishTerminal({ onWishAdded }: WishTerminalProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [wish, setWish] = useState("");
  const [selectedColor, setSelectedColor] = useState("#00f2fe");
  const [logs, setLogs] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const writeLogs = async (lines: string[]) => {
    for (const line of lines) {
      setLogs((prev) => [...prev, line]);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !wish.trim()) return;

    setIsSubmitting(true);
    setLogs([]);
    
    await writeLogs([
      "> RUN init_wish_sequence --host=hologram.net",
      "[INFO] Resolving quantum socket connection...",
      "[INFO] Encrypting packet payloads...",
      `[INFO] Injecting coordinates for source: ${name.trim()}`
    ]);

    try {
      const response = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          role: role.trim(),
          wish: wish.trim(),
          color: selectedColor
        })
      });

      if (!response.ok) {
        throw new Error("Uplink handshake failed");
      }

      const savedWish = await response.json();
      
      await writeLogs([
        "[INFO] Transmitting payload to wishes database...",
        "[SUCCESS] Uplink established! Handshake confirmed.",
        "[INFO] Spawning orbital wish bubble inside grid...",
        `> BROADCAST_SUCCESS: Wish #${savedWish.id} is now floating.`
      ]);

      // Trigger Confetti!
      if (window.triggerConfetti) {
        window.triggerConfetti();
      }

      // Add to local state immediately
      onWishAdded(savedWish);

      // Clear input fields
      setTimeout(() => {
        setName("");
        setRole("");
        setWish("");
        setLogs([]);
        setIsSubmitting(false);
      }, 1500);

    } catch (err: any) {
      await writeLogs([
        `[FATAL_ERROR] Broadcast failed: ${err.message || "Unknown anomaly"}`,
        "[SYS] Aborting orbital sequence."
      ]);
      setTimeout(() => {
        setIsSubmitting(false);
      }, 2000);
    }
  };

  return (
    <div className={styles.terminalContainer}>
      <div className={styles.terminalHeader}>
        <div className={styles.windowControls}>
          <span className={`${styles.controlDot} ${styles.close}`} />
          <span className={`${styles.controlDot} ${styles.minimize}`} />
          <span className={`${styles.controlDot} ${styles.maximize}`} />
        </div>
        <span className={styles.headerTitle}>wishes_uploader.sh // UPLINK CORE</span>
      </div>

      <div className={styles.terminalBody}>
        {isSubmitting ? (
          <div className={styles.logOutput}>
            {logs.map((log, i) => (
              <div key={i} className={log.includes("[SUCCESS]") || log.includes("BROADCAST_SUCCESS") ? styles.successLog : log.includes("[FATAL_ERROR]") ? styles.errorLog : styles.normalLog}>
                {log}
              </div>
            ))}
            <span className={styles.cursor}>_</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.terminalForm}>
            <div className={styles.inputRow}>
              <span className={styles.prompt}>guest@hologram:~$ enter_name --val=</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="YOUR NAME"
                required
                className={styles.terminalInput}
                maxLength={40}
              />
            </div>

            <div className={styles.inputRow}>
              <span className={styles.prompt}>guest@hologram:~$ enter_role --val=</span>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="YOUR DESIGNATION / RELATION"
                className={styles.terminalInput}
                maxLength={40}
              />
            </div>

            <div className={styles.textareaRow}>
              <div className={styles.promptLine}>
                <span className={styles.prompt}>guest@hologram:~$ enter_wish_message --edit</span>
              </div>
              <textarea
                value={wish}
                onChange={(e) => setWish(e.target.value)}
                placeholder="Type your birthday message here..."
                required
                className={styles.terminalTextarea}
                maxLength={250}
              />
            </div>

            <div className={styles.colorRow}>
              <span className={styles.prompt}>guest@hologram:~$ set_bubble_hue --hex=</span>
              <div className={styles.colorSelector}>
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={`${styles.colorCircle} ${selectedColor === color.value ? styles.colorActive : ""}`}
                    style={{ 
                      backgroundColor: color.value,
                      boxShadow: selectedColor === color.value ? `0 0 10px ${color.value}` : "none" 
                    }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <button type="submit" className={styles.submitButton} disabled={!name.trim() || !wish.trim()}>
              EXECUTE: RUN init_wish_sequence
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
