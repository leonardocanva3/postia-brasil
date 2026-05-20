import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { GeneratedPostResult } from "@/components/generated-post-result";
import { LoadingButton } from "@/components/ui/loading-button";
import { Notice } from "@/components/ui/notice";
import { prisma } from "@/lib/database/prisma";
import { generatePostAction } from "./actions";

type PostsPageProps = Readonly<{
  searchParams: Promise<{
    generatedPostId?: string;
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

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const params = await searchParams;
  const companyId = await getCompanyIdForCurrentUser();
  const [latestPosts, generatedPost] = await Promise.all([
    prisma.generatedPost.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 8
    }),
    params.generatedPostId
      ? prisma.generatedPost.findFirst({
          where: {
            id: params.generatedPostId,
            companyId
          }
        })
      : Promise.resolve(null)
  ]);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Gerador de Posts
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-950">Posts</h1>
        <p className="mt-3 text-gray-700">
          Crie posts com IA e mantenha o historico separado por empresa.
        </p>
      </div>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <form
          action={generatePostAction}
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-950">Novo post</h2>
          {params.error === "invalid" ? (
            <Notice tone="error">
              Preencha todos os campos para gerar o post.
            </Notice>
          ) : null}
          {params.error === "openai" ? (
            <Notice tone="error">
              Nao foi possivel gerar o post agora. Tente novamente em alguns
              instantes ou verifique a chave da OpenAI.
            </Notice>
          ) : null}
          {params.error === "openai-key" ? (
            <Notice tone="error">
              Chave da OpenAI não configurada. Configure OPENAI_API_KEY no arquivo .env.
            </Notice>
          ) : null}
          {params.error === "limit" ? (
            <Notice tone="warning">
              Você atingiu o limite do seu plano.{" "}
              <a className="font-semibold underline" href="/financeiro">
                Fazer Upgrade
              </a>
            </Notice>
          ) : null}
          <div className="mt-5 space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-gray-800">
                Tipo de negocio
              </span>
              <input
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                name="businessType"
                placeholder="Clinica estetica, restaurante, imobiliaria..."
                required
                type="text"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-800">
                Objetivo do post
              </span>
              <textarea
                className="mt-2 min-h-28 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                name="objective"
                placeholder="Atrair leads, divulgar promocao, educar audiencia..."
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
          </div>
          <LoadingButton className="mt-6 w-full" loadingText="Gerando post...">
            Gerar Post
          </LoadingButton>
        </form>

        <div className="space-y-6">
          {generatedPost ? (
            <GeneratedPostResult
              content={generatedPost.content}
              cta={generatedPost.cta}
              formatSuggestion={generatedPost.formatSuggestion}
              hashtags={generatedPost.hashtags}
              title={generatedPost.title}
            />
          ) : (
            <section className="rounded-lg border border-dashed border-gray-300 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-950">
                Resultado
              </h2>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                Preencha o formulario para gerar um post estruturado com titulo,
                conteudo, CTA, hashtags e sugestao de formato.
              </p>
            </section>
          )}

          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-950">
              Ultimos posts gerados
            </h2>
            <div className="mt-5 space-y-4">
              {latestPosts.length > 0 ? (
                latestPosts.map((post) => (
                  <article
                    className="rounded-md border border-gray-200 p-4"
                    key={post.id}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-950">
                          {post.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          {post.platform} · {post.tone}
                        </p>
                      </div>
                      <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                        {post.status}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-700">
                      {post.content}
                    </p>
                  </article>
                ))
              ) : (
                <p className="text-sm text-gray-600">
                  Nenhum post gerado ainda.
                </p>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
