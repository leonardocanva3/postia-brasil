import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const MAX_HTML_BYTES = 500_000;
const MAX_TEXT_CHARS = 12_000;
const FETCH_TIMEOUT_MS = 8_000;

export type DigitalPresenceFetchResult = Readonly<{
  url: string;
  title: string | null;
  metaDescription: string | null;
  headings: string[];
  paragraphs: string[];
  links: Array<{
    text: string;
    href: string;
  }>;
  promptText: string;
}>;

function isPrivateIPv4(address: string) {
  const parts = address.split(".").map(Number);

  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return false;
  }

  const [first, second] = parts;

  return (
    first === 10 ||
    first === 127 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 169 && second === 254) ||
    first === 0
  );
}

function isPrivateIPv6(address: string) {
  const normalized = address.toLowerCase();

  return (
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80:")
  );
}

function assertSafeUrl(siteUrl: string) {
  let url: URL;

  try {
    url = new URL(siteUrl);
  } catch {
    throw new Error("URL do site invalida.");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Use apenas URLs com http ou https.");
  }

  const hostname = url.hostname.toLowerCase();

  if (["localhost", "127.0.0.1", "::1"].includes(hostname) || hostname.endsWith(".local")) {
    throw new Error("Nao e permitido analisar enderecos locais.");
  }

  const ipVersion = isIP(hostname);

  if (
    (ipVersion === 4 && isPrivateIPv4(hostname)) ||
    (ipVersion === 6 && isPrivateIPv6(hostname))
  ) {
    throw new Error("Nao e permitido analisar IPs privados.");
  }

  return url;
}

async function assertPublicResolvedHost(hostname: string) {
  if (isIP(hostname)) {
    return;
  }

  const records = await lookup(hostname, { all: true });

  if (!records.length) {
    throw new Error("Nao foi possivel resolver o dominio informado.");
  }

  const hasUnsafeAddress = records.some((record) => {
    if (record.family === 4) {
      return isPrivateIPv4(record.address);
    }

    if (record.family === 6) {
      return isPrivateIPv6(record.address);
    }

    return true;
  });

  if (hasUnsafeAddress) {
    throw new Error("O dominio informado aponta para endereco privado.");
  }
}

function decodeHtmlEntities(text: string) {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function cleanText(text: string) {
  return decodeHtmlEntities(text)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueLimited(items: string[], limit: number) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of items) {
    const cleaned = cleanText(item);

    if (!cleaned || cleaned.length < 3 || seen.has(cleaned.toLowerCase())) {
      continue;
    }

    seen.add(cleaned.toLowerCase());
    result.push(cleaned);

    if (result.length >= limit) {
      break;
    }
  }

  return result;
}

function extractFirst(html: string, pattern: RegExp) {
  const match = html.match(pattern);

  return match?.[1] ? cleanText(match[1]) : null;
}

function extractAll(html: string, pattern: RegExp, limit: number) {
  return uniqueLimited(
    Array.from(html.matchAll(pattern), (match) => match[1] ?? ""),
    limit
  );
}

function extractLinks(html: string, baseUrl: URL) {
  const links = Array.from(
    html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi),
    (match) => {
      const href = match[1] ?? "";
      const text = cleanText(match[2] ?? "");

      try {
        const resolved = new URL(href, baseUrl);
        const isRelevant =
          resolved.hostname === baseUrl.hostname ||
          /contato|sobre|servico|produto|solu[cç][aã]o|instagram|whatsapp/i.test(
            `${text} ${resolved.href}`
          );

        if (!text || !isRelevant) {
          return null;
        }

        return {
          text,
          href: resolved.href
        };
      } catch {
        return null;
      }
    }
  ).filter((link): link is { text: string; href: string } => Boolean(link));
  const seen = new Set<string>();

  return links.filter((link) => {
    const key = `${link.text.toLowerCase()}|${link.href}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  }).slice(0, 20);
}

function stripUselessHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
}

function buildPromptText(result: Omit<DigitalPresenceFetchResult, "promptText">) {
  return [
    `URL analisada: ${result.url}`,
    result.title ? `Titulo: ${result.title}` : null,
    result.metaDescription ? `Meta description: ${result.metaDescription}` : null,
    result.headings.length ? `Headings:\n${result.headings.join("\n")}` : null,
    result.paragraphs.length ? `Paragrafos:\n${result.paragraphs.join("\n")}` : null,
    result.links.length
      ? `Links relevantes:\n${result.links
          .map((link) => `${link.text} - ${link.href}`)
          .join("\n")}`
      : null
  ]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, MAX_TEXT_CHARS);
}

export async function fetchDigitalPresenceFromWebsite(
  siteUrl: string
): Promise<DigitalPresenceFetchResult> {
  const url = assertSafeUrl(siteUrl);

  await assertPublicResolvedHost(url.hostname);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": "PostIA-Brasil/1.0 DigitalPresenceAnalyzer"
      },
      redirect: "follow",
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error("O site retornou erro ao acessar a pagina.");
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (!contentType.includes("text/html")) {
      throw new Error("A URL informada nao retornou uma pagina HTML.");
    }

    const rawHtml = (await response.text()).slice(0, MAX_HTML_BYTES);
    const html = stripUselessHtml(rawHtml);
    const result = {
      url: response.url,
      title: extractFirst(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
      metaDescription: extractFirst(
        html,
        /<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i
      ),
      headings: extractAll(html, /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi, 30),
      paragraphs: extractAll(html, /<p[^>]*>([\s\S]*?)<\/p>/gi, 50),
      links: extractLinks(html, url)
    };

    return {
      ...result,
      promptText: buildPromptText(result)
    };
  } finally {
    clearTimeout(timeout);
  }
}
