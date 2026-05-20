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
    <main className="min-h-screen overflow-x-hidden bg-white text-gray-950">
      <section className="relative isolate flex min-h-[86vh] items-center overflow-hidden px-6 py-12">
        <Image
          alt="Arte profissional criada pelo PostIA Brasil"
          className="absolute inset-0 -z-20 size-full object-cover opacity-20"
          fill
          priority
          src="/showcase/transportadora-01.png"
        />
        <div className="absolute inset-0 -z-10 bg-white/85" />
        <div className="mx-auto w-full max-w-6xl">
          <AppLogo size="lg" />
          <div className="mt-10 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              IA para artes, legendas e campanhas
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-gray-950 sm:text-5xl lg:text-6xl">
              IA que cria artes profissionais para qualquer nicho.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-gray-700 sm:text-lg">
              O PostIA Brasil ajuda sua empresa a gerar ideias, legendas,
              artes, campanhas e calendario editorial com uma direcao visual
              pronta para vender mais nas redes sociais.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex justify-center rounded-md bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
                href="/cadastro"
              >
                Comecar Agora
              </Link>
              <Link
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
                href="/login"
              >
                Entrar
              </Link>
            </div>
          </div>
          <div className="mt-12 grid max-w-3xl gap-3 sm:grid-cols-3">
            {["Mais de 100 nichos", "Artes em PNG", "Campanhas completas"].map(
              (item) => (
                <div
                  className="rounded-lg border border-gray-200 bg-white/90 px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm"
                  key={item}
                >
                  {item}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold text-gray-950 sm:text-4xl">
              Veja o que a IA cria para sua empresa
            </h2>
            <p className="mt-4 text-base leading-7 text-gray-700 sm:text-lg">
              Artes profissionais geradas para diversos segmentos com qualidade
              visual de nivel profissional.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {showcaseItems.map((item) => (
              <article
                className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                key={item.imageSrc}
              >
                <div className="relative aspect-square bg-gray-100">
                  <Image
                    alt={`Arte para ${item.title}`}
                    className="object-cover"
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    src={item.imageSrc}
                  />
                </div>
                <div className="p-5">
                  <p className="text-sm font-medium text-gray-600">
                    {item.segment}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-gray-950">
                      {item.title}
                    </h3>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                      {item.style}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold text-gray-950 sm:text-4xl">
              Funciona para qualquer negocio
            </h2>
            <p className="mt-4 text-base leading-7 text-gray-700 sm:text-lg">
              Mais de 100 segmentos podem utilizar o PostIA Brasil.
            </p>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
            {segments.map((segment) => (
              <div
                className="rounded-lg border border-gray-200 bg-white px-4 py-4 text-sm font-semibold text-gray-800 shadow-sm"
                key={segment}
              >
                {segment}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-semibold text-gray-950 sm:text-4xl">
            Produza conteudo em minutos
          </h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-950">
                Metodo tradicional
              </h3>
              <ul className="mt-6 space-y-4">
                {traditionalMethod.map((item) => (
                  <li className="flex gap-3 text-gray-700" key={item}>
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-700">
                      x
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-emerald-950">
                PostIA Brasil
              </h3>
              <ul className="mt-6 space-y-4">
                {postiaMethod.map((item) => (
                  <li className="flex gap-3 text-emerald-950" key={item}>
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-gray-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Por que escolher o PostIA Brasil?
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {differentials.map((item) => (
              <article
                className="rounded-lg border border-white/10 bg-white/5 p-5 shadow-sm"
                key={item}
              >
                <p className="text-base font-semibold">{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl rounded-lg border border-gray-200 bg-gray-50 px-6 py-12 text-center shadow-sm sm:px-10">
          <h2 className="text-3xl font-semibold text-gray-950 sm:text-4xl">
            Pronto para criar conteudo profissional?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-700 sm:text-lg">
            Cadastre sua empresa e gere ideias, legendas, artes e campanhas
            completas utilizando Inteligencia Artificial.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              className="inline-flex justify-center rounded-md bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
              href="/cadastro"
            >
              Comecar Agora
            </Link>
            <Link
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
              href="/login"
            >
              Entrar
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
