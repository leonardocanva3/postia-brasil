-- Add commercial limits to plans.
ALTER TABLE "plans"
ADD COLUMN "monthlyArtLimit" INTEGER,
ADD COLUMN "monthlyAnalysisLimit" INTEGER,
ADD COLUMN "monthlyCampaignLimit" INTEGER;

-- Persist conversions generated from campaign items.
ALTER TABLE "campaign_items"
ADD COLUMN "generatedPostId" TEXT,
ADD COLUMN "generatedCaptionId" TEXT,
ADD COLUMN "generatedArtId" TEXT,
ADD COLUMN "scheduledPostId" TEXT;

CREATE INDEX "campaign_items_generatedPostId_idx" ON "campaign_items"("generatedPostId");
CREATE INDEX "campaign_items_generatedCaptionId_idx" ON "campaign_items"("generatedCaptionId");
CREATE INDEX "campaign_items_generatedArtId_idx" ON "campaign_items"("generatedArtId");
CREATE INDEX "campaign_items_scheduledPostId_idx" ON "campaign_items"("scheduledPostId");

ALTER TABLE "campaign_items"
ADD CONSTRAINT "campaign_items_generatedPostId_fkey"
FOREIGN KEY ("generatedPostId") REFERENCES "generated_posts"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "campaign_items"
ADD CONSTRAINT "campaign_items_generatedCaptionId_fkey"
FOREIGN KEY ("generatedCaptionId") REFERENCES "generated_captions"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "campaign_items"
ADD CONSTRAINT "campaign_items_generatedArtId_fkey"
FOREIGN KEY ("generatedArtId") REFERENCES "generated_arts"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "campaign_items"
ADD CONSTRAINT "campaign_items_scheduledPostId_fkey"
FOREIGN KEY ("scheduledPostId") REFERENCES "scheduled_posts"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
