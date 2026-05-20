import { ArtFormat, ArtStyle, DesignerLevel } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { getArtStyleDefinition, getDesignerLevelDefinition } from "@/lib/art";
import { getCurrentCompanyIdForUser } from "@/lib/billing/usage";
import { prisma } from "@/lib/database/prisma";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingButton } from "@/components/ui/loading-button";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  createArtDraftFromCampaignItemAction,
  createCalendarFromCampaignItemAction,
  createCaptionFromCampaignItemAction,
  createPostFromCampaignItemAction,
  generateCampaignAction,
  scheduleCampaignItemAction
} from "./actions";

type CampanhasPageProps = Readonly<{
  searchParams: Promise<{
    campaignId?: string;
    generated?: string;
    created?: string;
    error?: string;
  }>;
}>;

async function getCurrentCompany() {
  const session = await auth();

  if (!session?.user?.id) redirect("/login");
  const membership = await getCurrentCompanyIdForUser(session.user.id);

  if (!membership) redirect("/cadastro");
  return membership.companyId;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(date);
}

export default async function CampanhasPage({ searchParams }: CampanhasPageProps) {
  const params = await searchParams;
  const companyId = await getCurrentCompany();
  const campaigns = await prisma.campaign.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    take: 12,
    include: { items: { orderBy: { suggestedDate: "asc" } } }
  });
  const selectedCampaign =
    campaigns.find((campaign) => campaign.id === params.campaignId) ?? campaigns[0];

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
      <PageHeader
        description="Gere campanhas completas com ideias, legendas, calendario e briefing de artes."
        eyebrow="Campanhas automaticas"
        title="Campanhas"
      />

      {params.generated === "true" ? (
        <Notice tone="success">Campanha gerada com sucesso.</Notice>
      ) : null}
      {params.created ? (
        <Notice tone="success">Item convertido com sucesso.</Notice>
      ) : null}
      {params.error === "invalid" ? (
        <Notice tone="error">Revise os campos da campanha e tente novamente.</Notice>
      ) : null}
      {params.error === "limit" ? (
        <Notice tone="warning">
          Você atingiu o limite do seu plano.{" "}
          <a className="font-semibold underline" href="/financeiro">
            Fazer Upgrade
          </a>
        </Notice>
      ) : null}
      {params.error === "duplicate" ? (
        <Notice tone="warning">
          Este item ja foi convertido. Use o historico criado ou escolha outro item.
        </Notice>
      ) : null}
      {params.error === "openai" ? (
        <Notice tone="error">Nao foi possivel gerar a campanha agora.</Notice>
      ) : null}
      {params.error === "openai-key" ? (
        <Notice tone="error">
          Chave da OpenAI não configurada. Configure OPENAI_API_KEY no arquivo .env.
        </Notice>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <SectionCard title="Nova campanha">
          <form action={generateCampaignAction} className="space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-gray-800">Tema principal</span>
              <input
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                name="mainTopic"
                placeholder="Clareamento dental"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-800">Objetivo</span>
              <textarea
                className="mt-2 min-h-24 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                name="objective"
                placeholder="Divulgar o serviço e gerar agendamentos"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-800">Plataforma</span>
              <select
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                defaultValue="Instagram"
                name="platform"
              >
                <option>Instagram</option>
                <option>Facebook</option>
                <option>LinkedIn</option>
                <option>TikTok</option>
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-gray-800">Data inicial</span>
                <input
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  name="startDate"
                  required
                  type="date"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-800">Data final</span>
                <input
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  name="endDate"
                  required
                  type="date"
                />
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-medium text-gray-800">
                Quantidade de conteudos
              </span>
              <input
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                defaultValue={6}
                max={30}
                min={1}
                name="contentCount"
                type="number"
              />
            </label>
            <fieldset className="rounded-md border border-gray-200 p-3">
              <legend className="px-1 text-sm font-medium text-gray-800">
                Formatos desejados
              </legend>
              <div className="mt-2 grid gap-2 text-sm text-gray-700">
                {Object.values(ArtFormat).map((format) => (
                  <label className="flex items-center gap-2" key={format}>
                    <input
                      className="size-4 accent-emerald-700"
                      defaultChecked={format === "FEED_QUADRADO"}
                      name="formats"
                      type="checkbox"
                      value={format}
                    />
                    {format}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="block">
              <span className="text-sm font-medium text-gray-800">Estilo visual</span>
              <select
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                name="artStyle"
              >
                <option value="">Automatico</option>
                {Object.values(ArtStyle).map((style) => (
                  <option key={style} value={style}>
                    {getArtStyleDefinition(style).name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-800">Nivel de designer</span>
              <select
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                name="designerLevel"
              >
                <option value="">Automatico</option>
                {Object.values(DesignerLevel).map((level) => (
                  <option key={level} value={level}>
                    {getDesignerLevelDefinition(level).name}
                  </option>
                ))}
              </select>
            </label>
            <LoadingButton className="w-full" loadingText="Gerando campanha...">
              Gerar campanha
            </LoadingButton>
          </form>
        </SectionCard>

        <SectionCard title="Historico de campanhas">
          <div className="space-y-4">
            {campaigns.length > 0 ? (
              campaigns.map((campaign) => (
                <a
                  className="block rounded-md border border-gray-200 p-4 transition hover:bg-gray-50"
                  href={`/campanhas?campaignId=${campaign.id}`}
                  key={campaign.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-950">{campaign.title}</p>
                      <p className="mt-1 text-sm text-gray-600">{campaign.mainTopic}</p>
                    </div>
                    <StatusBadge status={campaign.status} />
                  </div>
                  <p className="mt-3 text-sm text-gray-600">
                    {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)} |{" "}
                    {campaign.items.length} itens
                  </p>
                </a>
              ))
            ) : (
              <EmptyState
                description="Gere uma campanha para organizar varios conteudos de uma vez."
                title="Nenhuma campanha criada"
              />
            )}
          </div>
        </SectionCard>
      </section>

      {selectedCampaign ? (
        <SectionCard title={selectedCampaign.title}>
          <div className="grid gap-4 lg:grid-cols-2">
            {selectedCampaign.items.map((item) => (
              <article className="rounded-md border border-gray-200 p-4" key={item.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-950">{item.title}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      {formatDate(item.suggestedDate)} | {item.contentType}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <p className="mt-3 text-sm leading-6 text-gray-700">{item.postIdea}</p>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                  {item.caption}
                </p>
                <dl className="mt-4 grid gap-2 text-sm text-gray-700">
                  <div className="flex justify-between gap-4">
                    <dt>Formato</dt>
                    <dd>{item.artFormat}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Estilo</dt>
                    <dd>
                      {item.artStyle
                        ? getArtStyleDefinition(item.artStyle).name
                        : "Automatico"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Designer</dt>
                    <dd>{getDesignerLevelDefinition(item.designerLevel).name}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={createPostFromCampaignItemAction}>
                    <input name="itemId" type="hidden" value={item.id} />
                    <button
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={Boolean(item.generatedPostId)}
                      type="submit"
                    >
                      {item.generatedPostId ? "Post criado" : "Criar post"}
                    </button>
                  </form>
                  <form action={createCaptionFromCampaignItemAction}>
                    <input name="itemId" type="hidden" value={item.id} />
                    <button
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={Boolean(item.generatedCaptionId)}
                      type="submit"
                    >
                      {item.generatedCaptionId ? "Legenda criada" : "Criar legenda"}
                    </button>
                  </form>
                  <form action={createArtDraftFromCampaignItemAction}>
                    <input name="itemId" type="hidden" value={item.id} />
                    <button
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={Boolean(item.generatedArtId)}
                      type="submit"
                    >
                      {item.generatedArtId ? "Arte criada" : "Criar arte"}
                    </button>
                  </form>
                  <form action={createCalendarFromCampaignItemAction}>
                    <input name="itemId" type="hidden" value={item.id} />
                    <button
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
                      type="submit"
                    >
                      Calendario
                    </button>
                  </form>
                  <form action={scheduleCampaignItemAction}>
                    <input name="itemId" type="hidden" value={item.id} />
                    <button
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={Boolean(item.scheduledPostId)}
                      type="submit"
                    >
                      {item.scheduledPostId ? "Agendado" : "Agendar"}
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>
      ) : null}
    </main>
  );
}
