"use client";
import React, { useState } from "react";
import type { Lang } from "@/types/chart";
import { copy } from "@/lib/copy";

type SiteHeaderProps = {
  lang: Lang;
  setLang: React.Dispatch<React.SetStateAction<Lang>>;
  scrolled: boolean;
  onNavigate: (id: string) => void;
  loggedInName?: string | null;
};

export function SiteHeader({
  lang,
  setLang,
  scrolled,
  onNavigate,
  loggedInName,
}: SiteHeaderProps) {
  const t = copy[lang];
  const [menuOpen, setMenuOpen] = useState(false);

  function handleNav(id: string) {
    setMenuOpen(false);
    onNavigate(id);
  }

  return (
    <header className={`siteHeader ${scrolled ? "siteHeaderScrolled" : ""}`}>
      <button
        type="button"
        className="brandButton"
        onClick={() => handleNav("top")}
        aria-label="Kiron Code"
      >
        <span className="brandMark">K</span>
        <span className="brandText">Kiron Code</span>
      </button>

      <nav className="siteNav" aria-label="Primary">
        <button type="button" className="navAction" onClick={() => handleNav("chart")}>
          {t.nav.chart}
        </button>
        <button type="button" className="navAction" onClick={() => handleNav("results")}>
          {t.nav.results}
        </button>
        <button type="button" className="navAction" onClick={() => handleNav("productos")}>
          {t.nav.premium}
        </button>
        <a href="/mi-galaxia" className="navAction" style={{ textDecoration: "none" }}>
          {loggedInName ? loggedInName : t.nav.myChart}
        </a>
      </nav>

      <button
        type="button"
        className="hamburgerButton"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
      >
        {menuOpen ? "✕" : "☰"}
      </button>

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

      {menuOpen && (
        <div className="mobileMenu">
          <button type="button" className="navAction" onClick={() => handleNav("chart")}>
            {t.nav.chart}
          </button>
          <button type="button" className="navAction" onClick={() => handleNav("results")}>
            {t.nav.results}
          </button>
          <button type="button" className="navAction" onClick={() => handleNav("productos")}>
            {t.nav.premium}
          </button>
          <a
            href="/mi-galaxia"
            className="navAction"
            style={{ textDecoration: "none" }}
            onClick={() => setMenuOpen(false)}
          >
            {loggedInName ? loggedInName : t.nav.myChart}
          </a>
        </div>
      )}
    </header>
  );
}