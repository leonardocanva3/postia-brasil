"use client";

type ConfirmDialogProps = Readonly<{
  children: React.ReactNode;
  message?: string;
}>;

export function ConfirmDialog({
  children,
  message = "Tem certeza que deseja continuar?"
}: ConfirmDialogProps) {
  return (
    <span
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </span>
  );
}
