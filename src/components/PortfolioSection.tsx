"use client";

import { useState } from "react";
import styles from "./PortfolioSection.module.css";
import ScrollReveal from "./ScrollReveal";

interface CareerMilestone {
  period: string;
  title: string;
  org: string;
  details: string[];
}

const MILESTONES: CareerMilestone[] = [
  {
    period: "2023 — Present",
    title: "Minister of Mines & Mineral Resources",
    org: "Government of Sierra Leone",
    details: [
      "Driving mining sector reforms focusing on transparency, community benefits, and environmental sustainability.",
      "Implementing the landmark Mines and Minerals Development Act of 2023.",
      "Assumed Chairmanship of the African Diamond Producers Association (ADPA) in 2025.",
    ],
  },
  {
    period: "2019 — 2023",
    title: "Director-General",
    org: "National Minerals Agency (NMA)",
    details: [
      "Directed the administration and regulation of the mining sector in Sierra Leone.",
      "Developed geodata and geoinformation policies to modernize exploration and monitoring.",
    ],
  },
  {
    period: "2011 — 2019",
    title: "Founder & Managing Director",
    org: "INTEGEMS Consultancy",
    details: [
      "Established a multi-disciplinary consultancy in GIS, remote sensing, and environmental management.",
      "Conducted critical hazard investigation into the 2017 Freetown landslide.",
    ],
  },
  {
    period: "2014 — 2015",
    title: "Emergency Response Leader",
    org: "United Nations (UNMEER / UNOPS)",
    details: [
      "Served in key leadership positions during the Ebola emergency response in Liberia.",
      "Managed geo-information analysis to guide medical deployments and supply lines.",
    ],
  },
];

const EDUCATION = [
  {
    year: "2001",
    location: "United Kingdom",
    degree: "MSc in Environmental & Earth Resources Management",
  },
  {
    year: "1992",
    location: "Ukraine",
    degree: "MSc in Geology & Exploration for Mineral Deposits",
  },
  {
    year: "1985",
    location: "Sierra Leone",
    degree: "Bo Government Secondary School",
  },
];

export default function PortfolioSection() {
  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  return (
    <section className={styles.section}>
      {/* Career Timeline */}
      <div className={styles.timelineBlock}>
        <ScrollReveal>
          <h2 className={styles.sectionTitle}>Career</h2>
        </ScrollReveal>
        <div className={styles.timeline}>
          {MILESTONES.map((m, i) => {
            const isExpanded = expandedIndex === i;
            return (
              <ScrollReveal key={i} delay={i * 100}>
                <div
                  className={`${styles.timelineItem} ${isExpanded ? styles.itemExpanded : ""}`}
                  onClick={() => setExpandedIndex(i)}
                >
                  <div className={styles.itemHeader}>
                    <span className={styles.period}>{m.period}</span>
                    <div className={styles.itemTitleGroup}>
                      <h3 className={styles.itemTitle}>{m.title}</h3>
                      <span className={styles.itemOrg}>{m.org}</span>
                    </div>
                    <span className={styles.expandIcon}>{isExpanded ? "−" : "+"}</span>
                  </div>

                  {isExpanded && (
                    <div className={styles.itemBody}>
                      <ul className={styles.detailList}>
                        {m.details.map((d, j) => (
                          <li key={j} className={styles.detailItem}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>

      {/* Education */}
      <div className={styles.educationBlock}>
        <ScrollReveal>
          <h2 className={styles.sectionTitle}>Education</h2>
        </ScrollReveal>
        <div className={styles.eduGrid}>
          {EDUCATION.map((edu, i) => (
            <ScrollReveal key={i} delay={i * 150}>
              <div className={styles.eduCard}>
                <span className={styles.eduYear}>{edu.year} · {edu.location}</span>
                <h4 className={styles.eduDegree}>{edu.degree}</h4>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
