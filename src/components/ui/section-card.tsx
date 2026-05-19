type SectionCardProps = Readonly<{
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}>;

export function SectionCard({
  title,
  description,
  children,
  className = ""
}: SectionCardProps) {
  return (
    <section
      className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm ${className}`}
    >
      {title || description ? (
        <div className="mb-5">
          {title ? (
            <h2 className="text-lg font-semibold text-gray-950">{title}</h2>
          ) : null}
          {description ? (
            <p className="mt-1 text-sm leading-6 text-gray-600">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
