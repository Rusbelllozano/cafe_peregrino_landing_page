export type DiscountResult = {
  id: string;
  discount: number;
  text: string;
  subtext: string;
  whatsapp_message: string;
};

interface DiscountEntry extends DiscountResult {
  discount_code: string;
}

// Only import this module from Route Handlers (e.g. src/app/api/promo/route.ts).
// Importing it from a "use client" component would ship this array to the browser,
// defeating the point of validating codes server-side.
const DISCOUNT_DATABASE: DiscountEntry[] = [
  {
    id: "early_buyers_10",
    discount: 10,
    text: "Gracias por tu primera compra, disfruta este descuento en tu próxima compra, exclusivo para ti.",
    subtext:
      "Comparte en redes para desbloquear un descuento mayor. (Debes enviar captura de pantalla de la publicacion a nuestro whatsapp)",
    discount_code: "NUEVO1",
    whatsapp_message: "Hola, quiero redimir mi descuento del 10%",
  },
  {
    id: "special_20",
    discount: 20,
    text: "¡Felicidades! Has desbloqueado un descuento especial del 20%.",
    subtext:
      "Comparte en redes para desbloquear un descuento mayor. (Debes enviar captura de pantalla de la publicacion a nuestro whatsapp)",
    discount_code: "CAFE20",
    whatsapp_message: "Hola, quiero redimir mi descuento del 20%",
  },
];

export function findDiscountByCode(code: string): DiscountResult | null {
  const found = DISCOUNT_DATABASE.find((item) => item.discount_code === code);
  if (!found) return null;
  const { discount_code: _discount_code, ...rest } = found;
  return rest;
}
