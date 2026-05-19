type PageHeaderProps = Readonly<{
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}>;

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 text-3xl font-semibold text-gray-950">{title}</h1>
        {description ? <p className="mt-3 text-gray-700">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
