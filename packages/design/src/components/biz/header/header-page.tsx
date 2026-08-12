import { cn } from "@zstack/utils";

import { Text } from "../../primitive/text";

export interface HeaderPageProps {
  title: React.ReactNode;
  description: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

/** 主页面页头 */
export const HeaderPage = ({
  title,
  description,
  className,
  children,
}: HeaderPageProps) => {
  return (
    <header
      className={cn(
        "bg-neutral-0 flex justify-between px-6 py-5 text-neutral-800",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <Text className="text-xl font-medium">{title}</Text>
        <p className="mt-1 mb-0 text-xs text-neutral-600">{description}</p>
      </div>
      {children ? <div className="ml-3">{children}</div> : null}
    </header>
  );
};
