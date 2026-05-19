"use client";

import { useState } from "react";

type GeneratedPostResultProps = Readonly<{
  title: string;
  content: string;
  cta: string;
  hashtags: string[];
  formatSuggestion: string;
}>;

export function GeneratedPostResult({
  title,
  content,
  cta,
  hashtags,
  formatSuggestion
}: GeneratedPostResultProps) {
  const [copied, setCopied] = useState(false);
  const textToCopy = [
    title,
    "",
    content,
    "",
    cta,
    "",
    hashtags.join(" "),
    "",
    `Formato sugerido: ${formatSuggestion}`
  ].join("\n");

  async function copyPost() {
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
  }

  return (
    <section className="rounded-lg border border-emerald-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
            Post gerado
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-gray-950">{title}</h2>
        </div>
        <button
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
          onClick={copyPost}
          type="button"
        >
          {copied ? "Copiado" : "Copiar texto"}
        </button>
      </div>
      <p className="mt-5 whitespace-pre-line text-sm leading-6 text-gray-700">
        {content}
      </p>
      <p className="mt-5 text-sm font-semibold text-gray-950">{cta}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {hashtags.map((hashtag) => (
          <span
            className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800"
            key={hashtag}
          >
            {hashtag}
          </span>
        ))}
      </div>
      <p className="mt-5 text-sm text-gray-600">
        <span className="font-medium text-gray-800">Formato sugerido:</span>{" "}
        {formatSuggestion}
      </p>
    </section>
  );
}
