"use client";
import React from "react";
import type { Lang } from "@/types/chart";
import { copy } from "@/lib/copy";

type SiteHeaderProps = {
  lang: Lang;
  setLang: React.Dispatch<React.SetStateAction<Lang>>;
  scrolled: boolean;
  onNavigate: (id: string) => void;
};

export function SiteHeader({
  lang,
  setLang,
  scrolled,
  onNavigate,
}: SiteHeaderProps) {
  const t = copy[lang];

  return (
    <header className={`siteHeader ${scrolled ? "siteHeaderScrolled" : ""}`}>
      <button
        type="button"
        className="brandButton"
        onClick={() => onNavigate("top")}
        aria-label="Kiron Code"
      >
        <span className="brandMark">K</span>
        <span className="brandText">Kiron Code</span>
      </button>

      <nav className="siteNav" aria-label="Primary">
        <button
          type="button"
          className="navAction"
          onClick={() => onNavigate("chart")}
        >
          {t.nav.chart}
        </button>
        <button
          type="button"
          className="navAction"
          onClick={() => onNavigate("results")}
        >
          {t.nav.results}
        </button>
        <button
          type="button"
          className="navAction"
          onClick={() => onNavigate("premium")}
        >
          {t.nav.premium}
        </button>
      </nav>

      <div className="langSwitch" role="group" aria-label="Language switch">
        <button
          type="button"
          className={`langButton ${lang === "es" ? "active" : ""}`}
          onClick={() => setLang("es")}
        >
          ES
        </button>
        <button
          type="button"
          className={`langButton ${lang === "en" ? "active" : ""}`}
          onClick={() => setLang("en")}
        >
          EN
        </button>
      </div>
    </header>
  );
}