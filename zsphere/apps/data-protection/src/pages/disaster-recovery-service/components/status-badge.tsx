interface StatusBadgeProps {
  label: string;
  className: string;
}

export function StatusBadge({ label, className }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex h-6 items-center rounded-sm px-2 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
