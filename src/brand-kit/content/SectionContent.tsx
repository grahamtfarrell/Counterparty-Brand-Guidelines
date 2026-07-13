import {
  ColorSection,
  LogoSection,
  PracticalSection,
  TypographySection,
} from "./sections";

type SectionContentProps = {
  slug: string;
};

export function SectionContent({ slug }: SectionContentProps) {
  switch (slug) {
    case "logo":
      return <LogoSection />;
    case "typography":
      return <TypographySection />;
    case "color":
      return <ColorSection />;
    case "examples":
      return <PracticalSection />;
    default:
      return null;
  }
}
