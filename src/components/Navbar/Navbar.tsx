"use client";

import { useEffect, useState } from "react";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      id="navbar"
      className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}
    >
      <div className={styles.inner}>
        <a href="#hero" className={styles.brand}>
          <span className={styles.brandName}>Café Peregrino</span>
          <span className={styles.brandSub}>Café y Esperanza</span>
        </a>
        <div className={styles.links}>
          <a href="#productos" className={styles.link}>
            Productos
          </a>
          <a href="#origen" className={styles.link}>
            Origen
          </a>
          <a
            href="https://wa.me/573213611624?text=Hola%2C%20quiero%20pedir%20Caf%C3%A9%20Peregrino"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaLink}
          >
            Pedir Ahora
          </a>
        </div>
      </div>
    </nav>
  );
}
