"use client";

import { useState } from "react";

type GeneratedCaptionResultProps = Readonly<{
  caption: string;
  emojis: string[];
  hashtags: string[];
  cta: string;
}>;

export function GeneratedCaptionResult({
  caption,
  emojis,
  hashtags,
  cta
}: GeneratedCaptionResultProps) {
  const [copied, setCopied] = useState(false);
  const textToCopy = [
    caption,
    "",
    cta,
    "",
    emojis.join(" "),
    "",
    hashtags.join(" ")
  ].join("\n");

  async function copyCaption() {
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
  }

  return (
    <section className="rounded-lg border border-emerald-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
            Legenda gerada
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-gray-950">
            Resultado
          </h2>
        </div>
        <button
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
          onClick={copyCaption}
          type="button"
        >
          {copied ? "Copiado" : "Copiar legenda"}
        </button>
      </div>
      <p className="mt-5 whitespace-pre-line text-sm leading-6 text-gray-700">
        {caption}
      </p>
      <p className="mt-5 text-sm font-semibold text-gray-950">{cta}</p>
      {emojis.length > 0 ? (
        <p className="mt-5 text-lg leading-7">{emojis.join(" ")}</p>
      ) : null}
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
    </section>
  );
}
