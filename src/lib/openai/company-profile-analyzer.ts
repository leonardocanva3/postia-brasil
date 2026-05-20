import { openai } from "@/lib/openai/openai-client";

export type AnalyzeCompanyPresenceInput = Readonly<{
  companyName: string;
  website?: string | null;
  instagram?: string | null;
  collectedInfo: string;
}>;

export type CompanyProfileAnalysis = Readonly<{
  description: string;
  services: string;
  differentiators: string;
  targetAudience: string;
  recommendedTone: string;
  defaultCta: string;
  postIdeas: string[];
  designNotes: string;
}>;

function assertCompanyProfileAnalysis(value: unknown): CompanyProfileAnalysis {
  if (!value || typeof value !== "object") {
    throw new Error("A OpenAI retornou uma resposta invalida.");
  }

  const data = value as Partial<CompanyProfileAnalysis>;

  if (
    typeof data.description !== "string" ||
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

export async function analyzeCompanyPresenceWithOpenAI(
  input: AnalyzeCompanyPresenceInput
): Promise<CompanyProfileAnalysis> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Configure OPENAI_API_KEY para analisar o perfil da empresa.");
  }

  const prompt = [
    "Analise a presenca digital de uma empresa brasileira a partir de informacoes coladas manualmente pelo usuario.",
    "Nao presuma que houve scraping automatico.",
    `Empresa: ${input.companyName}`,
    input.website ? `Site informado: ${input.website}` : null,
    input.instagram ? `Instagram informado: ${input.instagram}` : null,
    `Informacoes coletadas do site/Instagram:\n${input.collectedInfo}`,
    "Retorne apenas JSON valido com as chaves: description, services, differentiators, targetAudience, recommendedTone, defaultCta, postIdeas, designNotes.",
    "postIdeas deve ser um array de strings."
  ]
    .filter(Boolean)
    .join("\n");

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Voce e um consultor de marketing que transforma sinais digitais em um perfil comercial claro e util para IA gerar conteudo."
      },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" },
    temperature: 0.4
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("A OpenAI nao retornou conteudo.");
  }

  return assertCompanyProfileAnalysis(JSON.parse(content));
}
