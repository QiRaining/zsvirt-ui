import { Text } from "@zstack/design";
import { Tooltip } from "@zstack/design";
import { useCopy } from "@zstack/hooks";
import { Icon } from "@zstack/icon";
import { extractTextFromReactNode, cn } from "@zstack/utils";
import React, { useState } from "react";
import { useIntl } from "react-intl";

export interface CopyableTextProps {
  children: React.ReactNode;
  /** Custom text to copy. If not provided, text is extracted from children. */
  copyText?: string;
  /** className for the text part */
  className?: string;
  /** Display text as password mask while still copying the real value */
  password?: boolean;
}

const PASSWORD_MASK = "••••••••";

export const CopyableText: React.FC<CopyableTextProps> = ({
  children,
  copyText,
  className,
  password = false,
}) => {
  const copy = useCopy();
  const intl = useIntl();
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const rawText = copyText ?? extractTextFromReactNode(children);

  const handleCopy = () => {
    if (rawText) {
      copy(rawText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const displayContent = password && !revealed ? PASSWORD_MASK : children;

  return (
    <div className="group inline-flex max-w-full min-w-0 items-center gap-1">
      <Text className={cn("min-w-0", className)}>{displayContent}</Text>
      {password && (
        <Tooltip
          title={
            revealed
              ? intl.formatMessage({ id: "hide", defaultMessage: "Hide" })
              : intl.formatMessage({ id: "show", defaultMessage: "Show" })
          }
        >
          <span
            onClick={() => setRevealed((prev) => !prev)}
            className="text-theme-500 inline-flex h-4 w-4 shrink-0 cursor-pointer items-center opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-80"
          >
            {revealed ? <Icon type="eye-off" /> : <Icon type="eye" />}
          </span>
        </Tooltip>
      )}
      <Tooltip
        title={
          copied
            ? intl.formatMessage({
                id: "copy.successfully",
                defaultMessage: "Duplicates created successfully",
              })
            : intl.formatMessage({ id: "copy", defaultMessage: "Copy" })
        }
      >
        <span
          onClick={handleCopy}
          className={cn(
            "text-theme-500 inline-flex h-4 w-4 shrink-0 cursor-pointer items-center transition-opacity hover:opacity-80",
            copied ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        >
          {copied ? <Icon type="checkmark" /> : <Icon type="copy" />}
        </span>
      </Tooltip>
    </div>
  );
};

CopyableText.displayName = "CopyableText";
