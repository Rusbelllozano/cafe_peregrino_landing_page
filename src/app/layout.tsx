import type { Metadata } from "next";
import { Bebas_Neue, Montserrat, Pacifico } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pacifico",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Café Peregrino — Café de Origen | Regiones Montañosas del Meta",
  description:
    "Un café con pasos de peregrino, buscando a aquel que lo creó. Café de origen de las regiones montañosas del Meta, 550 msnm. Lote limitado, primera edición.",
  keywords: [
    "café de origen",
    "café colombiano",
    "café peregrino",
    "café premium",
    "specialty coffee",
    "café artesanal",
    "Meta Colombia",
  ],
  openGraph: {
    title: "Café Peregrino — Café de Origen",
    description:
      "Un café con pasos de peregrino, buscando a aquel que lo creó. Regiones montañosas del Meta, 550 msnm.",
    type: "website",
    locale: "es_CO",
    images: [
      {
        url: "/assets/coffe_background.jpg",
        width: 5862,
        height: 4090,
        alt: "Cafetales en las regiones montañosas del Meta, Colombia",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${bebasNeue.variable} ${montserrat.variable} ${pacifico.variable}`}
    >
      <body>{children}</body>
      <GoogleAnalytics gaId="G-GW460SJP82" />
    </html>
  );
}
