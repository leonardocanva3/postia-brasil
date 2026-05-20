import { ArtFormat } from "@prisma/client";

export type ArtSafeArea = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
}>;

export type ArtTemplateLayout = Readonly<{
  textSafeArea: ArtSafeArea;
  logoPosition: ArtSafeArea;
  mainImageArea: ArtSafeArea;
  ctaArea: ArtSafeArea;
}>;

export type ArtFormatDefinition = Readonly<{
  value: ArtFormat;
  label: string;
  width: number;
  height: number;
  aspectRatio: "4:5" | "1:1" | "9:16";
  layout: ArtTemplateLayout;
}>;

export const ART_FORMATS: Record<ArtFormat, ArtFormatDefinition> = {
  [ArtFormat.FEED_RETRATO]: {
    value: ArtFormat.FEED_RETRATO,
    label: "Feed Retrato",
    width: 1080,
    height: 1350,
    aspectRatio: "4:5",
    layout: {
      textSafeArea: { x: 96, y: 140, width: 888, height: 760 },
      logoPosition: { x: 96, y: 96, width: 180, height: 90 },
      mainImageArea: { x: 0, y: 0, width: 1080, height: 860 },
      ctaArea: { x: 96, y: 1080, width: 888, height: 170 }
    }
  },
  [ArtFormat.FEED_QUADRADO]: {
    value: ArtFormat.FEED_QUADRADO,
    label: "Feed Quadrado",
    width: 1080,
    height: 1080,
    aspectRatio: "1:1",
    layout: {
      textSafeArea: { x: 96, y: 130, width: 888, height: 610 },
      logoPosition: { x: 96, y: 86, width: 180, height: 90 },
      mainImageArea: { x: 0, y: 0, width: 1080, height: 690 },
      ctaArea: { x: 96, y: 850, width: 888, height: 150 }
    }
  },
  [ArtFormat.REELS_STORIES]: {
    value: ArtFormat.REELS_STORIES,
    label: "Reels e Stories",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    layout: {
      textSafeArea: { x: 96, y: 220, width: 888, height: 1120 },
      logoPosition: { x: 96, y: 120, width: 180, height: 90 },
      mainImageArea: { x: 0, y: 0, width: 1080, height: 1280 },
      ctaArea: { x: 96, y: 1560, width: 888, height: 220 }
    }
  }
};

export function getArtFormatDefinition(format: ArtFormat) {
  return ART_FORMATS[format];
}

export function listArtFormatOptions() {
  return Object.values(ART_FORMATS);
}

export function buildGeneratedArtFormatData(format: ArtFormat) {
  const definition = getArtFormatDefinition(format);

  return {
    format: definition.value,
    width: definition.width,
    height: definition.height,
    aspectRatio: definition.aspectRatio,
    templateMetadata: {
      label: definition.label,
      layout: definition.layout
    }
  };
}
