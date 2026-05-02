"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Story.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function Story() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      /* Text block slides in from left */
      gsap.fromTo(
        ".story-text-anim",
        { opacity: 0, x: -60 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            once: true,
          },
        }
      );

      /* Image reveals from right */
      gsap.fromTo(
        ".story-image-anim",
        { opacity: 0, x: 60, scale: 1.05 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            once: true,
          },
        }
      );

      /* Parallax on image */
      const img = section.querySelector(`.${styles.imageInner}`);
      if (img) {
        gsap.to(img, {
          yPercent: 15,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section id="origen" ref={sectionRef} className={styles.section}>
      <div className={styles.container}>
        <div className={styles.textBlock}>
          <p className={`${styles.label} story-text-anim`}>Nuestra Historia</p>
          <h2 className={`${styles.title} story-text-anim`}>
            De la Montaña
            <br />
            a Tu Taza
          </h2>
          <p className={`${styles.body} story-text-anim`}>
            En las regiones montañosas del Meta, a 1450 metros sobre el nivel
            del mar, nace un café con propósito. Cada grano recorre un camino de
            cuidado, selección y pasión antes de llegar a tus manos.
          </p>
          <p className={`${styles.body} story-text-anim`}>
            Café Peregrino no es solo café — es un viaje. Un homenaje a quienes
            caminan con fe, buscando algo más grande que ellos mismos.
          </p>
          <blockquote className={`${styles.quote} story-text-anim`}>
            <span className={styles.quoteScript}>Café y Esperanza</span>
            <span className={styles.quoteVerse}>1 Cor 13:13</span>
          </blockquote>
          <div className={`${styles.stats} story-text-anim`}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>1450</span>
              <span className={styles.statLabel}>msnm</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNumber}>100%</span>
              <span className={styles.statLabel}>Colombia</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNumber}>Origen</span>
              <span className={styles.statLabel}>Meta</span>
            </div>
          </div>
        </div>
        <div className={`${styles.imageBlock} story-image-anim`}>
          <div className={styles.imageWrapper}>
            <div className={styles.imageInner}>
              <Image
                src="/assets/story_mountains.png"
                alt="Montañas cafeteras del Meta al amanecer"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
