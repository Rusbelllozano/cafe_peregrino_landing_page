"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { storySteps } from "./storySteps";
import styles from "./Story.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function Story() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
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

      ScrollTrigger.matchMedia({
        "(min-width: 769px)": () => {
          const steps = gsap.utils.toArray<HTMLElement>(".story-step");
          if (steps.length < 2) return;

          gsap.set(steps, { opacity: 0 });
          gsap.set(steps[0], { opacity: 1 });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${(steps.length - 1) * window.innerHeight}`,
              scrub: true,
              pin: true,
            },
          });

          steps.forEach((step, index) => {
            if (index === 0) return;
            tl.to(steps[index - 1], { opacity: 0, duration: 1 }, index - 1);
            tl.to(step, { opacity: 1, duration: 1 }, index - 1);
          });
        },
        "(max-width: 768px)": () => {
          gsap.fromTo(
            ".story-step",
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.15,
              ease: "power3.out",
              scrollTrigger: {
                trigger: section,
                start: "top 70%",
                once: true,
              },
            }
          );
        },
      });
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
            En las regiones montañosas del Meta, a 550 metros sobre el nivel
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
              <span className={styles.statNumber}>550</span>
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
        <div className={styles.imageBlock}>
          <div className={styles.imageWrapper}>
            {storySteps.map((step, index) => (
              <div
                key={step.image}
                className={`${styles.imageInner} story-step`}
                data-step={index}
              >
                <Image
                  src={step.image}
                  alt={step.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: "cover" }}
                />
                <span className={styles.caption}>{step.caption}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
