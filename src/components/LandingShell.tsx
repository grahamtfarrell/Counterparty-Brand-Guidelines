"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { navSections } from "@/brand-kit/config/sections.config";
import { filmCssVariables } from "@/lib/warp/filmCss";
import { defaultTheme } from "@/lib/warp/theme";
import { LandingFilmDefs } from "./LandingFilmDefs";
import { WarpedTextCanvas } from "./WarpedTextCanvas";

export function LandingShell() {
  const [isMobile, setIsMobile] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mobileMq = window.matchMedia("(max-width: 768px)");
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setIsMobile(mobileMq.matches);
      setReduceMotion(motionMq.matches);
    };
    update();
    mobileMq.addEventListener("change", update);
    motionMq.addEventListener("change", update);
    return () => {
      mobileMq.removeEventListener("change", update);
      motionMq.removeEventListener("change", update);
    };
  }, []);

  const film = defaultTheme.film;
  const filmStyle = filmCssVariables(film);

  return (
    <main className="landing-shell">
      <LandingFilmDefs
        film={film}
        mobile={isMobile}
        reduceMotion={reduceMotion}
      />

      <div className="landing-film-source" style={filmStyle}>
        <div className="landing-backdrop">
          <WarpedTextCanvas theme={defaultTheme} interactive />
        </div>
      </div>

      <div className="landing-film-overlay" style={filmStyle} aria-hidden="true" />

      <div className="landing-chrome" data-warp-ignore>
        <nav className="landing-nav" aria-label="Brand kit sections">
          {navSections.map((section) => (
            <Link key={section.slug} href={`/${section.slug}`} className="landing-nav-link">
              {section.label}
            </Link>
          ))}
        </nav>

        <footer className="landing-brand-footer">
          <p className="landing-brand-footer-title">Counterparty Brand Guidelines</p>
          <a
            className="landing-brand-footer-credit"
            href="https://www.infinitefun.art/"
            target="_blank"
            rel="noopener noreferrer"
          >
            By Infinite Fun studio
          </a>
        </footer>
      </div>
    </main>
  );
}
