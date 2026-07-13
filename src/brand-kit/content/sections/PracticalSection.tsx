"use client";

import type { ReactNode } from "react";
import {
  practicalAssets,
  practicalCopy,
} from "../../config/practical.content";

function FullBleedVideo({
  src,
  label,
  preload = "metadata",
}: {
  src: string;
  label: string;
  preload?: "auto" | "metadata" | "none";
}) {
  return (
    <div className="practical-full-video" aria-label={label}>
      <video
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: "center" }}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        preload={preload}
      />
    </div>
  );
}

function InlineVideo({
  src,
  className,
  label,
}: {
  src: string;
  className?: string;
  label: string;
}) {
  return (
    <video
      className={className}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={label}
    />
  );
}

function BrandCaption({ children }: { children: ReactNode }) {
  return <p className="practical-caption">{children}</p>;
}

export function PracticalSection() {
  return (
    <div className="practical-page">
      <FullBleedVideo
        src={practicalAssets.hero}
        label="Counterparty brand film"
        preload="auto"
      />

      <div className="practical-content">
        <section className="practical-section practical-section--tight w-full">
          <InlineVideo
            src={practicalAssets.logoUpdate}
            className="practical-media-centered max-w-[min(39rem,100%)] rounded-lg"
            label="Counterparty logo update"
          />
          <BrandCaption>{practicalCopy.logoUpdate}</BrandCaption>
        </section>

        <section className="practical-section practical-section--tight w-full">
          <InlineVideo
            src={practicalAssets.overlay}
            className="block h-auto w-full"
            label="Counterparty overlay"
          />
        </section>

        <section className="practical-section practical-section--tight w-full">
          <InlineVideo
            src={practicalAssets.siteFinal}
            className="block h-auto w-full"
            label="Counterparty site final"
          />
        </section>

        <section className="practical-section practical-section--tight w-full">
          <InlineVideo
            src={practicalAssets.cleanTimer}
            className="block h-auto w-full"
            label="Counterparty clean timer"
          />
        </section>

        <section className="practical-section practical-section--gap w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={practicalAssets.ticker}
            alt="Counterparty ticker logo"
            className="practical-media-centered max-w-[min(39rem,100%)]"
            loading="lazy"
          />
          <BrandCaption>{practicalCopy.ticker}</BrandCaption>
        </section>
      </div>

      <section className="practical-footer-video" aria-label="Counterparty brand film">
        <FullBleedVideo src={practicalAssets.footer} label="Counterparty footer film" />
      </section>

      <div className="practical-footer-gap" aria-hidden="true" />

      <section className="w-full overflow-hidden" aria-label="Counterparty logo film">
        <FullBleedVideo src={practicalAssets.cLogo} label="Counterparty C logo film" />
      </section>
    </div>
  );
}
