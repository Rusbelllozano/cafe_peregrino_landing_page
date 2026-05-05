"use client";

import Image from "next/image";
import { useGsapFadeUp } from "@/hooks/useGsap";
import styles from "./Products.module.css";

const products = [
  {
    id: "excelso",
    name: "Excelso",
    tagline: "Intenso · Cítrico · Brillante",
    notes: "Notas intensas a cacao y cítricos.",
    roast: "Media",
    grind: "Fina o Grano entero",
    weight: "250 g - 500 g",
    price: "$25.000",
    image: "/assets/cafe_excelso.png",
    accent: "var(--magenta)",
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Suave · Balanceado · Envolvente",
    notes: "Notas a chocolate y cítricos.",
    roast: "Media",
    grind: "Fina o Grano entero",
    weight: "250 g - 500 g",
    price: "$30.000",
    image: "/assets/cafe_premium.png",
    accent: "var(--orange)",
  },
];

export default function Products() {
  const containerRef = useGsapFadeUp(".product-card", {
    stagger: 0.25,
    duration: 0.9,
    y: 60,
  });

  return (
    <section
      id="productos"
      ref={containerRef as React.RefObject<HTMLElement>}
      className={styles.section}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.label}>Café de Origen</p>
          <h2 className={styles.title}>Nuestros Cafés</h2>
          <p className={styles.description}>
            Dos experiencias de sabor cuidadosamente seleccionadas de las
            regiones montañosas del Meta.
          </p>
        </div>
        <div className={styles.grid}>
          {products.map((product) => (
            <article
              key={product.id}
              className={`${styles.card} product-card`}
            >
              <div className={styles.imageWrap}>
                <Image
                  src={product.image}
                  alt={`Café Peregrino ${product.name}`}
                  width={500}
                  height={500}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={styles.image}
                />
              </div>
              <div className={styles.info}>
                <span
                  className={styles.accentLine}
                  style={{ background: product.accent }}
                />
                <h3 className={styles.productName}>{product.name}</h3>
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
                {/* <div className={styles.priceRow}>
                  <span className={styles.price}>{product.price}</span>
                  <span className={styles.priceCurrency}>COP</span>
                </div> */}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
