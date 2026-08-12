import { Icon } from "@zstack/icon";
import { cn } from "@zstack/utils";

export const Loader = ({ className }: { className?: string }) => {
  return (
    <Icon type="loader"
      className={cn(
        "animate-duration-3000 text-theme-600 animate-spin",
        className,
      )}
    />
  );
};
