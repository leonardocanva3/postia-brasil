import { prisma } from "@/lib/database/prisma";

export function slugifyBusinessValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "e")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function resolveBusinessSegmentAndSpecialty(input: {
  businessSegment?: string | null;
  businessSpecialty?: string | null;
}) {
  const segmentSlug = input.businessSegment
    ? slugifyBusinessValue(input.businessSegment)
    : null;
  const specialtyName = input.businessSpecialty?.trim();
  const segment = segmentSlug
    ? await prisma.businessSegment.findFirst({
        where: {
          slug: segmentSlug,
          isActive: true
        },
        select: {
          id: true,
          name: true
        }
      })
    : null;
  const specialty = specialtyName
    ? await prisma.businessSpecialty.findFirst({
        where: {
          isActive: true,
          ...(segment ? { segmentId: segment.id } : {}),
          OR: [
            { slug: slugifyBusinessValue(`${segment?.name ?? ""}-${specialtyName}`) },
            { slug: slugifyBusinessValue(specialtyName) },
            { name: { equals: specialtyName, mode: "insensitive" } }
          ]
        },
        select: {
          id: true,
          segmentId: true
        }
      })
    : null;

  return {
    businessSegmentId: segment?.id ?? specialty?.segmentId ?? null,
    businessSpecialtyId: specialty?.id ?? null
  };
}
