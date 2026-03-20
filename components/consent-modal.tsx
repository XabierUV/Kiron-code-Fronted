"use client";

import { useState } from "react";
import Link from "next/link";
import type { Lang } from "@/types/chart";

export type ConsentData = {
  deliveryEmail?: string;
  marketingConsent: boolean;
};

type ConsentModalProps = {
  lang: Lang;
  onConfirm: (data: ConsentData) => void;
  onCancel: () => void;
};

export function ConsentModal({ lang, onConfirm, onCancel }: ConsentModalProps) {
  const [withdrawalAccepted, setWithdrawalAccepted] = useState(false);
  const [differentEmail, setDifferentEmail] = useState(false);
  const [deliveryEmail, setDeliveryEmail] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);

  const isEmailValid = !differentEmail || (deliveryEmail.trim().length > 0 && deliveryEmail.includes("@"));
  const canConfirm = withdrawalAccepted && isEmailValid;

  const t = lang === "en"
    ? {
        title: "Before you continue",
        withdrawal: (
          <>
            I understand this is a digital product delivered immediately. By
            completing the purchase I waive my 14-day withdrawal right under
            Article 103(m) of Royal Decree Legislative 1/2007. I accept the{" "}
            <Link href="/terminos-y-condiciones" className="consentLink" target="_blank">
              Terms and Conditions
            </Link>{" "}
            and the{" "}
            <Link href="/politica-de-privacidad" className="consentLink" target="_blank">
              Privacy Policy
            </Link>{" "}
            of Kiron Code.
          </>
        ),
        differentEmail: "I want to receive my report at a different email address than the one used for payment.",
        emailPlaceholder: "Delivery email",
        marketing: "I agree to receive content about psychological astrology, news and offers from Kiron Code. I can unsubscribe at any time.",
        confirm: "Proceed to payment",
        cancel: "Cancel",
      }
    : {
        title: "Antes de continuar",
        withdrawal: (
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
        differentEmail: "Quiero recibir mi informe en un email diferente al usado en el pago.",
        emailPlaceholder: "Email de entrega",
        marketing: "Acepto recibir contenido sobre astrología psicológica, novedades y ofertas de Kiron Code. Puedo darme de baja en cualquier momento.",
        confirm: "Continuar al pago",
        cancel: "Cancelar",
      };

  function handleConfirm() {
    onConfirm({
      deliveryEmail: differentEmail && deliveryEmail.trim() ? deliveryEmail.trim() : undefined,
      marketingConsent,
    });
  }

  return (
    <div className="consentOverlay" onClick={onCancel}>
      <div
        className="consentModal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <p className="miniLabel" style={{ margin: "0 0 22px" }}>
          {t.title}
        </p>

        {/* Checkbox 1 — obligatorio */}
        <label className="consentLabel">
          <input
            type="checkbox"
            className="consentCheckbox"
            checked={withdrawalAccepted}
            onChange={(e) => setWithdrawalAccepted(e.target.checked)}
          />
          <span className="consentText">{t.withdrawal}</span>
        </label>

        {/* Checkbox 2 — email diferente (opcional) */}
        <label className="consentLabel" style={{ marginTop: "16px" }}>
          <input
            type="checkbox"
            className="consentCheckbox"
            checked={differentEmail}
            onChange={(e) => setDifferentEmail(e.target.checked)}
          />
          <span className="consentText">{t.differentEmail}</span>
        </label>

        {differentEmail && (
          <div style={{ marginTop: "10px", paddingLeft: "32px" }}>
            <input
              type="email"
              className="fieldInput"
              placeholder={t.emailPlaceholder}
              value={deliveryEmail}
              onChange={(e) => setDeliveryEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
        )}

        {/* Checkbox 3 — marketing (opcional) */}
        <label className="consentLabel" style={{ marginTop: "16px" }}>
          <input
            type="checkbox"
            className="consentCheckbox"
            checked={marketingConsent}
            onChange={(e) => setMarketingConsent(e.target.checked)}
          />
          <span className="consentText">{t.marketing}</span>
        </label>

        <div className="consentActions">
          <button
            type="button"
            className="consentConfirm"
            disabled={!canConfirm}
            onClick={handleConfirm}
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
