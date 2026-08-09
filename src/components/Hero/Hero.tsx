"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { sendGAEvent } from "@next/third-parties/google";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { products } from "./products";
import styles from "./Hero.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-anim",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          delay: 0.2,
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section id="hero" ref={sectionRef} className={styles.hero}>
      <div className={styles.content}>
        <p className={`${styles.origin} hero-anim`}>
          Regiones Montañosas del Meta · 550 msnm
        </p>
        <h1 className={`${styles.brandName} hero-anim`}>Café Peregrino</h1>
        <div className={`${styles.badge} hero-anim`}>
          Lote Limitado · Primera Edición
        </div>
        <div className={styles.columns}>
          {products.map((product) => (
            <article key={product.id} className={`${styles.column} hero-anim`}>
              <div className={styles.imageWrap}>
                <Image
                  src={product.image}
                  alt={`Café Peregrino ${product.name}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: "cover" }}
                  preload
                />
              </div>
              <div className={styles.info}>
                <span
                  className={styles.accentLine}
                  style={{ background: product.accent }}
                />
                <h2 className={styles.productName}>{product.name}</h2>
                <p className={styles.tagline}>{product.tagline}</p>
                <a
                  href={buildWhatsAppLink(product.whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cta-button"
                  onClick={() =>
                    sendGAEvent("event", "whatsapp_redirection", {
                      value: `hero-${product.id}`,
                    })
                  }
                >
                  <WhatsAppIcon />
                  Pedir por WhatsApp
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
