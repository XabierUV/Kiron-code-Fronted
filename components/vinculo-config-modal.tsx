"use client";

import { useState } from "react";
import type { Lang } from "@/types/chart";

export type VinculoRelationship =
  | "ROMANTIC_PARTNER"
  | "PARENT"
  | "CHILD"
  | "SIBLING"
  | "FRIENDSHIP"
  | "PROFESSIONAL";

export type VinculoData = {
  relationship: VinculoRelationship;
  // Option A — existing Kiron Code customer
  personBId?: string;
  // Option B — manual data
  person2Name?: string;
  person2BirthDate?: string;
  person2BirthTime?: string;
  person2BirthCity?: string;
  consentConfirmed: boolean;
};

type VinculoConfigModalProps = {
  lang: Lang;
  onConfirm: (data: VinculoData) => void;
  onCancel: () => void;
};

const RELATIONSHIPS: { key: VinculoRelationship; es: string; en: string }[] = [
  { key: "ROMANTIC_PARTNER", es: "Pareja romántica",    en: "Romantic partner" },
  { key: "PARENT",           es: "Padre o Madre",       en: "Father or Mother" },
  { key: "CHILD",            es: "Hijo o Hija",         en: "Son or Daughter" },
  { key: "SIBLING",          es: "Hermano o Hermana",   en: "Brother or Sister" },
  { key: "FRIENDSHIP",       es: "Amistad profunda",    en: "Deep friendship" },
  { key: "PROFESSIONAL",     es: "Socio profesional",   en: "Professional partner" },
];

export function VinculoConfigModal({ lang, onConfirm, onCancel }: VinculoConfigModalProps) {
  const [relationship, setRelationship] = useState<VinculoRelationship | "">("");
  const [useGalaxyId, setUseGalaxyId] = useState<boolean | null>(null);
  const [personBId, setPersonBId] = useState("");
  const [person2Name, setPerson2Name] = useState("");
  const [person2BirthDate, setPerson2BirthDate] = useState("");
  const [person2BirthTime, setPerson2BirthTime] = useState("");
  const [person2BirthCity, setPerson2BirthCity] = useState("");
  const [consentConfirmed, setConsentConfirmed] = useState(false);

  const isFormValid =
    relationship !== "" &&
    useGalaxyId !== null &&
    (useGalaxyId
      ? personBId.trim().length > 0
      : person2Name.trim() && person2BirthDate && person2BirthCity.trim()) &&
    consentConfirmed;

  const personName = person2Name.trim() || (lang === "en" ? "this person" : "esta persona");

  const t = lang === "en"
    ? {
        title: "The Bond — configuration",
        step1: "Relationship type",
        step2: "Second person's data",
        optionA: "This person is a Kiron Code customer",
        optionALabel: "Galaxy ID",
        optionAPlaceholder: "KC-XXXXX",
        optionB: "I'll enter their data",
        name: "Name",
        namePlaceholder: "Full name",
        birthDate: "Date of birth",
        birthTime: "Time of birth",
        birthCity: "City of birth",
        birthCityPlaceholder: "City, Country",
        consentText: (name: string) =>
          `I confirm I have ${name}'s consent to use their birth data for this analysis.`,
        confirm: "Continue",
        cancel: "Cancel",
      }
    : {
        title: "El Vínculo — configuración",
        step1: "Tipo de vínculo",
        step2: "Datos de la segunda persona",
        optionA: "Esta persona es cliente de Kiron Code",
        optionALabel: "ID de Galaxia",
        optionAPlaceholder: "KC-XXXXX",
        optionB: "Introduzco sus datos",
        name: "Nombre",
        namePlaceholder: "Nombre completo",
        birthDate: "Fecha de nacimiento",
        birthTime: "Hora de nacimiento",
        birthCity: "Ciudad de nacimiento",
        birthCityPlaceholder: "Ciudad, País",
        consentText: (name: string) =>
          `Confirmo que tengo el consentimiento de ${name} para usar sus datos de nacimiento en este análisis.`,
        confirm: "Continuar",
        cancel: "Cancelar",
      };

  function handleConfirm() {
    if (!isFormValid || !relationship) return;
    onConfirm({
      relationship,
      personBId: useGalaxyId && personBId.trim() ? personBId.trim() : undefined,
      person2Name: !useGalaxyId && person2Name.trim() ? person2Name.trim() : undefined,
      person2BirthDate: !useGalaxyId ? person2BirthDate : undefined,
      person2BirthTime: !useGalaxyId && person2BirthTime ? person2BirthTime : undefined,
      person2BirthCity: !useGalaxyId && person2BirthCity.trim() ? person2BirthCity.trim() : undefined,
      consentConfirmed: true,
    });
  }

  return (
    <div className="consentOverlay" onClick={onCancel}>
      <div
        className="consentModal"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <p className="miniLabel" style={{ margin: "0 0 22px" }}>
          {t.title}
        </p>

        {/* Step 1 — relationship type */}
        <p className="fieldLabel">{t.step1}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "22px" }}>
          {RELATIONSHIPS.map((r) => (
            <label key={r.key} className="consentLabel" style={{ alignItems: "center" }}>
              <input
                type="radio"
                className="consentCheckbox"
                name="relationship"
                checked={relationship === r.key}
                onChange={() => setRelationship(r.key)}
              />
              <span className="consentText">{lang === "en" ? r.en : r.es}</span>
            </label>
          ))}
        </div>

        {/* Step 2 — second person data */}
        <p className="fieldLabel">{t.step2}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "18px" }}>
          <label className="consentLabel" style={{ alignItems: "center" }}>
            <input
              type="radio"
              className="consentCheckbox"
              name="personDataType"
              checked={useGalaxyId === true}
              onChange={() => setUseGalaxyId(true)}
            />
            <span className="consentText">{t.optionA}</span>
          </label>

          {useGalaxyId === true && (
            <div style={{ paddingLeft: "32px" }}>
              <label className="fieldLabel" htmlFor="personBId">{t.optionALabel}</label>
              <input
                id="personBId"
                type="text"
                className="fieldInput"
                placeholder={t.optionAPlaceholder}
                value={personBId}
                onChange={(e) => setPersonBId(e.target.value)}
              />
            </div>
          )}

          <label className="consentLabel" style={{ alignItems: "center" }}>
            <input
              type="radio"
              className="consentCheckbox"
              name="personDataType"
              checked={useGalaxyId === false}
              onChange={() => setUseGalaxyId(false)}
            />
            <span className="consentText">{t.optionB}</span>
          </label>

          {useGalaxyId === false && (
            <div style={{ paddingLeft: "32px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <label className="fieldLabel">{t.name}</label>
                <input
                  type="text"
                  className="fieldInput"
                  placeholder={t.namePlaceholder}
                  value={person2Name}
                  onChange={(e) => setPerson2Name(e.target.value)}
                />
              </div>
              <div>
                <label className="fieldLabel">{t.birthDate}</label>
                <input
                  type="date"
                  className="fieldInput"
                  value={person2BirthDate}
                  onChange={(e) => setPerson2BirthDate(e.target.value)}
                />
              </div>
              <div>
                <label className="fieldLabel">{t.birthTime}</label>
                <input
                  type="time"
                  className="fieldInput"
                  value={person2BirthTime}
                  onChange={(e) => setPerson2BirthTime(e.target.value)}
                />
              </div>
              <div>
                <label className="fieldLabel">{t.birthCity}</label>
                <input
                  type="text"
                  className="fieldInput"
                  placeholder={t.birthCityPlaceholder}
                  value={person2BirthCity}
                  onChange={(e) => setPerson2BirthCity(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Consent checkbox */}
        <label className="consentLabel">
          <input
            type="checkbox"
            className="consentCheckbox"
            checked={consentConfirmed}
            onChange={(e) => setConsentConfirmed(e.target.checked)}
          />
          <span className="consentText">{t.consentText(personName)}</span>
        </label>

        <div className="consentActions">
          <button
            type="button"
            className="consentConfirm"
            disabled={!isFormValid}
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
