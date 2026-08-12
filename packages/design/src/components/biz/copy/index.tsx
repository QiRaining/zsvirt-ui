"use client";

import { Icon } from "@zstack/icon";
import { cn } from "@zstack/utils";
import { useState } from "react";
import { useIntl } from "react-intl";

import { Tooltip } from "../../primitive/tooltip";

interface CopyProps {
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}
export const Copy = (props: CopyProps) => {
  const { onClick, className } = props;
  const [copied, setCopied] = useState(false);

  const intl = useIntl();
  return (
    <Tooltip
      disappearOnClick={false}
      title={
        copied
          ? intl.formatMessage({
              id: "copy.successfully",
              defaultMessage: "复制成功",
            })
          : intl.formatMessage({
              id: "copy",
              defaultMessage: "复制",
            })
      }
      key="copy"
    >
      <span
        onClick={(e: React.MouseEvent) => {
          onClick?.(e);
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
          }, 3000);
        }}
        className={cn(
          "text-theme-500 data-[disabled]:hover:text-theme-200 cursor-pointer data-[disabled]:cursor-not-allowed " +
            "h-4 w-4 hover:opacity-80",
          className,
        )}
      >
        {copied ? <Icon type="checkmark" /> : <Icon type="copy" />}
      </span>
    </Tooltip>
  );
};
