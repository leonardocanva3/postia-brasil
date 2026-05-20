CREATE TABLE "business_segments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_segments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "business_specialties" (
    "id" TEXT NOT NULL,
    "segmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "keywords" TEXT[],
    "recommendedTone" TEXT NOT NULL,
    "commonServices" TEXT[],
    "contentIdeas" TEXT[],
    "visualStyle" TEXT NOT NULL,
    "colorSuggestions" TEXT[],
    "iconSuggestions" TEXT[],
    "complianceNotes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_specialties_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "art_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "segmentId" TEXT,
    "specialtyId" TEXT,
    "format" "ArtFormat" NOT NULL,
    "description" TEXT NOT NULL,
    "visualStyle" TEXT NOT NULL,
    "layoutHints" TEXT NOT NULL,
    "previewUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "art_templates_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "companies" ADD COLUMN "businessSegmentId" TEXT;
ALTER TABLE "companies" ADD COLUMN "businessSpecialtyId" TEXT;
ALTER TABLE "generated_arts" ADD COLUMN "artTemplateId" TEXT;

CREATE UNIQUE INDEX "business_segments_slug_key" ON "business_segments"("slug");
CREATE INDEX "business_segments_isActive_idx" ON "business_segments"("isActive");
CREATE UNIQUE INDEX "business_specialties_slug_key" ON "business_specialties"("slug");
CREATE INDEX "business_specialties_segmentId_isActive_idx" ON "business_specialties"("segmentId", "isActive");
CREATE UNIQUE INDEX "art_templates_slug_key" ON "art_templates"("slug");
CREATE INDEX "art_templates_segmentId_isActive_idx" ON "art_templates"("segmentId", "isActive");
CREATE INDEX "art_templates_specialtyId_isActive_idx" ON "art_templates"("specialtyId", "isActive");
CREATE INDEX "art_templates_format_isActive_idx" ON "art_templates"("format", "isActive");
CREATE INDEX "companies_businessSegmentId_idx" ON "companies"("businessSegmentId");
CREATE INDEX "companies_businessSpecialtyId_idx" ON "companies"("businessSpecialtyId");
CREATE INDEX "generated_arts_artTemplateId_idx" ON "generated_arts"("artTemplateId");

ALTER TABLE "business_specialties" ADD CONSTRAINT "business_specialties_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "business_segments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "art_templates" ADD CONSTRAINT "art_templates_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "business_segments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "art_templates" ADD CONSTRAINT "art_templates_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "business_specialties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "companies" ADD CONSTRAINT "companies_businessSegmentId_fkey" FOREIGN KEY ("businessSegmentId") REFERENCES "business_segments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "companies" ADD CONSTRAINT "companies_businessSpecialtyId_fkey" FOREIGN KEY ("businessSpecialtyId") REFERENCES "business_specialties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "generated_arts" ADD CONSTRAINT "generated_arts_artTemplateId_fkey" FOREIGN KEY ("artTemplateId") REFERENCES "art_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
