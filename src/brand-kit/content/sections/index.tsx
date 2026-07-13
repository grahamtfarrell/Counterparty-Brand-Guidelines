import Image from "next/image";
import { colorSlides } from "../../config/color.content";
import { logoSlides } from "../../config/logo.content";
import { typographySlides } from "../../config/typography.content";

export { PracticalSection } from "./PracticalSection";

type SlideBlockProps = {
  src: string;
  width: number;
  height: number;
  alt: string;
  priority?: boolean;
};

export function SlideBlock({ src, width, height, alt, priority }: SlideBlockProps) {
  return (
    <figure className="mb-[clamp(2rem,4vw,3rem)] w-full">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="h-auto w-full"
        loading={priority ? "eager" : "lazy"}
        quality={95}
        sizes="(max-width: 768px) 100vw, min(1680px, 96vw)"
      />
    </figure>
  );
}

export function LogoSection() {
  return (
    <div className="-mx-2 sm:mx-0">
      {logoSlides.map((slide, index) => (
        <SlideBlock
          key={slide.src}
          src={slide.src}
          width={slide.width}
          height={slide.height}
          alt={slide.alt}
          priority={index === 0}
        />
      ))}
    </div>
  );
}

export function TypographySection() {
  return (
    <div className="-mx-2 sm:mx-0">
      {typographySlides.map((slide, index) => (
        <SlideBlock
          key={slide.src}
          src={slide.src}
          width={slide.width}
          height={slide.height}
          alt={slide.alt}
          priority={index === 0}
        />
      ))}
    </div>
  );
}

export function ColorSection() {
  return (
    <div className="-mx-2 sm:mx-0">
      {colorSlides.map((slide, index) => (
        <SlideBlock
          key={slide.src}
          src={slide.src}
          width={slide.width}
          height={slide.height}
          alt={slide.alt}
          priority={index === 0}
        />
      ))}
    </div>
  );
}
