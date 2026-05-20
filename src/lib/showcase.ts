export type ShowcaseItem = Readonly<{
  title: string;
  segment: string;
  style: string;
  imageSrc: string;
}>;

export const showcaseItems: ShowcaseItem[] = [
  {
    title: "Psicologia Premium",
    segment: "Psicologia",
    style: "Acolhedor premium",
    imageSrc: "/showcase/psicologia-01.png"
  },
  {
    title: "Fisioterapia Premium",
    segment: "Fisioterapia",
    style: "Saude profissional",
    imageSrc: "/showcase/fisioterapia-01.png"
  },
  {
    title: "Transportadora",
    segment: "Logistica",
    style: "Institucional forte",
    imageSrc: "/showcase/transportadora-01.png"
  },
  {
    title: "Oficina Automotiva",
    segment: "Automotivo",
    style: "Performance",
    imageSrc: "/showcase/automotivo-01.png"
  },
  {
    title: "Advocacia",
    segment: "Juridico",
    style: "Sobrio profissional",
    imageSrc: "/showcase/advocacia-01.png"
  },
  {
    title: "Odontologia",
    segment: "Saude",
    style: "Premium limpo",
    imageSrc: "/showcase/odontologia-01.png"
  }
];
