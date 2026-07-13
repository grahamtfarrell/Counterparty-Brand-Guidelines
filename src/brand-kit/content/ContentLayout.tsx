"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BackHome } from "../components/BackHome";

type ContentLayoutProps = {
  slug: string;
  children: ReactNode;
};

export function ContentLayout({ slug, children }: ContentLayoutProps) {
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        router.push("/");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  const isSlideDeck =
    slug === "logo" || slug === "typography" || slug === "color";
  const isExamples = slug === "examples";
  const maxWidth = isExamples
    ? "100%"
    : isSlideDeck
      ? "min(1680px, 96vw)"
      : "780px";

  if (isExamples) {
    return (
      <div className="content-page content-page--practical">
        <div className="practical-back">
          <BackHome />
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="content-page">
      <main
        className={`mx-auto py-24 ${isSlideDeck ? "px-3 sm:px-5" : "px-6"}`}
        style={{ maxWidth }}
      >
        <BackHome />
        {children}
      </main>
    </div>
  );
}
