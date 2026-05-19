type StatusBadgeProps = Readonly<{
  status: string;
}>;

function getStatusClassName(status: string) {
  if (["ACTIVE", "PUBLISHED", "PAID", "READY", "SENT"].includes(status)) {
    return "bg-emerald-50 text-emerald-800";
  }

  if (["PENDING", "SCHEDULED", "DRAFT", "IDEA", "PLANNED"].includes(status)) {
    return "bg-amber-50 text-amber-800";
  }

  if (["CANCELED", "FAILED", "EXPIRED"].includes(status)) {
    return "bg-red-50 text-red-800";
  }

  return "bg-gray-100 text-gray-700";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${getStatusClassName(
        status
      )}`}
    >
      {status}
    </span>
  );
}
