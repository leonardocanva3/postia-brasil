import type { ArtFormat, ArtStyle, DesignerLevel } from "@prisma/client";
import {
  listArtFormatOptions,
  listArtStyleOptions,
  listDesignerLevelOptions,
  listRealArtTemplates
} from "@/lib/art";
import {
  type CompanyProfileContext,
  formatCompanyProfileContext
} from "@/lib/company/profile-context";
import { openai } from "@/lib/openai/openai-client";
import { assertOpenAIKeyConfigured, getActiveAISettings } from "@/lib/openai/settings";

export type GenerateCampaignInput = Readonly<{
  mainTopic: string;
  objective: string;
  platform: string;
  startDate: string;
  endDate: string;
  contentCount: number;
  desiredFormats: ArtFormat[];
  artStyle?: ArtStyle | null;
  designerLevel?: DesignerLevel | null;
  companyProfile?: CompanyProfileContext | null;
}>;

export type CampaignItemSuggestion = Readonly<{
  title: string;
  contentType: string;
  postIdea: string;
  caption: string;
  cta: string;
  hashtags: string[];
  suggestedDate: string;
  artFormat: ArtFormat;
  artStyle: ArtStyle | null;
  designerLevel: DesignerLevel;
  artBriefing: string;
}>;

export type GeneratedCampaignOutput = Readonly<{
  title: string;
  items: CampaignItemSuggestion[];
}>;

function assertEnumValue<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T
) {
  return typeof value === "string" && allowed.includes(value as T)
    ? (value as T)
    : fallback;
}

function assertGeneratedCampaignOutput(
  value: unknown,
  input: GenerateCampaignInput
): GeneratedCampaignOutput {
  if (!value || typeof value !== "object") {
    throw new Error("A OpenAI retornou uma resposta invalida.");
  }

  const data = value as { title?: unknown; items?: unknown };
  const allowedFormats = listArtFormatOptions().map((format) => format.value);
  const allowedStyles = listArtStyleOptions().map((style) => style.value);
  const allowedDesignerLevels = listDesignerLevelOptions().map((level) => level.value);

  if (typeof data.title !== "string" || !Array.isArray(data.items)) {
    throw new Error("A OpenAI retornou um JSON fora do formato esperado.");
  }

  return {
    title: data.title,
    items: data.items.slice(0, input.contentCount).map((item, index) => {
      const suggestion = item as Partial<CampaignItemSuggestion>;

      if (
        typeof suggestion.title !== "string" ||
        typeof suggestion.contentType !== "string" ||
        typeof suggestion.postIdea !== "string" ||
        typeof suggestion.caption !== "string" ||
        typeof suggestion.cta !== "string" ||
        typeof suggestion.suggestedDate !== "string" ||
        typeof suggestion.artBriefing !== "string" ||
        !Array.isArray(suggestion.hashtags)
      ) {
        throw new Error("A OpenAI retornou um item de campanha incompleto.");
      }

      return {
        title: suggestion.title,
        contentType: suggestion.contentType,
        postIdea: suggestion.postIdea,
        caption: suggestion.caption,
        cta: suggestion.cta,
        hashtags: suggestion.hashtags.map(String),
        suggestedDate: suggestion.suggestedDate,
        artFormat: assertEnumValue(
          suggestion.artFormat,
          allowedFormats,
          input.desiredFormats[index % input.desiredFormats.length] ?? "FEED_QUADRADO"
        ),
        artStyle: suggestion.artStyle
          ? assertEnumValue(suggestion.artStyle, allowedStyles, input.artStyle ?? "CLEAN_MODERNO")
          : input.artStyle ?? null,
        designerLevel: assertEnumValue(
          suggestion.designerLevel,
          allowedDesignerLevels,
          input.designerLevel ?? "SENIOR"
        ),
        artBriefing: suggestion.artBriefing
      };
    })
  };
}

export function buildCampaignPrompt(input: GenerateCampaignInput) {
  return [
    "Crie uma campanha completa de conteudo para uma empresa brasileira.",
    `Tema principal: ${input.mainTopic}`,
    `Objetivo: ${input.objective}`,
    `Plataforma: ${input.platform}`,
    `Periodo: ${input.startDate} ate ${input.endDate}`,
    `Quantidade de conteudos: ${input.contentCount}`,
    `Formatos desejados: ${input.desiredFormats.join(", ")}`,
    input.artStyle ? `Estilo visual solicitado: ${input.artStyle}` : "Estilo visual: automatico",
    input.designerLevel
      ? `Nivel de designer solicitado: ${input.designerLevel}`
      : "Nivel de designer: automatico",
    `Perfil e contexto da empresa:\n${formatCompanyProfileContext(input.companyProfile)}`,
    `Templates reais disponiveis:\n${listRealArtTemplates()
      .map(
        (template) =>
          `${template.id}: ${template.name} | ${template.recommendedSegment} | ${template.layoutStructure}`
      )
      .join("\n")}`,
    "Cada item deve conter ideia de post, legenda pronta, CTA, hashtags, data sugerida, briefing de arte, formato, estilo e nivel de designer.",
    "Distribua as datas dentro do periodo informado.",
    "Respeite notas de compliance do nicho quando existirem.",
    "Retorne apenas JSON valido com o formato: { \"title\": string, \"items\": [...] }.",
    "Cada item deve ter: title, contentType, postIdea, caption, cta, hashtags, suggestedDate, artFormat, artStyle, designerLevel, artBriefing.",
    "suggestedDate deve estar no formato YYYY-MM-DD."
  ].join("\n");
}

export async function generateCampaignWithOpenAI(
  input: GenerateCampaignInput
): Promise<GeneratedCampaignOutput> {
  assertOpenAIKeyConfigured();
  const settings = await getActiveAISettings();
  const completion = await openai.chat.completions.create({
    model: settings.textModel,
    messages: [
      {
        role: "system",
        content:
          "Voce e um estrategista senior de social media e diretor de arte para pequenas empresas brasileiras."
      },
      {
        role: "user",
        content: buildCampaignPrompt(input)
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

  return assertGeneratedCampaignOutput(JSON.parse(content), input);
}
