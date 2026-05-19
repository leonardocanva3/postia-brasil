import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { GeneratedCaptionResult } from "@/components/generated-caption-result";
import { LoadingButton } from "@/components/ui/loading-button";
import { Notice } from "@/components/ui/notice";
import { prisma } from "@/lib/database/prisma";
import { generateCaptionAction } from "./actions";

type LegendasPageProps = Readonly<{
  searchParams: Promise<{
    generatedCaptionId?: string;
    error?: string;
  }>;
}>;

async function getCompanyIdForCurrentUser() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const membership = await prisma.companyMember.findFirst({
    where: {
      userId: session.user.id
    },
    orderBy: {
      createdAt: "asc"
    },
    select: {
      companyId: true
    }
  });

  if (!membership) {
    redirect("/cadastro");
  }

  return membership.companyId;
}

export default async function LegendasPage({ searchParams }: LegendasPageProps) {
  const params = await searchParams;
  const companyId = await getCompanyIdForCurrentUser();
  const [latestCaptions, generatedCaption] = await Promise.all([
    prisma.generatedCaption.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 8
    }),
    params.generatedCaptionId
      ? prisma.generatedCaption.findFirst({
          where: {
            id: params.generatedCaptionId,
            companyId
          }
        })
      : Promise.resolve(null)
  ]);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Gerador de Legendas
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-950">Legendas</h1>
        <p className="mt-3 text-gray-700">
          Crie legendas com IA e mantenha o historico separado por empresa.
        </p>
      </div>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <form
          action={generateCaptionAction}
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-950">Nova legenda</h2>
          {params.error === "invalid" ? (
            <Notice tone="error">
              Preencha todos os campos corretamente para gerar a legenda.
            </Notice>
          ) : null}
          {params.error === "openai" ? (
            <Notice tone="error">
              Nao foi possivel gerar a legenda agora. Verifique a configuracao
              da OpenAI.
            </Notice>
          ) : null}
          {params.error === "limit" ? (
            <Notice tone="warning">
              Voce atingiu o limite mensal de legendas do plano atual.
            </Notice>
          ) : null}
          <div className="mt-5 space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-gray-800">
                Assunto da legenda
              </span>
              <textarea
                className="mt-2 min-h-28 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                name="subject"
                placeholder="Lancamento, dica, promocao, bastidores..."
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-800">
                Plataforma
              </span>
              <select
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                defaultValue="Instagram"
                name="platform"
                required
              >
                <option>Instagram</option>
                <option>LinkedIn</option>
                <option>Facebook</option>
                <option>TikTok</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-800">
                Tom de voz
              </span>
              <select
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                defaultValue="Profissional"
                name="tone"
                required
              >
                <option>Profissional</option>
                <option>Descontraido</option>
                <option>Inspirador</option>
                <option>Educativo</option>
                <option>Vendedor</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-800">
                Quantidade de hashtags
              </span>
              <input
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                defaultValue={8}
                max={30}
                min={0}
                name="hashtagCount"
                required
                type="number"
              />
            </label>
            <fieldset>
              <legend className="text-sm font-medium text-gray-800">
                Usar emojis
              </legend>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800">
                  <input
                    className="size-4 accent-emerald-700"
                    defaultChecked
                    name="useEmojis"
                    type="radio"
                    value="yes"
                  />
                  Sim
                </label>
                <label className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800">
                  <input
                    className="size-4 accent-emerald-700"
                    name="useEmojis"
                    type="radio"
                    value="no"
                  />
                  Nao
                </label>
              </div>
            </fieldset>
          </div>
          <LoadingButton className="mt-6 w-full" loadingText="Gerando legenda...">
            Gerar Legenda
          </LoadingButton>
        </form>

        <div className="space-y-6">
          {generatedCaption ? (
            <GeneratedCaptionResult
              caption={generatedCaption.caption}
              cta={generatedCaption.cta}
              emojis={generatedCaption.emojis}
              hashtags={generatedCaption.hashtags}
            />
          ) : (
            <section className="rounded-lg border border-dashed border-gray-300 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-950">
                Resultado
              </h2>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                Preencha o formulario para gerar uma legenda estruturada com
                texto, emojis sugeridos, hashtags e CTA.
              </p>
            </section>
          )}

          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-950">
              Ultimas legendas geradas
            </h2>
            <div className="mt-5 space-y-4">
              {latestCaptions.length > 0 ? (
                latestCaptions.map((caption) => (
                  <article
                    className="rounded-md border border-gray-200 p-4"
                    key={caption.id}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-950">
                          {caption.subject}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          {caption.platform} · {caption.tone}
                        </p>
                      </div>
                      <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                        {caption.status}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-700">
                      {caption.caption}
                    </p>
                  </article>
                ))
              ) : (
                <p className="text-sm text-gray-600">
                  Nenhuma legenda gerada ainda.
                </p>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
