import type { ArtFormat } from "@prisma/client";
import type { ArtFormatDefinition } from "@/lib/art";

export type ArtGenerationDraft = Readonly<{
  companyId: string;
  userId: string;
  format: ArtFormat;
  subject: string;
  objective: string;
  platform: string;
  companyImageId?: string;
  useLogo: boolean;
  useBrandColors: boolean;
  sourceType?: "post" | "caption" | "scheduled_post";
  sourceId?: string;
}>;

export type ArtTemplateRenderContext = Readonly<{
  format: ArtFormatDefinition;
  headline?: string;
  body?: string;
  cta?: string;
  logoUrl?: string;
  mainImageUrl?: string;
  brandColors?: string[];
  outputMimeType: "image/png";
  quality: "high";
}>;
