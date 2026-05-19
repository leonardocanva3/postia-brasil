import Link from "next/link";

const benefits = [
  "Gere posts e legendas com IA em poucos minutos",
  "Organize um calendario editorial mensal",
  "Agende conteudos e compartilhe pelo WhatsApp",
  "Controle usuarios, empresas, planos e pagamentos"
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto grid min-h-screen w-full max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
            PostIA Brasil
          </p>
          <h1 className="mt-4 text-5xl font-semibold leading-tight text-gray-950">
            Conteudo profissional com IA para pequenas empresas brasileiras.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-700">
            Gere posts, legendas, calendarios editoriais e agendamentos em uma
            plataforma simples para vender, educar e manter consistencia nas
            redes sociais.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="rounded-md bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
              href="/cadastro"
            >
              Comecar agora
            </Link>
            <Link
              className="rounded-md border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
              href="/login"
            >
              Entrar
            </Link>
          </div>
        </div>

        <aside className="rounded-lg border border-gray-200 bg-gray-50 p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-700">Plano Pro</p>
          <p className="mt-3 text-4xl font-semibold text-gray-950">R$ 49,90</p>
          <p className="mt-2 text-sm text-gray-600">por mes</p>
          <ul className="mt-6 space-y-3 text-sm leading-6 text-gray-700">
            {benefits.map((benefit) => (
              <li className="rounded-md bg-white px-3 py-2" key={benefit}>
                {benefit}
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </main>
  );
}
