export type SectionDefinition = {
  id: string;
  slug: string;
  label: string;
  title: string;
};

/** Top menu — order matches landing chrome. */
export const navSections: SectionDefinition[] = [
  {
    id: "logo",
    slug: "logo",
    label: "Logo",
    title: "Logo System",
  },
  {
    id: "typography",
    slug: "typography",
    label: "Typography",
    title: "Typography",
  },
  {
    id: "color",
    slug: "color",
    label: "Color",
    title: "Color",
  },
  {
    id: "examples",
    slug: "examples",
    label: "Examples",
    title: "Examples",
  },
];

export function getSectionBySlug(slug: string) {
  return navSections.find((section) => section.slug === slug);
}

export function getAllSlugs() {
  return navSections.map((section) => section.slug);
}
