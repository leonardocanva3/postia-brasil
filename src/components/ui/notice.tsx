type NoticeProps = Readonly<{
  tone?: "success" | "error" | "warning" | "info";
  children: React.ReactNode;
}>;

const toneClassNames = {
  success: "bg-emerald-50 text-emerald-800",
  error: "bg-red-50 text-red-700",
  warning: "bg-amber-50 text-amber-800",
  info: "bg-blue-50 text-blue-800"
};

export function Notice({ tone = "info", children }: NoticeProps) {
  return (
    <p className={`rounded-md px-3 py-2 text-sm ${toneClassNames[tone]}`}>
      {children}
    </p>
  );
}
