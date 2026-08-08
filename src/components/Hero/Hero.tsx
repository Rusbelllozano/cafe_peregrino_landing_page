"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { sendGAEvent } from "@next/third-parties/google";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import styles from "./Hero.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const imageWrap = imageRef.current;
    if (!section || !imageWrap) return;

    const ctx = gsap.context(() => {
      /* Staggered text reveal */
      gsap.fromTo(
        ".hero-anim",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
          delay: 0.3,
        }
      );

      /* Parallax background */
      gsap.to(imageWrap, {
        yPercent: 25,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section id="hero" ref={sectionRef} className={styles.hero}>
      <div ref={imageRef} className={styles.bgImage}>
        <Image
          src="/assets/coffe_background.jpg"
          alt="Cafetales en las regiones montañosas del Meta, Colombia"
          fill
          sizes="100vw"
          style={{ objectFit: "cover" }}
          preload
        />
      </div>
      <div className={styles.overlay} />
      <div className={styles.content}>
        <p className={`${styles.origin} hero-anim`}>
          Regiones Montañosas del Meta · 550 msnm
        </p>
        <h1 className={`${styles.headline} hero-anim`}>
          Un Viaje
          <br />
          Que Despierta
        </h1>
        <p className={`${styles.subtitle} hero-anim`}>
          Un café con pasos de peregrino,
          <br />
          buscando a aquel que lo creó.
        </p>
        <a
          href={buildWhatsAppLink("Hola, quiero pedir Café Peregrino")}
          target="_blank"
          rel="noopener noreferrer"
          className={`cta-button hero-anim`}
          onClick={() => sendGAEvent('event', 'whatsapp_redirection', { value: 'hero' })}
        >
          <WhatsAppIcon />
          Pedir Ahora
        </a>
        <div className={`${styles.badge} hero-anim`}>
          Lote Limitado · Primera Edición
        </div>
      </div>
    </section>
  );
}
