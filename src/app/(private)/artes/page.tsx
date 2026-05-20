import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { listArtFormatOptions } from "@/lib/art";
import { getCurrentCompanyIdForUser } from "@/lib/billing/usage";
import { prisma } from "@/lib/database/prisma";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingButton } from "@/components/ui/loading-button";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  deleteArtworkDraftAction,
  duplicateArtworkDraftAction,
  generateArtFromDraft,
  prepareArtworkDraftAction
} from "./actions";

type ArtesPageProps = Readonly<{
  searchParams: Promise<{
    error?: string;
    duplicated?: string;
    deleted?: string;
    draft?: string;
    generated?: string;
  }>;
}>;

async function getCompanyIdForCurrentUser() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const membership = await getCurrentCompanyIdForUser(session.user.id);

  if (!membership) {
    redirect("/cadastro");
  }

  return membership.companyId;
}

export default async function ArtesPage({ searchParams }: ArtesPageProps) {
  const params = await searchParams;
  const companyId = await getCompanyIdForCurrentUser();
  const [companyImages, artworks] = await Promise.all([
    prisma.companyImage.findMany({
      where: {
        companyId,
        isActive: true
      },
      orderBy: { createdAt: "desc" },
      take: 20
    }),
    prisma.generatedArt.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        companyImage: true
      }
    })
  ]);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
      <PageHeader
        description="Prepare o briefing, gere o PNG com IA e mantenha o historico das artes por empresa."
        eyebrow="Gerador de Artes"
        title="Artes"
      />

      {params.error === "invalid" ? (
        <Notice tone="error">
          Preencha os campos corretamente e use apenas imagens da sua empresa.
        </Notice>
      ) : null}
      {params.error === "not-draft" ? (
        <Notice tone="error">
          Esta arte nao esta mais como rascunho. Duplique para gerar uma nova versao.
        </Notice>
      ) : null}
      {params.error === "generate" ? (
        <Notice tone="error">
          Nao foi possivel gerar o PNG agora. Verifique a chave da OpenAI ou tente novamente
          com outro briefing.
        </Notice>
      ) : null}
      {params.draft === "true" ? (
        <Notice tone="success">Briefing salvo como rascunho.</Notice>
      ) : null}
      {params.generated === "true" ? (
        <Notice tone="success">PNG gerado e salvo no historico.</Notice>
      ) : null}
      {params.duplicated === "true" ? (
        <Notice tone="success">Rascunho duplicado com sucesso.</Notice>
      ) : null}
      {params.deleted === "true" ? (
        <Notice tone="success">Rascunho excluido com sucesso.</Notice>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <SectionCard
          description="Os formatos sao validados em 1080x1080, 1080x1350 e 1080x1920."
          title="Formulario de briefing"
        >
          <form action={prepareArtworkDraftAction} className="space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-gray-800">Assunto</span>
              <input
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                name="subject"
                required
                type="text"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-800">Objetivo</span>
              <textarea
                className="mt-2 min-h-24 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                name="objective"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-800">Plataforma</span>
              <select
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                defaultValue="Instagram"
                name="platform"
                required
              >
                <option>Instagram</option>
                <option>Facebook</option>
                <option>LinkedIn</option>
                <option>TikTok</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-800">Formato</span>
              <select
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                name="format"
                required
              >
                {listArtFormatOptions().map((format) => (
                  <option key={format.value} value={format.value}>
                    {format.label} - {format.width}x{format.height}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-800">
                Imagem da empresa opcional
              </span>
              <select
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                name="companyImageId"
              >
                <option value="">Sem imagem especifica</option>
                {companyImages.map((image) => (
                  <option key={image.id} value={image.id}>
                    {image.title} - {image.type}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-3 rounded-md border border-gray-200 p-3">
              <label className="flex items-center gap-2 text-sm text-gray-800">
                <input
                  className="size-4 accent-emerald-700"
                  defaultChecked
                  name="useLogo"
                  type="checkbox"
                />
                Usar logotipo
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-800">
                <input
                  className="size-4 accent-emerald-700"
                  defaultChecked
                  name="useBrandColors"
                  type="checkbox"
                />
                Usar cores da marca
              </label>
            </div>
            <LoadingButton className="w-full" loadingText="Preparando arte...">
              Preparar arte
            </LoadingButton>
          </form>
        </SectionCard>

        <SectionCard title="Historico de artes">
          <div className="grid gap-5 lg:grid-cols-2">
            {artworks.length > 0 ? (
              artworks.map((artwork) => (
                <article className="rounded-md border border-gray-200 p-4" key={artwork.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-950">{artwork.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {artwork.width}x{artwork.height} - {artwork.aspectRatio}
                      </p>
                    </div>
                    <StatusBadge status={artwork.status} />
                  </div>
                  {artwork.imageUrl ? (
                    <div
                      aria-label={`Previa da arte ${artwork.title}`}
                      className="mt-4 h-72 rounded-md border border-gray-200 bg-gray-100 bg-contain bg-center bg-no-repeat"
                      style={{ backgroundImage: `url(${artwork.imageUrl})` }}
                    />
                  ) : null}
                  <dl className="mt-4 space-y-2 text-sm text-gray-700">
                    <div className="flex justify-between gap-4">
                      <dt>Plataforma</dt>
                      <dd>{artwork.platform}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Imagem</dt>
                      <dd>{artwork.companyImage?.title ?? "Opcional"}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Logo</dt>
                      <dd>{artwork.useLogo ? "Sim" : "Nao"}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Cores</dt>
                      <dd>{artwork.useBrandColors ? "Sim" : "Nao"}</dd>
                    </div>
                  </dl>
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-600">
                    {artwork.objective}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {artwork.status === "DRAFT" ? (
                      <form action={generateArtFromDraft}>
                        <input name="artworkId" type="hidden" value={artwork.id} />
                        <LoadingButton loadingText="Gerando PNG...">Gerar PNG</LoadingButton>
                      </form>
                    ) : null}
                    {artwork.imageUrl ? (
                      <a
                        className="rounded-md border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
                        download={`${artwork.title}.png`}
                        href={artwork.imageUrl}
                      >
                        Baixar imagem
                      </a>
                    ) : null}
                    <form action={duplicateArtworkDraftAction}>
                      <input name="artworkId" type="hidden" value={artwork.id} />
                      <button
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
                        type="submit"
                      >
                        Duplicar
                      </button>
                    </form>
                    <form action={deleteArtworkDraftAction}>
                      <input name="artworkId" type="hidden" value={artwork.id} />
                      <ConfirmDialog message="Excluir este rascunho de arte?">
                        <button
                          className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                          type="submit"
                        >
                          Excluir
                        </button>
                      </ConfirmDialog>
                    </form>
                  </div>
                </article>
              ))
            ) : (
              <div className="lg:col-span-2">
                <EmptyState
                  description="Preencha o briefing e clique em Preparar arte para salvar o primeiro rascunho."
                  title="Nenhum briefing de arte preparado"
                />
              </div>
            )}
          </div>
        </SectionCard>
      </section>
    </main>
  );
}
