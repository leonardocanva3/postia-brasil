import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp"]);
const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp"
]);
const UPLOADS_PUBLIC_DIR = path.join(
  process.cwd(),
  "public",
  "uploads",
  "company-images"
);

export type ImageUploadValidationResult =
  | Readonly<{ isValid: true; extension: string }>
  | Readonly<{ isValid: false; error: string }>;

function normalizeFilename(value: string) {
  const parsed = path.parse(value);
  const baseName = parsed.name || "imagem";

  const normalizedName = baseName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);

  return normalizedName || "imagem";
}

export function validateImageFile(file: File): ImageUploadValidationResult {
  const extension = path.extname(file.name).replace(".", "").toLowerCase();

  if (!file.name || file.size === 0) {
    return { isValid: false, error: "Arquivo de imagem vazio." };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { isValid: false, error: "Imagem maior que 5MB." };
  }

  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return { isValid: false, error: "Extensao de imagem invalida." };
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { isValid: false, error: "Tipo de imagem invalido." };
  }

  return { isValid: true, extension };
}

export function generatePublicImageUrl(filename: string) {
  return `/uploads/company-images/${filename.replaceAll("\\", "/")}`;
}

export async function saveCompanyImageUpload(
  companyId: string,
  file: File
) {
  const validation = validateImageFile(file);

  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const safeCompanyId = companyId.replace(/[^a-zA-Z0-9-]/g, "");
  const normalizedName = normalizeFilename(file.name);
  const filename = `${safeCompanyId}-${Date.now()}-${normalizedName}.${validation.extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  // Trocar esta camada por S3, Cloudflare R2 ou Supabase Storage em producao.
  await mkdir(UPLOADS_PUBLIC_DIR, { recursive: true });
  await writeFile(path.join(UPLOADS_PUBLIC_DIR, filename), bytes);

  return generatePublicImageUrl(filename);
}
