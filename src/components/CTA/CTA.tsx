"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { sendGAEvent } from "@next/third-parties/google";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import styles from "./CTA.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function CTA() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".cta-anim",
        { opacity: 0, y: 40, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 75%",
            once: true,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section id="combo" ref={sectionRef} className={styles.section}>
      <div className={styles.bg} />
      <div className={styles.container}>
        <span className={`${styles.badge} cta-anim`}>
          Lote Limitado · Primera Edición
        </span>
        <h2 className={`${styles.title} cta-anim`}>Combo Peregrino</h2>
        <p className={`${styles.subtitle} cta-anim`}>
          2 cafés de origen · 2 experiencias distintas
        </p>
        <div className={`${styles.details} cta-anim`}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Incluye</span>
            <span className={styles.detailValue}>
              1 Excelso + 1 Premium (250 g c/u)
            </span>
          </div>
        </div>
        <div className={`${styles.priceBlock} cta-anim`}>
          {/* <span className={styles.priceLabel}>Precio de Lanzamiento</span>
          <div className={styles.priceRow}>
            <span className={styles.price}>$55.000</span>
            <span className={styles.priceCurrency}>COP</span>
          </div> */}
          <span className={styles.priceNote}>Por tiempo limitado</span>
        </div>
        <a
          href={buildWhatsAppLink("Hola, quiero pedir el Combo Peregrino")}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.button} cta-anim`}
          onClick={() => sendGAEvent('event', 'whatsapp_redirection', { value: 'cta' })}
        >
          <WhatsAppIcon />
          Asegura Tu Combo Hoy
        </a>
        <p className={`${styles.scarcity} cta-anim`}>
          Cantidad muy limitada — No se repite igual
        </p>
      </div>
    </section>
  );
}
