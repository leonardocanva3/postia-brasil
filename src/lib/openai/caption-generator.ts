import { openai } from "@/lib/openai/openai-client";
import {
  type CompanyProfileContext,
  formatCompanyProfileContext
} from "@/lib/company/profile-context";
import { assertOpenAIKeyConfigured, getActiveAISettings } from "@/lib/openai/settings";

export type GenerateCaptionInput = Readonly<{
  subject: string;
  platform: string;
  tone: string;
  hashtagCount: number;
  useEmojis: boolean;
  companyProfile?: CompanyProfileContext | null;
}>;

export type GeneratedCaptionOutput = Readonly<{
  caption: string;
  emojis: string[];
  hashtags: string[];
  cta: string;
}>;

function assertGeneratedCaptionOutput(value: unknown): GeneratedCaptionOutput {
  if (!value || typeof value !== "object") {
    throw new Error("A OpenAI retornou uma resposta invalida.");
  }

  const data = value as Partial<GeneratedCaptionOutput>;

  if (
    typeof data.caption !== "string" ||
    typeof data.cta !== "string" ||
    !Array.isArray(data.emojis) ||
    !Array.isArray(data.hashtags)
  ) {
    throw new Error("A OpenAI retornou um JSON fora do formato esperado.");
  }

  return {
    caption: data.caption,
    cta: data.cta,
    emojis: data.emojis.map(String),
    hashtags: data.hashtags.map(String)
  };
}

export function buildCaptionGeneratorPrompt(input: GenerateCaptionInput) {
  return [
    "Gere uma legenda profissional em portugues do Brasil para redes sociais.",
    `Assunto da legenda: ${input.subject}`,
    `Plataforma: ${input.platform}`,
    `Tom de voz: ${input.tone}`,
    `Quantidade de hashtags: ${input.hashtagCount}`,
    `Usar emojis: ${input.useEmojis ? "sim" : "nao"}`,
    `Contexto do perfil da empresa:\n${formatCompanyProfileContext(
      input.companyProfile
    )}`,
    "Retorne apenas JSON valido com as chaves: caption, emojis, hashtags, cta.",
    "emojis e hashtags devem ser arrays de strings.",
    "Se emojis nao forem usados, retorne emojis como array vazio."
  ].join("\n");
}

export async function generateCaptionWithOpenAI(
  input: GenerateCaptionInput
): Promise<GeneratedCaptionOutput> {
  assertOpenAIKeyConfigured();
  const settings = await getActiveAISettings();
  const prompt = buildCaptionGeneratorPrompt(input);

  const completion = await openai.chat.completions.create({
    model: settings.textModel,
    messages: [
      {
        role: "system",
        content:
          "Voce e um copywriter de social media especializado em legendas para empresas brasileiras."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" },
    temperature: settings.temperature,
    max_tokens: settings.maxTokens
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("A OpenAI nao retornou conteudo.");
  }

  return assertGeneratedCaptionOutput(JSON.parse(content));
}
