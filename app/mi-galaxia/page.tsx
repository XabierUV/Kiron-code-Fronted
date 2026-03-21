"use client";

import { useState, useEffect, useCallback } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  authRegister,
  authLogin,
  authForgotPassword,
  authResetPassword,
  authChangePassword,
  fetchPortal,
  createCheckout,
} from "@/lib/api";
import type { Lang } from "@/types/chart";
import { ConsentModal, type ConsentData } from "@/components/consent-modal";
import { VinculoConfigModal, type VinculoData } from "@/components/vinculo-config-modal";

type View = "login" | "register" | "forgot" | "reset" | "portal" | "changePassword";

type PortalData = {
  email: string;
  galaxyId: string;
  name: string | null;
  chiron: { sign: string; house: number; degree: number };
  chartId: string | null;
  reportId: string | null;
  products: Array<{ productType: string; name: string; pdfUrl: string | null }>;
};

type PwReqs = {
  length: boolean;
  upper: boolean;
  lower: boolean;
  number: boolean;
  special: boolean;
};

function checkPw(pw: string): PwReqs {
  return {
    length: pw.length >= 10,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[!@#$%^&*\-_]/.test(pw),
  };
}

function allValid(r: PwReqs) {
  return r.length && r.upper && r.lower && r.number && r.special;
}

const CATALOG = [
  { key: "CHIRON",        name: "La Herida y el Don",  nameEn: "The Wound and the Gift", price: "19€",    requiresKey: null },
  { key: "NATAL_CHART",   name: "Tu Mapa Interior",    nameEn: "Your Inner Map",          price: "39€",    requiresKey: "CHIRON" },
  { key: "COMPATIBILITY", name: "El Vínculo",          nameEn: "The Bond",                price: "59€",    requiresKey: "NATAL_CHART" },
  { key: "SUBSCRIPTION",  name: "Kiron Vivo",          nameEn: "Kiron Vivo",              price: "9€/mes", requiresKey: null },
];

function PwRequirements({ reqs, lang }: { reqs: PwReqs; lang: Lang }) {
  const items = [
    { key: "length",  es: "10 caracteres mínimo",              en: "10 characters minimum" },
    { key: "upper",   es: "1 mayúscula",                       en: "1 uppercase letter" },
    { key: "lower",   es: "1 minúscula",                       en: "1 lowercase letter" },
    { key: "number",  es: "1 número",                          en: "1 number" },
    { key: "special", es: "1 carácter especial (!@#$%^&*-_)",  en: "1 special character (!@#$%^&*-_)" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "8px" }}>
      {items.map((item) => {
        const met = reqs[item.key as keyof PwReqs];
        return (
          <p key={item.key} style={{ margin: 0, fontSize: "13px", color: met ? "rgba(100,220,130,0.9)" : "var(--text-faint)" }}>
            {met ? "✓" : "○"} {lang === "en" ? item.en : item.es}
          </p>
        );
      })}
    </div>
  );
}

function PasswordInput({
  id, value, onChange, placeholder,
}: {
  id: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        id={id}
        type={show ? "text" : "password"}
        className="fieldInput"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        style={{ paddingRight: "44px" }}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        style={{
          position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
          background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)",
          fontSize: "13px", padding: 0,
        }}
      >
        {show ? "ocultar" : "ver"}
      </button>
    </div>
  );
}

export default function MiGalaxiaPage() {
  const [lang, setLang] = useState<Lang>("es");
  const [scrolled, setScrolled] = useState(false);
  const [view, setView] = useState<View>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPw, setLoginPw] = useState("");

  const [regEmail, setRegEmail] = useState("");
  const [regPw, setRegPw] = useState("");
  const [regPwConfirm, setRegPwConfirm] = useState("");

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const [resetToken, setResetToken] = useState("");
  const [resetPw, setResetPw] = useState("");
  const [resetPwConfirm, setResetPwConfirm] = useState("");

  const [changeCurrent, setChangeCurrent] = useState("");
  const [changeNew, setChangeNew] = useState("");
  const [changeConfirm, setChangeConfirm] = useState("");

  const [jwt, setJwt] = useState<string | null>(null);
  const [portalData, setPortalData] = useState<PortalData | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [pendingCheckout, setPendingCheckout] = useState<{ productType: string; chartId: string; reportId: string } | null>(null);
  const [vinculoStep, setVinculoStep] = useState(false);
  const [vinculoData, setVinculoData] = useState<VinculoData | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const loadPortal = useCallback(async (token: string) => {
    setPortalLoading(true);
    try {
      const data = await fetchPortal(token);
      setPortalData(data);
      setView("portal");
    } catch {
      localStorage.removeItem("kc_token");
      localStorage.removeItem("kc_galaxy_id");
      setView("login");
    } finally {
      setPortalLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reset = params.get("reset");
    if (reset) {
      setResetToken(reset);
      setView("reset");
      return;
    }
    const emailParam = params.get("email");
    if (emailParam) {
      setRegEmail(decodeURIComponent(emailParam));
      setView("register");
      return;
    }
    const stored = localStorage.getItem("kc_token");
    if (stored) {
      setJwt(stored);
      loadPortal(stored);
    }
  }, [loadPortal]);

  function saveAuth(token: string, galaxyId: string) {
    localStorage.setItem("kc_token", token);
    localStorage.setItem("kc_galaxy_id", galaxyId);
    setJwt(token);
  }

  function logout() {
    localStorage.removeItem("kc_token");
    localStorage.removeItem("kc_galaxy_id");
    setJwt(null);
    setPortalData(null);
    setView("login");
    window.history.replaceState({}, "", "/mi-galaxia");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await authLogin(loginEmail.trim(), loginPw);
      saveAuth(res.token, res.galaxyId);
      await loadPortal(res.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (regPw !== regPwConfirm) {
      setError(lang === "en" ? "Passwords do not match" : "Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    try {
      const res = await authRegister(regEmail.trim(), regPw);
      saveAuth(res.token, res.galaxyId);
      await loadPortal(res.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await authForgotPassword(forgotEmail.trim());
      setForgotSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (resetPw !== resetPwConfirm) {
      setError(lang === "en" ? "Passwords do not match" : "Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    try {
      await authResetPassword(resetToken, resetPw);
      setSuccess(lang === "en" ? "Password updated. You can now sign in." : "Contraseña actualizada. Ya puedes acceder.");
      window.history.replaceState({}, "", "/mi-galaxia");
      setView("login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al restablecer");
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (changeNew !== changeConfirm) {
      setError(lang === "en" ? "Passwords do not match" : "Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    try {
      await authChangePassword(changeCurrent, changeNew, jwt!);
      setSuccess(lang === "en" ? "Password updated." : "Contraseña actualizada.");
      setChangeCurrent(""); setChangeNew(""); setChangeConfirm("");
      setView("portal");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cambiar la contraseña");
    } finally {
      setLoading(false);
    }
  }

  async function handlePortalCheckout(
    productType: string,
    chartId: string,
    reportId: string,
    consentData?: ConsentData,
    vd?: VinculoData | null
  ) {
    setCheckoutLoading(productType);
    try {
      const checkout = await createCheckout({
        chartId,
        reportId,
        productType: productType as "CHIRON" | "NATAL_CHART" | "COMPATIBILITY" | "SUBSCRIPTION",
        deliveryEmail: consentData?.deliveryEmail,
        marketingConsent: consentData?.marketingConsent,
        ...(vd && {
          vinculoRelationship: vd.relationship,
          vinculoPersonBId: vd.personBId,
          vinculoPerson2Name: vd.person2Name,
          vinculoPerson2Date: vd.person2BirthDate,
          vinculoPerson2Time: vd.person2BirthTime,
          vinculoPerson2City: vd.person2BirthCity,
        }),
      });
      if (checkout.checkoutUrl) window.location.href = checkout.checkoutUrl;
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error iniciando el pago.");
    } finally {
      setCheckoutLoading(null);
    }
  }

  const regReqs = checkPw(regPw);
  const resetReqs = checkPw(resetPw);
  const changeReqs = checkPw(changeNew);

  return (
    <div className="pageShell" id="top">
      <SiteHeader
        lang={lang}
        setLang={setLang}
        scrolled={scrolled}
        onNavigate={(id) => { window.location.href = `/#${id}`; }}
      />

      <main className="pageContent">
        <section className="contentSection">

          {portalLoading && (
            <div className="sectionIntro">
              <p className="sectionLabel">Portal</p>
              <h1 className="sectionTitle">{lang === "en" ? "Loading..." : "Cargando..."}</h1>
            </div>
          )}

          {/* ── ESTADO 1 — Login ── */}
          {view === "login" && !portalLoading && (
            <>
              <div className="sectionIntro">
                <p className="sectionLabel">Portal</p>
                <h1 className="sectionTitle">
                  {lang === "en" ? "Access your galaxy." : "Accede a tu galaxia."}
                </h1>
              </div>
              <div className="resultsPanel">
                <article className="insightCard">
                  {success && (
                    <p style={{ color: "rgba(100,220,130,0.9)", marginBottom: "16px", fontWeight: 600 }}>{success}</p>
                  )}
                  <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                      <label htmlFor="login-email" className="fieldLabel">
                        {lang === "en" ? "Email" : "Correo electrónico"}
                      </label>
                      <input
                        id="login-email"
                        type="email"
                        className="fieldInput"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>
                    <div>
                      <label htmlFor="login-pw" className="fieldLabel">
                        {lang === "en" ? "Password" : "Contraseña"}
                      </label>
                      <PasswordInput id="login-pw" value={loginPw} onChange={setLoginPw} />
                    </div>
                    {error && (
                      <p style={{ color: "rgba(255,80,80,0.9)", fontSize: "14px", margin: 0 }}>{error}</p>
                    )}
                    <button type="submit" className="primaryButton" disabled={loading}>
                      {loading ? "..." : (lang === "en" ? "Sign in" : "Entrar")}
                    </button>
                  </form>
                  <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <button type="button" className="linkButton" onClick={() => { setError(""); setSuccess(""); setView("register"); }}>
                      {lang === "en" ? "First time? Create your access" : "¿Primera vez? Crea tu acceso"}
                    </button>
                    <button type="button" className="linkButton" onClick={() => { setError(""); setView("forgot"); }}>
                      {lang === "en" ? "Forgot your password?" : "¿Olvidaste tu contraseña?"}
                    </button>
                  </div>
                </article>
              </div>
            </>
          )}

          {/* ── ESTADO 2 — Registro ── */}
          {view === "register" && (
            <>
              <div className="sectionIntro">
                <p className="sectionLabel">Portal</p>
                <h1 className="sectionTitle">
                  {lang === "en" ? "Create your access." : "Crea tu acceso."}
                </h1>
                <p className="sectionText">
                  {lang === "en" ? "For Kiron Code customers only." : "Solo para clientes de Kiron Code."}
                </p>
              </div>
              <div className="resultsPanel">
                <article className="insightCard">
                  <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                      <label htmlFor="reg-email" className="fieldLabel">
                        {lang === "en" ? "Email" : "Correo electrónico"}
                      </label>
                      <input
                        id="reg-email"
                        type="email"
                        className="fieldInput"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>
                    <div>
                      <label htmlFor="reg-pw" className="fieldLabel">
                        {lang === "en" ? "Password" : "Contraseña"}
                      </label>
                      <PasswordInput id="reg-pw" value={regPw} onChange={setRegPw} />
                      <PwRequirements reqs={regReqs} lang={lang} />
                    </div>
                    <div>
                      <label htmlFor="reg-pw2" className="fieldLabel">
                        {lang === "en" ? "Confirm password" : "Confirmar contraseña"}
                      </label>
                      <PasswordInput id="reg-pw2" value={regPwConfirm} onChange={setRegPwConfirm} />
                      {regPwConfirm && regPw !== regPwConfirm && (
                        <p style={{ color: "rgba(255,80,80,0.9)", fontSize: "13px", margin: "4px 0 0" }}>
                          {lang === "en" ? "Passwords do not match" : "Las contraseñas no coinciden"}
                        </p>
                      )}
                    </div>
                    {error && (
                      <p style={{ color: "rgba(255,80,80,0.9)", fontSize: "14px", margin: 0 }}>{error}</p>
                    )}
                    <button
                      type="submit"
                      className="primaryButton"
                      disabled={loading || !allValid(regReqs) || regPw !== regPwConfirm}
                    >
                      {loading ? "..." : (lang === "en" ? "Create my access" : "Crear mi acceso")}
                    </button>
                  </form>
                  <div style={{ marginTop: "16px" }}>
                    <button type="button" className="linkButton" onClick={() => { setError(""); setView("login"); }}>
                      {lang === "en" ? "I already have an account" : "Ya tengo cuenta"}
                    </button>
                  </div>
                </article>
              </div>
            </>
          )}

          {/* ── ESTADO 3 — Recuperar contraseña ── */}
          {view === "forgot" && (
            <>
              <div className="sectionIntro">
                <p className="sectionLabel">Portal</p>
                <h1 className="sectionTitle">
                  {lang === "en" ? "Recover your access." : "Recupera tu acceso."}
                </h1>
              </div>
              <div className="resultsPanel">
                <article className="insightCard">
                  {forgotSent ? (
                    <p style={{ margin: 0, lineHeight: 1.7 }}>
                      {lang === "en"
                        ? "If this email has an account, you will receive the instructions shortly."
                        : "Si este email tiene una cuenta, recibirás las instrucciones en breve."}
                    </p>
                  ) : (
                    <form onSubmit={handleForgot} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div>
                        <label htmlFor="forgot-email" className="fieldLabel">
                          {lang === "en" ? "Email" : "Correo electrónico"}
                        </label>
                        <input
                          id="forgot-email"
                          type="email"
                          className="fieldInput"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          required
                          autoComplete="email"
                        />
                      </div>
                      {error && (
                        <p style={{ color: "rgba(255,80,80,0.9)", fontSize: "14px", margin: 0 }}>{error}</p>
                      )}
                      <button type="submit" className="primaryButton" disabled={loading}>
                        {loading ? "..." : (lang === "en" ? "Send instructions" : "Enviar instrucciones")}
                      </button>
                    </form>
                  )}
                  <div style={{ marginTop: "16px" }}>
                    <button type="button" className="linkButton" onClick={() => { setError(""); setForgotSent(false); setView("login"); }}>
                      {lang === "en" ? "Back to login" : "Volver al login"}
                    </button>
                  </div>
                </article>
              </div>
            </>
          )}

          {/* ── ESTADO 4 — Reset contraseña ── */}
          {view === "reset" && (
            <>
              <div className="sectionIntro">
                <p className="sectionLabel">Portal</p>
                <h1 className="sectionTitle">
                  {lang === "en" ? "New password." : "Nueva contraseña."}
                </h1>
              </div>
              <div className="resultsPanel">
                <article className="insightCard">
                  <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                      <label htmlFor="reset-pw" className="fieldLabel">
                        {lang === "en" ? "New password" : "Nueva contraseña"}
                      </label>
                      <PasswordInput id="reset-pw" value={resetPw} onChange={setResetPw} />
                      <PwRequirements reqs={resetReqs} lang={lang} />
                    </div>
                    <div>
                      <label htmlFor="reset-pw2" className="fieldLabel">
                        {lang === "en" ? "Confirm password" : "Confirmar contraseña"}
                      </label>
                      <PasswordInput id="reset-pw2" value={resetPwConfirm} onChange={setResetPwConfirm} />
                      {resetPwConfirm && resetPw !== resetPwConfirm && (
                        <p style={{ color: "rgba(255,80,80,0.9)", fontSize: "13px", margin: "4px 0 0" }}>
                          {lang === "en" ? "Passwords do not match" : "Las contraseñas no coinciden"}
                        </p>
                      )}
                    </div>
                    {error && (
                      <p style={{ color: "rgba(255,80,80,0.9)", fontSize: "14px", margin: 0 }}>{error}</p>
                    )}
                    <button
                      type="submit"
                      className="primaryButton"
                      disabled={loading || !allValid(resetReqs) || resetPw !== resetPwConfirm}
                    >
                      {loading ? "..." : (lang === "en" ? "Save password" : "Guardar contraseña")}
                    </button>
                  </form>
                </article>
              </div>
            </>
          )}

          {/* ── ESTADO 5 — Cambiar contraseña ── */}
          {view === "changePassword" && (
            <>
              <div className="sectionIntro">
                <p className="sectionLabel">Portal</p>
                <h1 className="sectionTitle">
                  {lang === "en" ? "Change password." : "Cambiar contraseña."}
                </h1>
              </div>
              <div className="resultsPanel">
                <article className="insightCard">
                  <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                      <label htmlFor="ch-current" className="fieldLabel">
                        {lang === "en" ? "Current password" : "Contraseña actual"}
                      </label>
                      <PasswordInput id="ch-current" value={changeCurrent} onChange={setChangeCurrent} />
                    </div>
                    <div>
                      <label htmlFor="ch-new" className="fieldLabel">
                        {lang === "en" ? "New password" : "Nueva contraseña"}
                      </label>
                      <PasswordInput id="ch-new" value={changeNew} onChange={setChangeNew} />
                      <PwRequirements reqs={changeReqs} lang={lang} />
                    </div>
                    <div>
                      <label htmlFor="ch-confirm" className="fieldLabel">
                        {lang === "en" ? "Confirm new password" : "Confirmar nueva contraseña"}
                      </label>
                      <PasswordInput id="ch-confirm" value={changeConfirm} onChange={setChangeConfirm} />
                      {changeConfirm && changeNew !== changeConfirm && (
                        <p style={{ color: "rgba(255,80,80,0.9)", fontSize: "13px", margin: "4px 0 0" }}>
                          {lang === "en" ? "Passwords do not match" : "Las contraseñas no coinciden"}
                        </p>
                      )}
                    </div>
                    {error && (
                      <p style={{ color: "rgba(255,80,80,0.9)", fontSize: "14px", margin: 0 }}>{error}</p>
                    )}
                    <button
                      type="submit"
                      className="primaryButton"
                      disabled={loading || !allValid(changeReqs) || changeNew !== changeConfirm}
                    >
                      {loading ? "..." : (lang === "en" ? "Save changes" : "Guardar cambios")}
                    </button>
                  </form>
                  <div style={{ marginTop: "16px" }}>
                    <button type="button" className="linkButton" onClick={() => { setError(""); setView("portal"); }}>
                      {lang === "en" ? "Cancel" : "Cancelar"}
                    </button>
                  </div>
                </article>
              </div>
            </>
          )}

          {/* ── Portal ── */}
          {view === "portal" && portalData && (
            <>
              <div className="sectionIntro">
                <p className="sectionLabel">{portalData.galaxyId}</p>
                <h1 className="sectionTitle">
                  {lang === "en" ? "Your galaxy." : "Mi galaxia."}
                </h1>
              </div>
              <div className="resultsPanel">
                {success && (
                  <article className="insightCard">
                    <p style={{ margin: 0, color: "rgba(100,220,130,0.9)", fontWeight: 600 }}>{success}</p>
                  </article>
                )}

                <article className="insightCard">
                  <h3>
                    {lang === "en" ? `Hello, ${portalData.name || portalData.email}.` : `Hola, ${portalData.name || portalData.email}.`}
                  </h3>
                  {portalData.chiron?.sign && (
                    <p>
                      {lang === "en" ? "Your" : "Tu"} <strong>Quirón</strong>{" "}
                      {lang === "en" ? "is in" : "está en"}{" "}
                      <strong>{portalData.chiron.sign}</strong>,{" "}
                      {lang === "en" ? "House" : "Casa"} {portalData.chiron.house},{" "}
                      {lang === "en" ? "at" : "a"} {Number(portalData.chiron.degree).toFixed(1)}°.
                    </p>
                  )}
                </article>

                {(() => {
                  const purchasedMap = new Map(portalData.products.map((p) => [p.productType, p]));
                  return CATALOG.map((item) => {
                    const purchased = purchasedMap.get(item.key);
                    const isPurchased = Boolean(purchased);
                    const hasPdf = Boolean(purchased?.pdfUrl);
                    const isBlocked = !isPurchased && item.requiresKey !== null && !purchasedMap.has(item.requiresKey);
                    const isAvailable = !isPurchased && !isBlocked;
                    return (
                      <article key={item.key} className="insightCard">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                          <div>
                            <h3 style={{ marginBottom: "6px" }}>{lang === "en" ? item.nameEn : item.name}</h3>
                            <p style={{ margin: 0 }}>
                              {isPurchased && hasPdf
                                ? (lang === "en" ? "Report available." : "Informe disponible.")
                                : isPurchased
                                ? (lang === "en" ? "Processing your report..." : "Procesando tu informe...")
                                : isBlocked
                                ? (lang === "en" ? "Requires The Wound and the Gift." : "Requiere La Herida y el Don.")
                                : (lang === "en" ? `Unlock for ${item.price}.` : `Desbloquea por ${item.price}.`)}
                            </p>
                          </div>
                          {isPurchased && hasPdf && (
                            <span style={{ flexShrink: 0, padding: "4px 10px", border: "1px solid var(--line)", borderRadius: "999px", fontSize: "12px", color: "rgba(100,220,130,0.9)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                              {lang === "en" ? "Purchased" : "Comprado"}
                            </span>
                          )}
                          {isPurchased && !hasPdf && (
                            <span style={{ flexShrink: 0, padding: "4px 10px", border: "1px solid var(--line)", borderRadius: "999px", fontSize: "12px", color: "rgba(251,191,36,0.9)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                              {lang === "en" ? "Processing" : "Procesando"}
                            </span>
                          )}
                          {isBlocked && (
                            <span style={{ flexShrink: 0, padding: "4px 10px", border: "1px solid var(--line)", borderRadius: "999px", fontSize: "12px", color: "var(--text-faint)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                              {lang === "en" ? "Locked" : "Bloqueado"}
                            </span>
                          )}
                        </div>
                        {isPurchased && purchased?.pdfUrl && (
                          <div style={{ marginTop: "14px" }}>
                            <a href={purchased.pdfUrl} target="_blank" rel="noreferrer" download style={{ textDecoration: "underline", fontSize: "14px" }}>
                              {lang === "en" ? "Download PDF" : "Descargar PDF"}
                            </a>
                          </div>
                        )}
                        {isAvailable && portalData.chartId && portalData.reportId && (
                          <div style={{ marginTop: "14px" }}>
                            <button
                              type="button"
                              className="primaryButton"
                              disabled={checkoutLoading === item.key}
                              onClick={() => {
                                setPendingCheckout({ productType: item.key, chartId: portalData.chartId!, reportId: portalData.reportId! });
                                if (item.key === "COMPATIBILITY") setVinculoStep(true);
                              }}
                            >
                              {checkoutLoading === item.key
                                ? (lang === "en" ? "Redirecting..." : "Redirigiendo...")
                                : `${lang === "en" ? item.nameEn : item.name} · ${item.price}`}
                            </button>
                          </div>
                        )}
                      </article>
                    );
                  });
                })()}

                <article className="insightCard" style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="secondaryButton"
                    style={{ fontSize: "14px", minHeight: "40px", padding: "0 16px" }}
                    onClick={() => { setError(""); setSuccess(""); setView("changePassword"); }}
                  >
                    {lang === "en" ? "Change password" : "Cambiar contraseña"}
                  </button>
                  <button
                    type="button"
                    className="secondaryButton"
                    style={{ fontSize: "14px", minHeight: "40px", padding: "0 16px" }}
                    onClick={logout}
                  >
                    {lang === "en" ? "Sign out" : "Cerrar sesión"}
                  </button>
                </article>
              </div>
            </>
          )}

        </section>
      </main>

      <SiteFooter lang={lang} />

      {pendingCheckout?.productType === "COMPATIBILITY" && vinculoStep && (
        <VinculoConfigModal
          lang={lang}
          onConfirm={(vd) => { setVinculoData(vd); setVinculoStep(false); }}
          onCancel={() => { setPendingCheckout(null); setVinculoStep(false); setVinculoData(null); }}
        />
      )}

      {pendingCheckout && !vinculoStep && (
        <ConsentModal
          lang={lang}
          onConfirm={(data) => {
            const args = pendingCheckout;
            const vd = vinculoData;
            setPendingCheckout(null);
            setVinculoData(null);
            handlePortalCheckout(args.productType, args.chartId, args.reportId, data, vd);
          }}
          onCancel={() => { setPendingCheckout(null); setVinculoData(null); }}
        />
      )}
    </div>
  );
}
