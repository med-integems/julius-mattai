"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import styles from "./GuestRegistry.module.css";

interface GuestRegistryProps {
  onWishAdded: (newWish: any) => void;
}

export default function GuestRegistry({ onWishAdded }: GuestRegistryProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [wish, setWish] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !wish.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          role: role.trim() || "Guest",
          wish: wish.trim(),
          color: "#c5a880",
        }),
      });

      if (!response.ok) throw new Error("Failed to save");

      const savedWish = await response.json();

      if (window.triggerConfetti) {
        window.triggerConfetti();
      }

      onWishAdded(savedWish);
      setSubmitted(true);

      setTimeout(() => {
        setName("");
        setRole("");
        setWish("");
        setSubmitted(false);
        setIsSubmitting(false);
      }, 3000);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Send Birthday Wishes</h3>
        <p className={styles.subtitle}>Leave a birthday message for Minister Julius Mattai — it will appear on the wishes board</p>
      </div>

      {submitted ? (
        <div className={styles.successState}>
          <div className={styles.checkmark}>✓</div>
          <p className={styles.successText}>
            Your message has been recorded. Thank you for your warm wishes.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                className={styles.input}
                maxLength={40}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Title / Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Geologist"
                className={styles.input}
                maxLength={40}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Your Message</label>
            <textarea
              value={wish}
              onChange={(e) => setWish(e.target.value)}
              placeholder="Write your birthday message here..."
              required
              className={styles.textarea}
              maxLength={300}
              rows={4}
            />
            <span className={styles.charCount}>{wish.length} / 300</span>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={!name.trim() || !wish.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <span className={styles.submitBtnLoading}>
                <Loader2 className="animate-spin" size={18} strokeWidth={2} />
                Sending...
              </span>
            ) : (
              "Send My Wishes 🎂"
            )}
          </button>
        </form>
      )}
    </div>
  );
}
