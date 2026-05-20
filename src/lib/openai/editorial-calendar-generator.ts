import { openai } from "@/lib/openai/openai-client";
import {
  type CompanyProfileContext,
  formatCompanyProfileContext
} from "@/lib/company/profile-context";

export type GenerateEditorialCalendarInput = Readonly<{
  businessType: string;
  referenceMonth: string;
  ideasCount: number;
  platforms: string[];
  tone: string;
  companyProfile?: CompanyProfileContext | null;
}>;

export type EditorialCalendarSuggestion = Readonly<{
  title: string;
  description: string;
  platform: string;
  contentType: string;
  objective: string;
  suggestedDate: string;
}>;

export type GeneratedEditorialCalendarOutput = Readonly<{
  items: EditorialCalendarSuggestion[];
}>;

function assertGeneratedEditorialCalendarOutput(
  value: unknown
): GeneratedEditorialCalendarOutput {
  if (!value || typeof value !== "object") {
    throw new Error("A OpenAI retornou uma resposta invalida.");
  }

  const data = value as Partial<GeneratedEditorialCalendarOutput>;

  if (!Array.isArray(data.items)) {
    throw new Error("A OpenAI retornou um JSON fora do formato esperado.");
  }

  return {
    items: data.items.map((item) => {
      const suggestion = item as Partial<EditorialCalendarSuggestion>;

      if (
        typeof suggestion.title !== "string" ||
        typeof suggestion.description !== "string" ||
        typeof suggestion.platform !== "string" ||
        typeof suggestion.contentType !== "string" ||
        typeof suggestion.objective !== "string" ||
        typeof suggestion.suggestedDate !== "string"
      ) {
        throw new Error("A OpenAI retornou uma sugestao incompleta.");
      }

      return {
        title: suggestion.title,
        description: suggestion.description,
        platform: suggestion.platform,
        contentType: suggestion.contentType,
        objective: suggestion.objective,
        suggestedDate: suggestion.suggestedDate
      };
    })
  };
}

export function buildEditorialCalendarPrompt(input: GenerateEditorialCalendarInput) {
  return [
    "Gere sugestoes de calendario editorial em portugues do Brasil.",
    `Tipo de negocio: ${input.businessType}`,
    `Mes de referencia: ${input.referenceMonth}`,
    `Quantidade de ideias: ${input.ideasCount}`,
    `Plataformas: ${input.platforms.join(", ")}`,
    `Tom de voz: ${input.tone}`,
    `Contexto do perfil da empresa:\n${formatCompanyProfileContext(
      input.companyProfile
    )}`,
    "Distribua as ideias ao longo do mes de referencia.",
    "Retorne apenas JSON valido no formato: { \"items\": [...] }.",
    "Cada item deve ter: title, description, platform, contentType, objective, suggestedDate.",
    "suggestedDate deve estar no formato YYYY-MM-DD."
  ].join("\n");
}

export async function generateEditorialCalendarWithOpenAI(
  input: GenerateEditorialCalendarInput
): Promise<GeneratedEditorialCalendarOutput> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Configure OPENAI_API_KEY para gerar calendario editorial.");
  }

  const prompt = buildEditorialCalendarPrompt(input);

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Voce e um estrategista de conteudo para empresas brasileiras e cria calendarios editoriais claros e acionaveis."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.7
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("A OpenAI nao retornou conteudo.");
  }

  return assertGeneratedEditorialCalendarOutput(JSON.parse(content));
}
