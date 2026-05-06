"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { sendGAEvent } from "@next/third-parties/google";
import styles from "./Promo.module.css";

const DISCOUNT_DATABASE = [
  {
    id: "early_buyers_10",
    discount: 10,
    text: "Gracias por tu primera compra, disfruta este descuento en tu próxima compra, exclusivo para ti.",
    subtext: "Comparte en redes para desbloquear un descuento mayor. (Debes enviar captura de pantalla de la publicacion a nuestro whatsapp)",
    discount_code: "NUEVO1",
    whatsapp_message: "Hola, quiero redimir mi descuento del 10%",
  },
  {
    id: "special_20",
    discount: 20,
    text: "¡Felicidades! Has desbloqueado un descuento especial del 20%.",
    subtext: "Comparte en redes para desbloquear un descuento mayor. (Debes enviar captura de pantalla de la publicacion a nuestro whatsapp)",
    discount_code: "CAFE20",
    whatsapp_message: "Hola, quiero redimir mi descuento del 20%",
  },
];

const CODE_LENGTH = 6;

export default function PromoPage() {
  const [code, setCode] = useState("");
  const [isError, setIsError] = useState(false);
  const [matchedDiscount, setMatchedDiscount] = useState<typeof DISCOUNT_DATABASE[0] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle shake animation end to remove the error class
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isError) {
      timeoutId = setTimeout(() => {
        setIsError(false);
      }, 500); // 500ms matches the CSS animation duration
    }
    return () => clearTimeout(timeoutId);
  }, [isError]);

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

  const checkCode = (valueToCheck: string) => {
    const found = DISCOUNT_DATABASE.find((item) => item.discount_code === valueToCheck);

    if (found) {
      setMatchedDiscount(found);
    } else {
      setIsError(true);
      // Optional: Clear input or keep it so user can see what they typed
      // setCode("");
    }
  };

  // Split title for animation
  const cafeLetters = "Café".split("");
  const peregrinoLetters = "Peregrino".split("");

  return (
    <main className={styles.pageContainer}>
      {/* INITIAL STATE */}
      {!matchedDiscount && (
        <div className={styles.formContainer}>
          <h1 className={styles.inputTitle}>Desbloquea tu Descuento</h1>
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
              className={`${styles.discountInput} ${isError ? styles.error : ""}`}
              maxLength={CODE_LENGTH}
              aria-invalid={isError}
            />
            <div className={`${styles.errorMessage} ${isError ? styles.visible : ""}`}>
              Código no válido. Intenta de nuevo.
            </div>
          </div>
          <Link href="/" className={styles.homeLink} style={{ marginTop: '2rem' }}>
            Para saber más sobre nosotros
          </Link>
        </div>
      )}

      {/* SUCCESS STATE */}
      {matchedDiscount && (
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
              href={`https://wa.me/573213611624?text=${encodeURIComponent(matchedDiscount.whatsapp_message)}`}
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
      )}
    </main>
  );
}
