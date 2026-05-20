import type { ArtFormat, ArtStyle } from "@prisma/client";
import { listRealArtTemplates, type RealArtTemplate } from "@/lib/art/templates";

function normalize(value?: string | null) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function selectRealArtTemplate(input: {
  segmentName?: string | null;
  specialtyName?: string | null;
  style?: ArtStyle | null;
  objective?: string | null;
  format: ArtFormat;
  hasImage?: boolean;
}): RealArtTemplate {
  const segment = normalize(input.segmentName);
  const specialty = normalize(input.specialtyName);
  const objective = normalize(input.objective);
  const candidates = listRealArtTemplates().filter((template) =>
    template.supportedFormats.includes(input.format)
  );

  const scored = candidates
    .map((template) => {
      let score = 0;
      const templateSegment = normalize(template.recommendedSegment);
      const templateSpecialty = normalize(template.recommendedSpecialty);

      if (templateSegment && segment.includes(templateSegment)) score += 30;
      if (templateSpecialty && specialty.includes(templateSpecialty)) score += 45;
      if (input.style && template.recommendedStyle === input.style) score += 20;
      if (input.hasImage && /imagem|foto|produto|sorriso|frota|carro|imovel/.test(normalize(template.layoutStructure))) {
        score += 5;
      }
      if (/oferta|promocao|preco|whatsapp|combo/.test(objective) && template.textLevel === "alto") {
        score += 15;
      }
      if (/educa|dica|guia|explica/.test(objective) && template.textLevel !== "alto") {
        score += 10;
      }

      return { template, score };
    })
    .sort((left, right) => right.score - left.score);

  return scored[0]?.template ?? candidates[0] ?? listRealArtTemplates()[0];
}
