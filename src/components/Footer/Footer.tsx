import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer id="footer" className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <span className={styles.brandName}>Café Peregrino</span>
          <span className={styles.brandScript}>Café y Esperanza</span>
        </div>
        <p className={styles.tagline}>
          Café de origen · Regiones montañosas del Meta · 1200 - 1600 msnm
        </p>
        <div className={styles.divider} />
        <div className={styles.bottom}>
          <p className={styles.copy}>
            © {new Date().getFullYear()} Café y Esperanza. Todos los derechos
            reservados.
          </p>
          <p className={styles.colombia}>100% Café de Colombia</p>
        </div>
      </div>
    </footer>
  );
}
