"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { sendGAEvent } from "@next/third-parties/google";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import type { DiscountResult } from "@/lib/discounts";
import HeroRipple from "@/components/Hero/HeroRipple";
import styles from "./Promo.module.css";

const CODE_LENGTH = 6;

export default function PromoPage() {
  const [code, setCode] = useState("");
  const [isError, setIsError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [matchedDiscount, setMatchedDiscount] = useState<DiscountResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const entryRef = useRef<HTMLDivElement>(null);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Entrance animation for the entry screen, mirrors Hero.tsx's inline GSAP pattern
  useEffect(() => {
    const section = entryRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".promo-anim",
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

  // Clear the shake animation after it finishes. isShaking is turned on
  // wherever an error is raised (see setError below); isError itself stays
  // true (driving the error text / aria state) until the user types again.
  useEffect(() => {
    if (!isShaking) return;
    const timeoutId = setTimeout(() => {
      setIsShaking(false);
    }, 500); // 500ms matches the CSS animation duration
    return () => clearTimeout(timeoutId);
  }, [isShaking]);

  const setError = () => {
    setIsError(true);
    setIsShaking(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to uppercase and limit length
    const value = e.target.value.toUpperCase().slice(0, CODE_LENGTH);
    setCode(value);

    // Reset error when typing
    if (isError) setIsError(false);

    // Auto-check when length reaches exactly 6
    if (value.length === CODE_LENGTH) {
      checkCode(value);
    }
  };

  const checkCode = async (valueToCheck: string) => {
    try {
      const res = await fetch("/api/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: valueToCheck }),
      });

      if (!res.ok) {
        setError();
        return;
      }

      const discount: DiscountResult = await res.json();
      setMatchedDiscount(discount);
    } catch {
      setError();
    }
  };

  // Split title for animation
  const cafeLetters = "Café".split("");
  const peregrinoLetters = "Peregrino".split("");

  return (
    <main>
      {/* ENTRY STATE */}
      {!matchedDiscount && (
        <div ref={entryRef} className={styles.entryState}>
          <HeroRipple />
          <div className={styles.entryContent}>
            <p className={`${styles.origin} promo-anim`}>
              Regiones Montañosas del Meta · 1200 - 1600 msnm
            </p>
            <h1 className={`${styles.brandName} promo-anim`}>Café Peregrino</h1>
            <div className={`${styles.entryBadge} promo-anim`}>
              Código de Descuento
            </div>

            <div className={`${styles.formContainer} promo-anim`}>
              <h2 className={styles.inputTitle}>Desbloquea tu Descuento</h2>
              <p className={styles.inputDescription}>
                Ingresa tu código de 6 dígitos para descubrir tu beneficio.
              </p>

              <div className={styles.inputWrapper}>
                <input
                  ref={inputRef}
                  type="text"
                  value={code}
                  onChange={handleInputChange}
                  placeholder="000000"
                  className={`${styles.discountInput} ${isError ? styles.error : ""} ${isShaking ? styles.shaking : ""}`}
                  maxLength={CODE_LENGTH}
                  aria-invalid={isError}
                  aria-describedby="promo-code-error"
                />
                <div
                  id="promo-code-error"
                  role="alert"
                  className={`${styles.errorMessage} ${isError ? styles.visible : ""}`}
                >
                  {isError ? "Código no válido. Intenta de nuevo." : ""}
                </div>
              </div>
              <Link href="/" className={`${styles.homeLink} ${styles.homeLinkOnDark}`}>
                Para saber más sobre nosotros
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS STATE */}
      {matchedDiscount && (
        <div className={styles.successState}>
          <div className={styles.successContainer}>
            <div className={styles.imageWrapper}>
              <div className={styles.speechBubble}>Gracias!</div>
              <Image
                src="/assets/personaje_final.png"
                alt="Personaje Cafe Peregrino"
                width={500}
                height={500}
                className={styles.personajeImage}
                priority
              />
            </div>

            <div className={styles.titleContainer}>
              <div className={styles.cafeTitle}>
                {cafeLetters.map((char, index) => (
                  <span
                    key={`cafe-${index}`}
                    className={styles.letter}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {char}
                  </span>
                ))}
              </div>
              <div className={styles.peregrinoTitle}>
                {peregrinoLetters.map((char, index) => (
                  <span
                    key={`peregrino-${index}`}
                    className={styles.letter}
                    style={{ animationDelay: `${(cafeLetters.length + index) * 0.05}s` }}
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.badge}>
              {matchedDiscount.discount}% OFF
            </div>

            <p className={styles.successText}>
              {matchedDiscount.text}
            </p>
            <p className={styles.successSubtext}>
              {matchedDiscount.subtext}
            </p>

            <div className={styles.ctaWrapper}>
              <a
                href={buildWhatsAppLink(matchedDiscount.whatsapp_message)}
                target="_blank"
                rel="noopener noreferrer"
                className="cta-button"
                onClick={() => sendGAEvent('event', 'whatsapp_redirection', { value: 'promo' })}
              >
                Ir a redimir mi descuento
              </a>
              <Link href="/" className={styles.homeLink}>
                Para saber más sobre nosotros
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
