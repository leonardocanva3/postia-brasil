import { redirect } from "next/navigation";
import { CompanyImageType } from "@prisma/client";
import { auth } from "../../../../auth";
import { getCurrentCompanyIdForUser } from "@/lib/billing/usage";
import { prisma } from "@/lib/database/prisma";
import { BusinessSegmentSelects } from "@/components/business-segment-selects";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ImageUploadField } from "@/components/image-upload-field";
import { LoadingButton } from "@/components/ui/loading-button";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  analyzeDigitalPresenceAutomatically,
  analyzeCompanyPresenceAction,
  createCompanyImageAction,
  deactivateCompanyImageAction,
  deleteCompanyImageAction,
  updateCompanyImageAction,
  saveCompanyProfileAction
} from "./actions";

export const dynamic = "force-dynamic";

type PerfilPageProps = Readonly<{
  searchParams: Promise<{
    saved?: string;
    analyzed?: string;
    autoAnalyzed?: string;
    imageSaved?: string;
    error?: string;
  }>;
}>;

function isDisplayableImageUrl(value: string | null | undefined) {
  if (!value) {
    return false;
  }

  return (
    value.startsWith("/") ||
    value.startsWith("http://") ||
    value.startsWith("https://")
  );
}

async function getCompanyForCurrentUser() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const membership = await getCurrentCompanyIdForUser(session.user.id);

  if (!membership) {
    redirect("/cadastro");
  }

  const [company, rawSegments, rawSpecialties] = await Promise.all([
    prisma.company.findUnique({
      where: { id: membership.companyId },
      include: {
        images: {
          orderBy: [{ isActive: "desc" }, { createdAt: "desc" }]
        }
      }
    }),
    prisma.businessSegment.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true
      }
    }),
    prisma.businessSpecialty.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        segmentId: true,
        name: true
      }
    })
  ]);

  if (!company) {
    redirect("/cadastro");
  }

  const segments = rawSegments.map((segment) => ({
    id: String(segment.id),
    name: segment.name
  }));
  const specialties = rawSpecialties.map((specialty) => ({
    id: String(specialty.id),
    segmentId: String(specialty.segmentId),
    name: specialty.name
  }));

  return { company, segments, specialties };
}

export default async function PerfilPage({ searchParams }: PerfilPageProps) {
  const params = await searchParams;
  const { company, segments, specialties } = await getCompanyForCurrentUser();

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
      <PageHeader
        description="Informe site e Instagram para a IA enriquecer o perfil usado nos geradores. Se o site bloquear acesso, voce ainda pode colar os textos manualmente."
        eyebrow="Perfil completo"
        title="Perfil da empresa"
      />

      {params.saved === "true" ? (
        <Notice tone="success">Perfil salvo com sucesso.</Notice>
      ) : null}
      {params.analyzed === "true" ? (
        <Notice tone="success">
          Analise concluida. As sugestoes foram aplicadas ao perfil da empresa.
        </Notice>
      ) : null}
      {params.autoAnalyzed === "true" ? (
        <Notice tone="success">
          Analise automatica concluida. O perfil foi preenchido com base no site e no
          Instagram informado.
        </Notice>
      ) : null}
      {params.error === "invalid" ? (
        <Notice tone="error">
          Cole as informacoes coletadas do site ou Instagram antes de analisar.
        </Notice>
      ) : null}
      {params.error === "site-fetch" ? (
        <Notice tone="warning">
          Nao conseguimos acessar esse site com seguranca. Confira a URL ou cole os
          textos manualmente no campo de informacoes coletadas.
        </Notice>
      ) : null}
      {params.error === "openai" ? (
        <Notice tone="error">
          Nao foi possivel analisar agora. Verifique a configuracao da OpenAI e
          tente novamente.
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
      {params.imageSaved === "true" ? (
        <Notice tone="success">Banco de imagens atualizado com sucesso.</Notice>
      ) : null}
      {params.error === "image-limit" ? (
        <Notice tone="warning">
          Esta empresa ja possui 10 imagens ativas. Desative alguma imagem antes
          de ativar uma nova.
        </Notice>
      ) : null}
            {params.error === "image-invalid" ? (
              <Notice tone="error">
                Imagem muito grande. Envie uma imagem PNG, JPG ou WEBP com até 5MB.
              </Notice>
            ) : null}
            {params.error === "upload-invalid" ? (
              <Notice tone="error">
                Imagem muito grande. Envie uma imagem PNG, JPG ou WEBP com até 5MB.
              </Notice>
            ) : null}

      <form className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <SectionCard
          description="Essas informacoes entram automaticamente nos prompts de posts, legendas e calendario."
          title={company.name}
        >
          <div className="space-y-5">
            <BusinessSegmentSelects
              defaultSegmentId={company.businessSegmentId}
              defaultSpecialtyId={company.businessSpecialtyId}
              segments={segments}
              specialties={specialties}
            />
            <label className="block">
              <span className="text-sm font-medium text-gray-800">
                Site da empresa
              </span>
              <input
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                defaultValue={company.website ?? ""}
                name="website"
                placeholder="https://empresa.com.br"
                type="url"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-800">
                Instagram da empresa
              </span>
              <input
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                defaultValue={company.instagram ?? ""}
                name="instagram"
                placeholder="@empresa"
                type="text"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-800">
                Informacoes coletadas do site/Instagram
              </span>
              <textarea
                className="mt-2 min-h-40 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                defaultValue={company.collectedInfo ?? ""}
                name="collectedInfo"
                placeholder="Cole aqui textos do site, bio do Instagram, destaques, comentarios ou materiais comerciais."
              />
            </label>
          </div>
        </SectionCard>

        <SectionCard title="Analise de presenca digital">
          <p className="text-sm leading-6 text-gray-600">
            A analise automatica coleta apenas informacoes publicas do site. Para
            Instagram, usamos somente o @ informado como contexto e mantemos o
            caminho preparado para uma integracao oficial futura.
          </p>
          <div className="mt-5 grid gap-3">
            <LoadingButton
              className="w-full"
              formAction={analyzeDigitalPresenceAutomatically}
              loadingText="Coletando site..."
            >
              Analisar automaticamente
            </LoadingButton>
            <LoadingButton
              className="w-full border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 disabled:bg-gray-100"
              formAction={analyzeCompanyPresenceAction}
              loadingText="Analisando presenca..."
            >
              Analisar texto colado
            </LoadingButton>
            <LoadingButton
              className="w-full border border-gray-300 bg-white text-gray-800 hover:bg-gray-100 disabled:bg-gray-100"
              formAction={saveCompanyProfileAction}
              loadingText="Salvando perfil..."
            >
              Salvar perfil
            </LoadingButton>
          </div>
        </SectionCard>

        <SectionCard className="xl:col-span-2" title="Perfil enriquecido">
          <div className="grid gap-5 lg:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-gray-800">
                Descricao da empresa
              </span>
              <textarea
                className="mt-2 min-h-28 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                defaultValue={company.description ?? ""}
                name="description"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-800">
                Servicos realizados
              </span>
              <textarea
                className="mt-2 min-h-28 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                defaultValue={company.services ?? ""}
                name="services"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-800">
                Diferenciais
              </span>
              <textarea
                className="mt-2 min-h-28 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                defaultValue={company.differentiators ?? ""}
                name="differentiators"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-800">
                Publico-alvo
              </span>
              <textarea
                className="mt-2 min-h-28 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                defaultValue={company.targetAudience ?? ""}
                name="targetAudience"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-800">
                Tom de voz recomendado
              </span>
              <input
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                defaultValue={company.recommendedTone ?? ""}
                name="recommendedTone"
                type="text"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-800">
                CTA padrao
              </span>
              <input
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                defaultValue={company.defaultCta ?? ""}
                name="defaultCta"
                type="text"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-800">
                Cores da marca
              </span>
              <input
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                defaultValue={company.brandColors.join(", ")}
                name="brandColors"
                placeholder="#065f46, #111827"
                type="text"
              />
            </label>
            <div className="space-y-3">
              <ImageUploadField
                buttonLabel="Selecionar logo"
                defaultPreviewUrl={company.logoUrl}
                label="Logo"
                name="logoFile"
              />
              <label className="block">
                <span className="text-sm font-medium text-gray-800">
                  URL da logo alternativa
                </span>
                <input
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  defaultValue={company.logoUrl ?? ""}
                  name="logoUrl"
                  placeholder="https://.../logo.png"
                  type="url"
                />
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-medium text-gray-800">
                Ideias de posts
              </span>
              <textarea
                className="mt-2 min-h-28 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                defaultValue={company.postIdeas.join("\n")}
                name="postIdeas"
                placeholder="Uma ideia por linha"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-800">
                Informacoes importantes para futuras artes
              </span>
              <textarea
                className="mt-2 min-h-28 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                defaultValue={company.designNotes ?? ""}
                name="designNotes"
              />
            </label>
          </div>
        </SectionCard>
      </form>

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <SectionCard
          description="Envie imagens do computador ou use uma URL como alternativa avancada."
          title="Banco de Imagens"
        >
          <form action={createCompanyImageAction} className="space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-gray-800">Titulo</span>
              <input
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                name="title"
                required
                type="text"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-800">Tipo</span>
              <select
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                name="type"
                required
              >
                {Object.values(CompanyImageType).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <ImageUploadField
              buttonLabel="Selecionar imagem"
              label="Imagem"
              name="imageFile"
            />
            <label className="block">
              <span className="text-sm font-medium text-gray-800">
                URL da imagem alternativa
              </span>
              <input
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                name="imageUrl"
                placeholder="https://..."
                type="url"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-800">Descricao</span>
              <textarea
                className="mt-2 min-h-20 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                name="description"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-800">Tags</span>
              <input
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                name="tags"
                placeholder="fachada, premium, equipe"
                type="text"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                className="size-4 accent-emerald-700"
                defaultChecked
                name="isActive"
                type="checkbox"
              />
              Ativa
            </label>
            <LoadingButton className="w-full" loadingText="Salvando imagem...">
              Cadastrar imagem
            </LoadingButton>
          </form>
        </SectionCard>

        <SectionCard
          description={`${company.images.filter((image) => image.isActive).length}/10 imagens ativas`}
          title="Imagens cadastradas"
        >
          <div className="space-y-4">
            {company.images.length > 0 ? (
              company.images.map((image) => (
                <article
                  className="grid gap-4 rounded-md border border-gray-200 p-4 lg:grid-cols-[160px_1fr]"
                  key={image.id}
                >
                  {isDisplayableImageUrl(image.imageUrl) ? (
                    <div
                      aria-label={image.title}
                      className="aspect-video w-full rounded-md border border-gray-200 bg-gray-100 bg-cover bg-center"
                      role="img"
                      style={{ backgroundImage: `url(${image.imageUrl})` }}
                    />
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 text-center text-sm text-gray-500">
                      Imagem sem preview disponivel
                    </div>
                  )}
                  <div>
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-950">{image.title}</h3>
                        <p className="mt-1 text-sm text-gray-600">{image.type}</p>
                      </div>
                      <StatusBadge status={image.isActive ? "ACTIVE" : "CANCELED"} />
                    </div>
                    <form
                      action={updateCompanyImageAction}
                      className="grid gap-3 md:grid-cols-2"
                    >
                      <input name="imageId" type="hidden" value={image.id} />
                      <label className="block">
                        <span className="text-xs font-medium text-gray-600">
                          Titulo
                        </span>
                        <input
                          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                          defaultValue={image.title}
                          name="title"
                          required
                          type="text"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-medium text-gray-600">
                          Tipo
                        </span>
                        <select
                          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                          defaultValue={image.type}
                          name="type"
                          required
                        >
                          {Object.values(CompanyImageType).map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div className="md:col-span-2">
                        <ImageUploadField
                          buttonLabel="Selecionar imagem"
                          compact
                          defaultPreviewUrl={image.imageUrl}
                          label="Trocar imagem por upload"
                          name="imageFile"
                        />
                      </div>
                      <label className="block md:col-span-2">
                        <span className="text-xs font-medium text-gray-600">
                          URL alternativa
                        </span>
                        <input
                          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                          defaultValue={image.imageUrl}
                          name="imageUrl"
                          type="url"
                        />
                      </label>
                      <label className="block md:col-span-2">
                        <span className="text-xs font-medium text-gray-600">
                          Descricao
                        </span>
                        <input
                          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                          defaultValue={image.description ?? ""}
                          name="description"
                          type="text"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-medium text-gray-600">Tags</span>
                        <input
                          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                          defaultValue={image.tags.join(", ")}
                          name="tags"
                          type="text"
                        />
                      </label>
                      <label className="flex items-end gap-2 pb-2 text-sm text-gray-700">
                        <input
                          className="size-4 accent-emerald-700"
                          defaultChecked={image.isActive}
                          name="isActive"
                          type="checkbox"
                        />
                        Ativa
                      </label>
                      <button
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100 md:col-span-2"
                        type="submit"
                      >
                        Salvar imagem
                      </button>
                    </form>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <form action={deactivateCompanyImageAction}>
                        <input name="imageId" type="hidden" value={image.id} />
                        <ConfirmDialog message="Desativar esta imagem do banco ativo?">
                          <button
                            className="rounded-md border border-amber-200 px-3 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
                            type="submit"
                          >
                            Desativar
                          </button>
                        </ConfirmDialog>
                      </form>
                      <form action={deleteCompanyImageAction}>
                        <input name="imageId" type="hidden" value={image.id} />
                        <ConfirmDialog message="Excluir esta imagem permanentemente?">
                          <button
                            className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                            type="submit"
                          >
                            Excluir
                          </button>
                        </ConfirmDialog>
                      </form>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState
                description="Cadastre imagens da fachada, equipe, produtos, servicos e ambientes para orientar futuras artes."
                title="Nenhuma imagem cadastrada"
              />
            )}
          </div>
        </SectionCard>
      </section>
    </main>
  );
}
