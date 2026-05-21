"use client";

import { useEffect, useState } from "react";

type ImageUploadFieldProps = Readonly<{
  name: string;
  label: string;
  buttonLabel: string;
  defaultPreviewUrl?: string | null;
  compact?: boolean;
}>;

function isPreviewUrl(value: string | null | undefined) {
  if (!value) {
    return false;
  }

  return (
    value.startsWith("blob:") ||
    value.startsWith("/") ||
    value.startsWith("http://") ||
    value.startsWith("https://")
  );
}

export function ImageUploadField({
  name,
  label,
  buttonLabel,
  defaultPreviewUrl,
  compact = false
}: ImageUploadFieldProps) {
  const [selectedFileName, setSelectedFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState(
    isPreviewUrl(defaultPreviewUrl) ? String(defaultPreviewUrl) : ""
  );

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="rounded-md border border-gray-200 p-3">
      <span className="text-sm font-medium text-gray-800">{label}</span>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100">
          {buttonLabel}
          <input
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            name={name}
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (!file) {
                setSelectedFileName("");
                setPreviewUrl(
                  isPreviewUrl(defaultPreviewUrl) ? String(defaultPreviewUrl) : ""
                );
                return;
              }

              setSelectedFileName(file.name);
              try {
                setPreviewUrl(URL.createObjectURL(file));
              } catch {
                setPreviewUrl("");
              }
            }}
            type="file"
          />
        </label>
        <span className="text-sm text-gray-600">
          {selectedFileName || "Nenhum arquivo selecionado"}
        </span>
      </div>
      <p className="mt-2 text-xs text-gray-500">PNG, JPG ou WEBP ate 5MB.</p>
      {isPreviewUrl(previewUrl) ? (
        <div
          className={`relative mt-3 overflow-hidden rounded-md border border-gray-200 bg-gray-100 ${
            compact ? "size-20" : "h-32 w-full max-w-xs"
          }`}
          aria-label={`Preview de ${label}`}
          role="img"
          style={{
            backgroundImage: `url(${previewUrl})`,
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain"
          }}
        />
      ) : null}
    </div>
  );
}
