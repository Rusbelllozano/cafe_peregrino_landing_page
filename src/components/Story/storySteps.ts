export type StoryStep = {
  image: string;
  alt: string;
  caption: string;
};

export const storySteps: StoryStep[] = [
  {
    image: "/assets/coffe_background.jpg",
    alt: "Amanecer sobre las montañas cafeteras del Meta",
    caption: "Origen · 550 msnm",
  },
  {
    image: "/assets/story_mountains.png",
    alt: "Cafetales en las montañas del Meta",
    caption: "El Cafetal",
  },
  {
    image: "/assets/personaje_final.png",
    alt: "El peregrino, personaje de la marca Café Peregrino",
    caption: "El Peregrino",
  },
  {
    image: "/assets/cafe_excelso.png",
    alt: "Café Peregrino Excelso listo para servir",
    caption: "Tu Taza",
  },
];
