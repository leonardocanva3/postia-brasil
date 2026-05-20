CREATE TABLE "ai_settings" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'OPENAI',
    "textModel" TEXT NOT NULL DEFAULT 'gpt-4.1-mini',
    "imageModel" TEXT NOT NULL DEFAULT 'gpt-image-1',
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "maxTokens" INTEGER NOT NULL DEFAULT 1200,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_settings_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ai_settings_isActive_idx" ON "ai_settings"("isActive");
