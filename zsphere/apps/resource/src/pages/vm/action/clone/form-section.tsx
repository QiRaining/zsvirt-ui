import React from "react";

interface FormSectionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  children,
  className,
}) => (
  <div className={["mb-6", className].filter(Boolean).join(" ")}>
    <div className="mb-3 flex h-5 items-center">
      <span className="mr-2 h-3 w-1 bg-[var(--color-400)]" />
      <span className="text-sm font-medium text-neutral-700">{title}</span>
    </div>
    {children}
  </div>
);

export default React.memo(FormSection);
