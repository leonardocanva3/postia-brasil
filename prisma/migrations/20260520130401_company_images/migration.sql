-- CreateEnum
CREATE TYPE "CompanyImageType" AS ENUM ('FACHADA', 'DONO', 'EQUIPE', 'PRODUTO', 'SERVICO', 'AMBIENTE', 'ANTES_DEPOIS', 'EQUIPAMENTO', 'VEICULO', 'OUTRO');

-- CreateEnum
CREATE TYPE "ArtFormat" AS ENUM ('FEED_RETRATO', 'FEED_QUADRADO', 'REELS_STORIES');

-- CreateEnum
CREATE TYPE "GeneratedArtStatus" AS ENUM ('DRAFT', 'GENERATED', 'FAILED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "brandColors" TEXT[],
ADD COLUMN     "collectedInfo" TEXT,
ADD COLUMN     "defaultCta" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "designNotes" TEXT,
ADD COLUMN     "differentiators" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "postIdeas" TEXT[],
ADD COLUMN     "recommendedTone" TEXT,
ADD COLUMN     "services" TEXT,
ADD COLUMN     "targetAudience" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "company_images" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "CompanyImageType" NOT NULL,
    "description" TEXT,
    "tags" TEXT[],
    "imageUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_arts" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "generatedPostId" TEXT,
    "generatedCaptionId" TEXT,
    "scheduledPostId" TEXT,
    "companyImageId" TEXT,
    "subject" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "format" "ArtFormat" NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "aspectRatio" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "useLogo" BOOLEAN NOT NULL DEFAULT true,
    "useBrandColors" BOOLEAN NOT NULL DEFAULT true,
    "outputMimeType" TEXT NOT NULL DEFAULT 'image/png',
    "quality" TEXT NOT NULL DEFAULT 'high',
    "prompt" TEXT,
    "imageUrl" TEXT,
    "templateMetadata" JSONB,
    "status" "GeneratedArtStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generated_arts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_artworks" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "format" "ArtFormat" NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "status" "GeneratedArtStatus" NOT NULL DEFAULT 'GENERATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generated_artworks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "company_images_companyId_isActive_idx" ON "company_images"("companyId", "isActive");

-- CreateIndex
CREATE INDEX "generated_arts_companyId_createdAt_idx" ON "generated_arts"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "generated_arts_userId_idx" ON "generated_arts"("userId");

-- CreateIndex
CREATE INDEX "generated_arts_generatedPostId_idx" ON "generated_arts"("generatedPostId");

-- CreateIndex
CREATE INDEX "generated_arts_generatedCaptionId_idx" ON "generated_arts"("generatedCaptionId");

-- CreateIndex
CREATE INDEX "generated_arts_scheduledPostId_idx" ON "generated_arts"("scheduledPostId");

-- CreateIndex
CREATE INDEX "generated_arts_companyImageId_idx" ON "generated_arts"("companyImageId");

-- CreateIndex
CREATE INDEX "generated_artworks_companyId_createdAt_idx" ON "generated_artworks"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "generated_artworks_userId_idx" ON "generated_artworks"("userId");

-- AddForeignKey
ALTER TABLE "company_images" ADD CONSTRAINT "company_images_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_arts" ADD CONSTRAINT "generated_arts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_arts" ADD CONSTRAINT "generated_arts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_arts" ADD CONSTRAINT "generated_arts_generatedPostId_fkey" FOREIGN KEY ("generatedPostId") REFERENCES "generated_posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_arts" ADD CONSTRAINT "generated_arts_generatedCaptionId_fkey" FOREIGN KEY ("generatedCaptionId") REFERENCES "generated_captions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_arts" ADD CONSTRAINT "generated_arts_scheduledPostId_fkey" FOREIGN KEY ("scheduledPostId") REFERENCES "scheduled_posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_arts" ADD CONSTRAINT "generated_arts_companyImageId_fkey" FOREIGN KEY ("companyImageId") REFERENCES "company_images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_artworks" ADD CONSTRAINT "generated_artworks_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_artworks" ADD CONSTRAINT "generated_artworks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
