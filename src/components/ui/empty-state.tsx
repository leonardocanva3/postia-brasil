type EmptyStateProps = Readonly<{
  title: string;
  description?: string;
}>;

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-6 text-sm">
      <p className="font-semibold text-gray-950">{title}</p>
      {description ? (
        <p className="mt-2 leading-6 text-gray-600">{description}</p>
      ) : null}
    </div>
  );
}
