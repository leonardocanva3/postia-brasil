import type { ArtFormat, ArtStyle, DesignerLevel } from "@prisma/client";
import { buildGeneratedArtFormatData } from "@/lib/art/art-format";
import { getDesignerLevelDefinition } from "@/lib/art/designer-levels";
import { getArtStyleDefinition } from "@/lib/art/styles";
import type { RealArtTemplate } from "@/lib/art/templates";

export type ArtBriefInput = Readonly<{
  subject: string;
  objective: string;
  platform: string;
  format: ArtFormat;
  style?: ArtStyle | null;
  designerLevel?: DesignerLevel | null;
  selectedTemplate?: RealArtTemplate | null;
  companyImageId?: string | null;
  useLogo?: boolean;
  useBrandColors?: boolean;
}>;

export function buildArtBriefDraft(input: ArtBriefInput) {
  const style = input.style ? getArtStyleDefinition(input.style) : null;
  const designerLevel = input.designerLevel
    ? getDesignerLevelDefinition(input.designerLevel)
    : null;
  const template = input.selectedTemplate ?? null;

  return {
    ...buildGeneratedArtFormatData(input.format),
    subject: input.subject,
    objective: input.objective,
    platform: input.platform,
    style: input.style ?? null,
    designerLevel: input.designerLevel ?? null,
    visualDirection: style?.visualStyle ?? null,
    typographyStyle: style?.typographyStyle ?? null,
    textDensity: style?.textDensity ?? null,
    CTAIntensity: style?.ctaIntensity ?? null,
    iconStyle: style?.iconStyle ?? null,
    compositionHints: style?.compositionHints ?? null,
    visualComplexity: designerLevel?.visualComplexity ?? null,
    typographyRefinement: designerLevel?.typographyIntensity ?? null,
    compositionSophistication:
      designerLevel?.compositionSophistication ?? null,
    cinematicLevel: designerLevel?.cinematicLevel ?? null,
    selectedTemplate: template
      ? {
          id: template.id,
          name: template.name,
          recommendedSegment: template.recommendedSegment,
          recommendedSpecialty: template.recommendedSpecialty ?? null
        }
      : null,
    layoutStructure: template?.layoutStructure ?? null,
    logoPlacement: template?.logoPlacement ?? null,
    imagePlacement: template?.imagePlacement ?? null,
    titlePlacement: template?.titlePlacement ?? null,
    subtitlePlacement: template?.subtitlePlacement ?? null,
    ctaPlacement: template?.ctaPlacement ?? null,
    graphicElements: template?.graphicElements ?? [],
    compositionRules: template?.compositionNotes ?? null,
    companyImageId: input.companyImageId ?? null,
    useLogo: input.useLogo ?? true,
    useBrandColors: input.useBrandColors ?? true,
    outputMimeType: "image/png",
    quality: "high",
    title: input.subject
  };
}
