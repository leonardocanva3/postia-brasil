CREATE TYPE "CampaignStatus" AS ENUM (
    'DRAFT',
    'PLANNED',
    'GENERATED',
    'SCHEDULED',
    'PUBLISHED',
    'CANCELED'
);

CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "mainTopic" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'GENERATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "campaign_items" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "postIdea" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "cta" TEXT NOT NULL,
    "hashtags" TEXT[],
    "suggestedDate" TIMESTAMP(3) NOT NULL,
    "artFormat" "ArtFormat" NOT NULL,
    "artStyle" "ArtStyle",
    "designerLevel" "DesignerLevel" NOT NULL DEFAULT 'SENIOR',
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "campaigns_companyId_status_idx" ON "campaigns"("companyId", "status");
CREATE INDEX "campaigns_companyId_createdAt_idx" ON "campaigns"("companyId", "createdAt");
CREATE INDEX "campaigns_userId_idx" ON "campaigns"("userId");
CREATE INDEX "campaign_items_campaignId_idx" ON "campaign_items"("campaignId");
CREATE INDEX "campaign_items_companyId_suggestedDate_idx" ON "campaign_items"("companyId", "suggestedDate");
CREATE INDEX "campaign_items_userId_idx" ON "campaign_items"("userId");

ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "campaign_items" ADD CONSTRAINT "campaign_items_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "campaign_items" ADD CONSTRAINT "campaign_items_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "campaign_items" ADD CONSTRAINT "campaign_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
