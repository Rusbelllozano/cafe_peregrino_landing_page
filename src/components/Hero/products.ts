export type Product = {
  id: string;
  name: string;
  tagline: string;
  notes: string;
  roast: string;
  grind: string;
  weight: string;
  image: string;
  accent: string;
  whatsappMessage: string;
};

export const products: Product[] = [
  {
    id: "excelso",
    name: "Excelso",
    tagline: "Intenso · Cítrico · Brillante",
    notes: "Notas intensas a cacao y cítricos.",
    roast: "Media",
    grind: "Fina o Grano entero",
    weight: "250 g - 500 g",
    image: "/assets/cafe_excelso.png",
    accent: "var(--magenta)",
    whatsappMessage: "Hola, quiero pedir el Café Peregrino Excelso",
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Suave · Balanceado · Envolvente",
    notes: "Notas a chocolate y cítricos.",
    roast: "Media",
    grind: "Fina o Grano entero",
    weight: "250 g - 500 g",
    image: "/assets/cafe_premium.png",
    accent: "var(--orange)",
    whatsappMessage: "Hola, quiero pedir el Café Peregrino Premium",
  },
];
