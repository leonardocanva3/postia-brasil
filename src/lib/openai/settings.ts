import { prisma } from "@/lib/database/prisma";

export const OPENAI_MISSING_KEY_MESSAGE =
  "Chave da OpenAI não configurada. Configure OPENAI_API_KEY no arquivo .env.";

export const DEFAULT_AI_SETTINGS = {
  provider: "OPENAI",
  textModel: "gpt-4.1-mini",
  imageModel: "gpt-image-1",
  temperature: 0.7,
  maxTokens: 1200,
  isActive: true
} as const;

export type ResolvedAISettings = Readonly<{
  provider: string;
  textModel: string;
  imageModel: string;
  temperature: number;
  maxTokens: number;
  isActive: boolean;
}>;

export function hasOpenAIKey() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function assertOpenAIKeyConfigured() {
  if (!hasOpenAIKey()) {
    throw new Error(OPENAI_MISSING_KEY_MESSAGE);
  }
}

export async function getActiveAISettings(): Promise<ResolvedAISettings> {
  const settings = await prisma.aISettings.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: "desc" }
  });

  if (!settings) {
    return DEFAULT_AI_SETTINGS;
  }

  return {
    provider: settings.provider,
    textModel: settings.textModel,
    imageModel: settings.imageModel,
    temperature: settings.temperature,
    maxTokens: settings.maxTokens,
    isActive: settings.isActive
  };
}

export async function getOrCreateAISettings() {
  const settings = await prisma.aISettings.findFirst({
    orderBy: { updatedAt: "desc" }
  });

  if (settings) {
    return settings;
  }

  return prisma.aISettings.create({
    data: DEFAULT_AI_SETTINGS
  });
}
