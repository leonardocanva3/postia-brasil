export type CompanyImageCandidate = Readonly<{
  id?: string;
  title: string;
  type: string;
  description?: string | null;
  tags: string[];
  imageUrl: string;
  isActive?: boolean;
}>;

export type ImageSelectionInput = Readonly<{
  objective?: string;
  subject?: string;
  service?: string;
  tags?: string[];
  preferredType?: string;
  images: CompanyImageCandidate[];
}>;

function normalize(value?: string | null) {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function selectBestCompanyImage(input: ImageSelectionInput) {
  const searchTerms = [
    input.objective,
    input.subject,
    input.service,
    ...(input.tags ?? [])
  ]
    .map(normalize)
    .filter(Boolean);
  const activeImages = input.images.filter((image) => image.isActive ?? true);

  if (activeImages.length === 0) {
    return null;
  }

  return activeImages
    .map((image) => {
      const haystack = normalize(
        [image.title, image.type, image.description, image.tags.join(" ")].join(" ")
      );
      const tagScore = image.tags.reduce(
        (score, tag) =>
          searchTerms.includes(normalize(tag)) ? score + 3 : score,
        0
      );
      const textScore = searchTerms.reduce(
        (score, term) => (haystack.includes(term) ? score + 1 : score),
        0
      );
      const typeScore =
        input.preferredType && normalize(image.type) === normalize(input.preferredType)
          ? 4
          : 0;

      return {
        image,
        score: tagScore + textScore + typeScore
      };
    })
    .sort((a, b) => b.score - a.score)[0]?.image;
}
