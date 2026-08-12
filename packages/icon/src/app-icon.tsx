import { cn } from "@zstack/utils";
import * as React from "react";

import { AppIcons } from "./app-icons-mapping.ts";

export type AppIconName = keyof typeof AppIcons;

export { AppIcons };

interface AppIconProps extends React.SVGProps<SVGSVGElement> {
  type: AppIconName;
}

export const AppIcon: React.FC<AppIconProps> = ({
  type,
  className,
  ...props
}) => {
  const IconComponent = AppIcons[type];
  if (!IconComponent) {
    return null;
  }
  return (
    <IconComponent className={cn("h-[40px] w-[40px]", className)} {...props} />
  );
};
