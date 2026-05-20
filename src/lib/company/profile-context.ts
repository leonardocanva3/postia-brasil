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
  businessSegment?: {
    name: string;
    description: string;
  } | null;
  businessSpecialty?: {
    name: string;
    description: string;
    keywords: string[];
    recommendedTone: string;
    commonServices: string[];
    contentIdeas: string[];
    visualStyle: string;
    colorSuggestions: string[];
    iconSuggestions: string[];
    complianceNotes?: string | null;
  } | null;
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
      businessSegment: {
        select: {
          name: true,
          description: true
        }
      },
      businessSpecialty: {
        select: {
          name: true,
          description: true,
          keywords: true,
          recommendedTone: true,
          commonServices: true,
          contentIdeas: true,
          visualStyle: true,
          colorSuggestions: true,
          iconSuggestions: true,
          complianceNotes: true
        }
      },
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
    profile.businessSegment
      ? `Segmento principal: ${profile.businessSegment.name} - ${profile.businessSegment.description}`
      : null,
    profile.businessSpecialty
      ? [
          `Especialidade: ${profile.businessSpecialty.name}`,
          `Descricao da especialidade: ${profile.businessSpecialty.description}`,
          profile.businessSpecialty.keywords.length
            ? `Keywords da especialidade: ${profile.businessSpecialty.keywords.join(", ")}`
            : null,
          profile.businessSpecialty.commonServices.length
            ? `Servicos comuns da especialidade: ${profile.businessSpecialty.commonServices.join(", ")}`
            : null,
          profile.businessSpecialty.contentIdeas.length
            ? `Ideias de conteudo da especialidade: ${profile.businessSpecialty.contentIdeas.join("; ")}`
            : null,
          `Tom recomendado da especialidade: ${profile.businessSpecialty.recommendedTone}`,
          `Estilo visual sugerido: ${profile.businessSpecialty.visualStyle}`,
          profile.businessSpecialty.colorSuggestions.length
            ? `Cores sugeridas para o nicho: ${profile.businessSpecialty.colorSuggestions.join(", ")}`
            : null,
          profile.businessSpecialty.iconSuggestions.length
            ? `Icones sugeridos para o nicho: ${profile.businessSpecialty.iconSuggestions.join(", ")}`
            : null,
          profile.businessSpecialty.complianceNotes
            ? `Notas de compliance do nicho: ${profile.businessSpecialty.complianceNotes}`
            : null
        ]
          .filter(Boolean)
          .join("\n")
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
