export interface Credit {
  title: string;
  author: string;
  authorUrl: string;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
}

const CC_BY_4 = "https://creativecommons.org/licenses/by/4.0/";

export const CREDITS: Credit[] = [
  {
    title: "Modern PC Desk Setup - 3D Model",
    author: "Fahriyan Fikri Pradana",
    authorUrl: "https://sketchfab.com/fahriyanfikripradana11",
    sourceUrl: "https://sketchfab.com/fahriyanfikripradana11",
    license: "CC BY 4.0",
    licenseUrl: CC_BY_4,
  },
  {
    title: "Simple animated book",
    author: "Zayfert1999",
    authorUrl: "https://sketchfab.com/Zayfert1999",
    sourceUrl: "https://sketchfab.com/3d-models/simple-animated-book-ed83e749b47c4703be85d56539ee9f2e",
    license: "CC-BY-4.0",
    licenseUrl: CC_BY_4,
  },
];

export function formatAttribution(c: Credit): string {
  return `"${c.title}" by ${c.author} is licensed under ${c.license}`;
}
