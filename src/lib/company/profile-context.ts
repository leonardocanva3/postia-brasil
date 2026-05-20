import { prisma } from "@/lib/database/prisma";

export type CompanyProfileContext = Readonly<{
  website?: string | null;
  instagram?: string | null;
  description?: string | null;
  services?: string | null;
  differentiators?: string | null;
  targetAudience?: string | null;
  recommendedTone?: string | null;
  defaultCta?: string | null;
  brandColors?: string[];
  logoUrl?: string | null;
  postIdeas?: string[];
  designNotes?: string | null;
  images?: Array<{
    title: string;
    type: string;
    description?: string | null;
    tags: string[];
    imageUrl: string;
  }>;
}>;

export async function getCompanyProfileContext(companyId: string) {
  return prisma.company.findUnique({
    where: { id: companyId },
    select: {
      website: true,
      instagram: true,
      description: true,
      services: true,
      differentiators: true,
      targetAudience: true,
      recommendedTone: true,
      defaultCta: true,
      brandColors: true,
      logoUrl: true,
      postIdeas: true,
      designNotes: true,
      images: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        select: {
          title: true,
          type: true,
          description: true,
          tags: true,
          imageUrl: true
        },
        take: 10
      }
    }
  });
}

export function formatCompanyProfileContext(
  profile?: CompanyProfileContext | null
) {
  if (!profile) {
    return "Perfil da empresa ainda nao preenchido.";
  }

  return [
    profile.website ? `Site: ${profile.website}` : null,
    profile.instagram ? `Instagram: ${profile.instagram}` : null,
    profile.description ? `Descricao: ${profile.description}` : null,
    profile.services ? `Servicos: ${profile.services}` : null,
    profile.differentiators ? `Diferenciais: ${profile.differentiators}` : null,
    profile.targetAudience ? `Publico-alvo: ${profile.targetAudience}` : null,
    profile.recommendedTone
      ? `Tom de voz recomendado: ${profile.recommendedTone}`
      : null,
    profile.defaultCta ? `CTA padrao: ${profile.defaultCta}` : null,
    profile.brandColors?.length
      ? `Cores da marca: ${profile.brandColors.join(", ")}`
      : null,
    profile.logoUrl ? `Logo: ${profile.logoUrl}` : null,
    profile.postIdeas?.length ? `Ideias de posts: ${profile.postIdeas.join("; ")}` : null,
    profile.designNotes
      ? `Informacoes para futuras artes: ${profile.designNotes}`
      : null,
    profile.images?.length
      ? `Banco de imagens ativo: ${profile.images
          .map((image) =>
            [
              image.title,
              `tipo ${image.type}`,
              image.description,
              image.tags.length ? `tags ${image.tags.join(", ")}` : null,
              `url ${image.imageUrl}`
            ]
              .filter(Boolean)
              .join(" | ")
          )
          .join("; ")}`
      : null
  ]
    .filter(Boolean)
    .join("\n");
}
