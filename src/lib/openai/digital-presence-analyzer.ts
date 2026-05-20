import { openai } from "@/lib/openai/openai-client";
import { assertOpenAIKeyConfigured, getActiveAISettings } from "@/lib/openai/settings";

export type AnalyzeDigitalPresenceInput = Readonly<{
  companyName: string;
  website: string;
  instagram?: string | null;
  websiteContext: string;
}>;

export type DigitalPresenceAnalysis = Readonly<{
  businessSegment: string;
  businessSpecialty: string;
  description: string;
  services: string;
  differentiators: string;
  targetAudience: string;
  recommendedTone: string;
  defaultCta: string;
  postIdeas: string[];
  designNotes: string;
}>;

function assertDigitalPresenceAnalysis(value: unknown): DigitalPresenceAnalysis {
  if (!value || typeof value !== "object") {
    throw new Error("A OpenAI retornou uma resposta invalida.");
  }

  const data = value as Partial<DigitalPresenceAnalysis>;

  if (
    typeof data.description !== "string" ||
    typeof data.businessSegment !== "string" ||
    typeof data.businessSpecialty !== "string" ||
    typeof data.services !== "string" ||
    typeof data.differentiators !== "string" ||
    typeof data.targetAudience !== "string" ||
    typeof data.recommendedTone !== "string" ||
    typeof data.defaultCta !== "string" ||
    typeof data.designNotes !== "string" ||
    !Array.isArray(data.postIdeas)
  ) {
    throw new Error("A OpenAI retornou um JSON fora do formato esperado.");
  }

  return {
    businessSegment: data.businessSegment,
    businessSpecialty: data.businessSpecialty,
    description: data.description,
    services: data.services,
    differentiators: data.differentiators,
    targetAudience: data.targetAudience,
    recommendedTone: data.recommendedTone,
    defaultCta: data.defaultCta,
    postIdeas: data.postIdeas.map(String),
    designNotes: data.designNotes
  };
}

export async function analyzeDigitalPresenceWithOpenAI(
  input: AnalyzeDigitalPresenceInput
): Promise<DigitalPresenceAnalysis> {
  assertOpenAIKeyConfigured();
  const settings = await getActiveAISettings();
  const prompt = [
    "Analise a presenca digital publica de uma empresa brasileira a partir do HTML limpo do site informado.",
    "O Instagram nao deve ser raspado nesta etapa; use apenas o @ informado como sinal de marca e canal.",
    `Empresa: ${input.companyName}`,
    `Site analisado: ${input.website}`,
    input.instagram ? `Instagram informado: ${input.instagram}` : null,
    `Dados coletados do site:\n${input.websiteContext}`,
    "Transforme esses sinais em um perfil de marketing pratico para orientar geradores de posts, legendas, calendario e artes.",
    "Sugira tambem o segmento principal e a especialidade mais provavel usando nomes curtos e em portugues.",
    "Retorne apenas JSON valido com as chaves: businessSegment, businessSpecialty, description, services, differentiators, targetAudience, recommendedTone, defaultCta, postIdeas, designNotes.",
    "postIdeas deve ser um array de strings com ideias objetivas de posts."
  ]
    .filter(Boolean)
    .join("\n");

  const completion = await openai.chat.completions.create({
    model: settings.textModel,
    messages: [
      {
        role: "system",
        content:
          "Voce e um consultor de marketing para pequenos negocios brasileiros. Extraia apenas informacoes sustentadas pelo contexto e escreva de forma clara para usuarios leigos."
      },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" },
    temperature: settings.temperature,
    max_tokens: settings.maxTokens
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("A OpenAI nao retornou conteudo.");
  }

  return assertDigitalPresenceAnalysis(JSON.parse(content));
}
