import { cn } from "@zstack/utils";
import { useIntl } from "react-intl";

import { Text } from "../../primitive/text";

export interface HeaderDetailProps {
  title: React.ReactNode;
  /** 标记 title，比如 右侧渲染一个 tag  */
  extraTitle?: React.ReactNode;
  description: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  icon: React.ReactNode;
}

/** 详情页面页头 */
export const HeaderDetail = ({
  title,
  description,
  className,
  icon,
  extraTitle,
  children,
}: HeaderDetailProps) => {
  const intl = useIntl();

  return (
    <div className={cn("flex justify-between", className)}>
      <div className="flex min-w-0 flex-1">
        <div className="bg-theme-600 flex h-10 w-10 flex-none items-center justify-center rounded-full">
          {icon}
        </div>
        <div className="ml-3 min-w-0 flex-1">
          <div className="flex items-center">
            <Text className="min-w-0 flex-1 text-xl font-medium">{title}</Text>
            {extraTitle}
          </div>
          {description ? (
            <div className="mt-2">
              <Text className="text-neutral-700">{description}</Text>
            </div>
          ) : (
            <div className="mt-2 text-neutral-500">
              {intl.formatMessage({
                id: "temporarilyNoDescription",
                defaultMessage: "暂无简介",
              })}
            </div>
          )}
        </div>
      </div>
      {children ? <div className="ml-10">{children}</div> : null}
    </div>
  );
};
