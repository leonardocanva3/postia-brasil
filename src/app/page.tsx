import Image from "next/image";
import Link from "next/link";
import { AppLogo } from "@/components/app-logo";
import { showcaseItems } from "@/lib/showcase";

const segments = [
  "Psicologos",
  "Psiquiatras",
  "Dentistas",
  "Clinicas",
  "Fisioterapeutas",
  "Advogados",
  "Contadores",
  "Imobiliarias",
  "Corretores",
  "Transportadoras",
  "Oficinas",
  "Auto Centers",
  "Restaurantes",
  "Lojas",
  "Academias",
  "Nutricionistas",
  "Esteticas",
  "Representantes Comerciais"
];

const traditionalMethod = [
  "Contratar designer",
  "Esperar aprovacao",
  "Pagar por arte",
  "Producao lenta",
  "Falta de consistencia"
];

const postiaMethod = [
  "Ideia pronta",
  "Legenda pronta",
  "Arte pronta",
  "Calendario pronto",
  "Publicacao organizada"
];

const differentials = [
  "IA especializada em marketing",
  "Artes profissionais",
  "Legendas otimizadas",
  "Calendario editorial",
  "Campanhas automaticas",
  "Organizacao de conteudo",
  "Interface simples",
  "Suporte a multiplos nichos"
];

export default function HomePage() {
  return (
    <main className="landing-page">
      <section className="landing-section landing-section-muted">
        <div className="landing-container landing-hero">
          <div>
            <AppLogo size="lg" />
            <p className="landing-eyebrow">IA para artes, legendas e campanhas</p>
            <h1 className="landing-title">
              IA que cria artes profissionais para qualquer nicho.
            </h1>
            <p className="landing-copy">
              O PostIA Brasil ajuda sua empresa a gerar ideias, legendas,
              artes, campanhas e calendario editorial com uma direcao visual
              pronta para vender mais nas redes sociais.
            </p>
            <div className="landing-actions">
              <Link
                className="landing-button landing-button-primary"
                href="/cadastro"
              >
                Comecar Agora
              </Link>
              <Link className="landing-button landing-button-secondary" href="/login">
                Entrar
              </Link>
            </div>
            <div className="landing-stat-grid">
              {["Mais de 100 nichos", "Artes em PNG", "Campanhas completas"].map(
                (item) => (
                  <div className="landing-stat" key={item}>
                    {item}
                  </div>
                )
              )}
            </div>
          </div>

          <aside className="landing-card">
            <Image
              alt="Exemplo de arte profissional criada pelo PostIA Brasil"
              className="landing-card-image"
              height={900}
              priority
              src="/showcase/transportadora-01.png"
              width={900}
            />
            <div className="landing-card-body">
              <p className="landing-card-title">
                Arte profissional pronta para redes sociais
              </p>
              <p className="landing-card-meta">
                Visual consistente, CTA claro e contexto adaptado ao segmento.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-container">
          <h2 className="landing-section-title">
            Veja o que a IA cria para sua empresa
          </h2>
          <p className="landing-section-copy">
            Artes profissionais geradas para diversos segmentos com qualidade
            visual de nivel profissional.
          </p>

          <div className="landing-portfolio-grid">
            {showcaseItems.map((item) => (
              <article className="landing-card" key={item.imageSrc}>
                <Image
                  alt={`Arte para ${item.title}`}
                  className="landing-card-image"
                  height={900}
                  sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                  src={item.imageSrc}
                  width={900}
                />
                <div className="landing-card-body">
                  <p className="landing-card-meta">{item.segment}</p>
                  <div className="landing-card-title-row">
                    <h3 className="landing-card-title">{item.title}</h3>
                    <span className="landing-badge">{item.style}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section landing-section-muted">
        <div className="landing-container">
          <h2 className="landing-section-title">
            Funciona para qualquer negocio
          </h2>
          <p className="landing-section-copy">
            Mais de 100 segmentos podem utilizar o PostIA Brasil.
          </p>
          <div className="landing-segment-grid" style={{ marginTop: "2.5rem" }}>
            {segments.map((segment) => (
              <div className="landing-segment-card" key={segment}>
                {segment}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-container">
          <h2 className="landing-section-title">Produza conteudo em minutos</h2>
          <div className="landing-comparison-grid" style={{ marginTop: "2.5rem" }}>
            <article className="landing-comparison-card">
              <h3 className="landing-card-title">Metodo tradicional</h3>
              <ul className="landing-list">
                {traditionalMethod.map((item) => (
                  <li className="landing-list-item" key={item}>
                    <span className="landing-list-marker">x</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="landing-comparison-card landing-comparison-card-success">
              <h3 className="landing-card-title">PostIA Brasil</h3>
              <ul className="landing-list">
                {postiaMethod.map((item) => (
                  <li className="landing-list-item" key={item}>
                    <span className="landing-list-marker landing-list-marker-success">
                      ok
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="landing-section landing-dark">
        <div className="landing-container">
          <h2 className="landing-section-title">
            Por que escolher o PostIA Brasil?
          </h2>
          <div className="landing-differential-grid" style={{ marginTop: "2.5rem" }}>
            {differentials.map((item) => (
              <article className="landing-differential-card" key={item}>
                {item}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-container">
          <div className="landing-cta">
            <h2 className="landing-section-title">
              Pronto para criar conteudo profissional?
            </h2>
            <p className="landing-section-copy">
              Cadastre sua empresa e gere ideias, legendas, artes e campanhas
              completas utilizando Inteligencia Artificial.
            </p>
            <div className="landing-actions" style={{ justifyContent: "center" }}>
              <Link
                className="landing-button landing-button-primary"
                href="/cadastro"
              >
                Comecar Agora
              </Link>
              <Link className="landing-button landing-button-secondary" href="/login">
                Entrar
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
