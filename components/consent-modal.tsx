"use client";

import { useState } from "react";
import Link from "next/link";
import type { Lang } from "@/types/chart";

type ConsentModalProps = {
  lang: Lang;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConsentModal({ lang, onConfirm, onCancel }: ConsentModalProps) {
  const [checked, setChecked] = useState(false);

  const t = {
    es: {
      title: "Antes de continuar",
      checkboxText: (
        <>
          Entiendo que este es un producto digital que se entrega de forma
          inmediata. Al completar la compra pierdo mi derecho de desistimiento
          de 14 días conforme al artículo 103.m) del Real Decreto Legislativo
          1/2007. Acepto los{" "}
          <Link href="/terminos-y-condiciones" className="consentLink" target="_blank">
            Términos y Condiciones
          </Link>{" "}
          y la{" "}
          <Link href="/politica-de-privacidad" className="consentLink" target="_blank">
            Política de Privacidad
          </Link>{" "}
          de Kiron Code.
        </>
      ),
      confirm: "Continuar al pago",
      cancel: "Cancelar",
    },
    en: {
      title: "Before you continue",
      checkboxText: (
        <>
          I understand this is a digital product delivered immediately. By
          completing the purchase I waive my 14-day withdrawal right under
          Article 103(m) of Royal Decree Legislative 1/2007. I accept the{" "}
          <Link href="/terminos-y-condiciones" className="consentLink" target="_blank">
            Terms and Conditions
          </Link>{" "}
          and{" "}
          <Link href="/politica-de-privacidad" className="consentLink" target="_blank">
            Privacy Policy
          </Link>{" "}
          of Kiron Code.
        </>
      ),
      confirm: "Proceed to payment",
      cancel: "Cancel",
    },
  }[lang];

  return (
    <div className="consentOverlay" onClick={onCancel}>
      <div
        className="consentModal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-title"
      >
        <p className="miniLabel" style={{ margin: "0 0 18px" }}>
          {t.title}
        </p>

        <label className="consentLabel">
          <input
            type="checkbox"
            className="consentCheckbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <span className="consentText">{t.checkboxText}</span>
        </label>

        <div className="consentActions">
          <button
            type="button"
            className="consentConfirm"
            disabled={!checked}
            onClick={onConfirm}
          >
            {t.confirm}
          </button>
          <button type="button" className="consentCancel" onClick={onCancel}>
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}
