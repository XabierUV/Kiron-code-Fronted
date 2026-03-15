import React from "react";
import type { Lang } from "@/types/chart";
import { copy } from "@/lib/copy";

type ChartFormProps = {
  lang: Lang;
  name: string;
  birthDate: string;
  birthTime: string;
  birthCity: string;
  birthCountry: string;
  loading: boolean;
  formMessage: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  setBirthDate: React.Dispatch<React.SetStateAction<string>>;
  setBirthTime: React.Dispatch<React.SetStateAction<string>>;
  setBirthCity: React.Dispatch<React.SetStateAction<string>>;
  setBirthCountry: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function ChartForm({
  lang,
  name,
  birthDate,
  birthTime,
  birthCity,
  birthCountry,
  loading,
  formMessage,
  setName,
  setBirthDate,
  setBirthTime,
  setBirthCity,
  setBirthCountry,
  onSubmit,
}: ChartFormProps) {
  const t = copy[lang];

  return (
    <section className="contentSection" id="chart">
      <div className="sectionIntro">
        <p className="sectionLabel">{t.form.sectionLabel}</p>
        <h2 className="sectionTitle">{t.form.title}</h2>
        <p className="sectionText">{t.form.subtitle}</p>
      </div>

      <form className="birthForm" onSubmit={onSubmit}>
        <div className="fieldBlock">
          <label className="fieldLabel" htmlFor="name">
            {t.form.name}
          </label>
          <input
            id="name"
            className="fieldInput"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t.form.placeholders.name}
            autoComplete="name"
          />
        </div>

        <div className="fieldGrid">
          <div className="fieldBlock">
            <label className="fieldLabel" htmlFor="birthDate">
              {t.form.birthDate}
            </label>
            <input
              id="birthDate"
              className="fieldInput"
              type="date"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
            />
          </div>

          <div className="fieldBlock">
            <label className="fieldLabel" htmlFor="birthTime">
              {t.form.birthTime}
            </label>
            <input
              id="birthTime"
              className="fieldInput"
              type="time"
              value={birthTime}
              onChange={(event) => setBirthTime(event.target.value)}
            />
          </div>
        </div>

        <div className="fieldGrid">
          <div className="fieldBlock">
            <label className="fieldLabel" htmlFor="birthCity">
              {t.form.birthCity}
            </label>
            <input
              id="birthCity"
              className="fieldInput"
              value={birthCity}
              onChange={(event) => setBirthCity(event.target.value)}
              placeholder={t.form.placeholders.city}
              autoComplete="address-level2"
            />
          </div>

          <div className="fieldBlock">
            <label className="fieldLabel" htmlFor="birthCountry">
              {t.form.birthCountry}
            </label>
            <input
              id="birthCountry"
              className="fieldInput"
              value={birthCountry}
              onChange={(event) => setBirthCountry(event.target.value)}
              placeholder={t.form.placeholders.country}
              autoComplete="country-name"
            />
          </div>
        </div>

        <div className="formActions">
          <button type="submit" className="primaryButton" disabled={loading}>
            {loading ? t.form.loading : t.form.submit}
          </button>
        </div>

        {formMessage ? <p className="formMessage">{formMessage}</p> : null}

        <p className="formHelper">{t.form.helper}</p>
      </form>
    </section>
  );
}