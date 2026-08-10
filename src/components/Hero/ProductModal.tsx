"use client";

import type { Ref } from "react";
import Image from "next/image";
import { sendGAEvent } from "@next/third-parties/google";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import type { Product } from "./products";
import styles from "./ProductModal.module.css";

type Props = {
  product: Product;
  ref?: Ref<HTMLDialogElement>;
};

export default function ProductModal({ product, ref }: Props) {
  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={`${product.id}-modal-title`}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          event.currentTarget.close();
        }
      }}
    >
      <div className={styles.content}>
        <button
          type="button"
          className={styles.close}
          aria-label="Cerrar"
          onClick={(event) => event.currentTarget.closest("dialog")?.close()}
        >
          ×
        </button>
        <div className={styles.imageWrap}>
          <Image
            src={product.image}
            alt={`Café Peregrino ${product.name}`}
            width={400}
            height={400}
            className={styles.image}
          />
        </div>
        <span
          className={styles.accentLine}
          style={{ background: product.accent }}
        />
        <h3 className={styles.name} id={`${product.id}-modal-title`}>{product.name}</h3>
        <p className={styles.tagline}>{product.tagline}</p>
        <p className={styles.notes}>{product.notes}</p>
        <div className={styles.specs}>
          <div className={styles.spec}>
            <span className={styles.specLabel}>Tostión</span>
            <span className={styles.specValue}>{product.roast}</span>
          </div>
          <div className={styles.spec}>
            <span className={styles.specLabel}>Molienda</span>
            <span className={styles.specValue}>{product.grind}</span>
          </div>
          <div className={styles.spec}>
            <span className={styles.specLabel}>Cont. Neto</span>
            <span className={styles.specValue}>{product.weight}</span>
          </div>
        </div>
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
    </dialog>
  );
}
