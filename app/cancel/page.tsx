export default function CancelPage() {
  return (
    <main className="pageContent">
      <section className="contentSection">
        <div className="sectionIntro">
          <p className="sectionLabel">Pago cancelado</p>
          <h1 className="sectionTitle">No se completó el pago.</h1>
          <p className="sectionText">
            Tu carta sigue disponible y puedes volver a intentarlo cuando quieras.
          </p>
        </div>

        <div className="resultsPanel">
          <article className="insightCard">
            <h3>Qué puedes hacer ahora</h3>
            <p>
              Vuelve a la pantalla principal y pulsa de nuevo en Premium cuando
              quieras desbloquear el informe completo.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}