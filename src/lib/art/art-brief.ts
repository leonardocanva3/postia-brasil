import type { ArtFormat } from "@prisma/client";
import { buildGeneratedArtFormatData } from "@/lib/art/art-format";

export type ArtBriefInput = Readonly<{
  subject: string;
  objective: string;
  platform: string;
  format: ArtFormat;
  companyImageId?: string | null;
  useLogo?: boolean;
  useBrandColors?: boolean;
}>;

export function buildArtBriefDraft(input: ArtBriefInput) {
  return {
    ...buildGeneratedArtFormatData(input.format),
    subject: input.subject,
    objective: input.objective,
    platform: input.platform,
    companyImageId: input.companyImageId ?? null,
    useLogo: input.useLogo ?? true,
    useBrandColors: input.useBrandColors ?? true,
    outputMimeType: "image/png",
    quality: "high",
    title: input.subject
  };
}
