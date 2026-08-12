import { useCopy } from "@zstack/hooks";
import { cn, extractTextFromReactNode } from "@zstack/utils";
import * as React from "react";
import { useIntl } from "react-intl";

import { Show } from "../../primitive/show";
import { Text } from "../../primitive/text";
import type { TooltipProps } from "../../primitive/tooltip";
import { Info } from "../info";
import { FieldGroup } from "./field-group";
import type { FieldOperation } from "./field-operations";
import { FieldOperations } from "./field-operations";

const FieldPlaceholderNone = () => {
  const intl = useIntl();
  return (
    <span className="text-neutral-500">
      {intl.formatMessage({
        id: "none",
        defaultMessage: "无",
      })}
    </span>
  );
};

const FieldPlaceholderDash = () => {
  return <span className="text-neutral-500">-</span>;
};

type TooltipContent =
  | {
      content: React.ReactNode;
      placement?: TooltipProps["placement"];
    }
  | React.ReactNode;

export interface FieldProps {
  children?: React.ReactNode;
  childrenList?: React.ReactNode[];
  className?: string;
  label?: string;
  labelWidth?: number;
  operations?: FieldOperation[];
  tooltip?: TooltipContent;
  placeholder?: "none" | "-";
  type?: "single" | "multi" | "tag";
  colon?: boolean | string;
  wrapperClassName?: string;
  flush?: boolean;
}

function isTooltipObject(tooltip: TooltipContent): tooltip is {
  content: React.ReactNode;
  placement?: TooltipProps["placement"];
} {
  return (
    typeof tooltip === "object" && tooltip !== null && "content" in tooltip
  );
}

const Field: React.FC<FieldProps> & { Group: typeof FieldGroup } = (props) => {
  const {
    label,
    children,
    labelWidth = 160,
    operations = [],
    tooltip,
    placeholder = "-",
    type = "single",
    childrenList = [],
    colon = false,
    className,
    wrapperClassName,
    flush,
  } = props;

  const intl = useIntl();
  const renderPlaceholder = () => {
    if (placeholder === "none") {
      return <FieldPlaceholderNone />;
    }
    return <FieldPlaceholderDash />;
  };
  const _copy = useCopy();
  const copy = () => {
    const text = extractTextFromReactNode(children);
    if (text) {
      _copy(text);
    }
  };

  // correct the type mode, because childrenList would be a single element
  const fieldType = childrenList.length === 1 ? "single" : type;
  const _children = childrenList.length === 1 ? childrenList[0] : children;

  const isZhLocale = intl.locale.toLowerCase().startsWith("zh");

  const colonText = intl.formatMessage({
    id: "colon",
    defaultMessage: ":",
  });

  const renderMulti = () => {
    return (
      <div
        className={cn(
          "group box-border flex min-h-7.5 w-full min-w-0 grow-0 justify-start",
          flush && "-ml-2",
          className,
        )}
        data-testid={`field-container-${label}`}
      >
        <div
          data-operation={operations.length > 0}
          data-testid={`field-content-${label}`}
          className={cn(
            "box-border flex h-full max-w-full grow-0 space-x-2 rounded-xs px-2 data-[operation=true]:group-hover:bg-neutral-100 data-[operation=true]:hover:bg-neutral-100",
            wrapperClassName,
          )}
        >
          <div
            className="flex h-min items-center"
            style={{ minWidth: labelWidth, width: labelWidth }}
            data-testid={`field-label-${label}`}
          >
            <div className="text-sm leading-7.5 text-neutral-600">
              <Text>{`${label} ${colon ? colonText : ""}`}</Text>
            </div>
            <Show when={!!tooltip}>
              {isTooltipObject(tooltip) ? (
                <Info info={tooltip!.content} placement={tooltip!.placement} />
              ) : (
                <Info info={tooltip} />
              )}
            </Show>
          </div>
          <div
            className="flex max-w-full flex-col truncate"
            data-testid={`field-value-${label}`}
          >
            {childrenList.map((item, index) => {
              if (typeof item === "string") {
                return (
                  <div
                    key={index}
                    className="grow-0 truncate text-sm leading-7.5 text-neutral-700"
                  >
                    {item}
                  </div>
                );
              }
              return (
                <div key={index} className="flex h-7.5 flex-col justify-center">
                  {item}
                </div>
              );
            })}
          </div>
          {operations.length > 0 && (
            <FieldOperations operations={operations} copy={copy} />
          )}
        </div>
      </div>
    );
  };

  const renderSingle = () => {
    return (
      <div
        className={cn(
          "group box-border flex min-h-7.5 w-full min-w-0 grow-0 items-center justify-start",
          flush && "-ml-2",
          className,
        )}
        data-testid={`field-container-${label}`}
      >
        <div
          data-operation={operations.length > 0}
          data-testid={`field-content-${label}`}
          className={cn(
            "box-border flex h-full max-w-full items-center space-x-2 rounded-xs px-2 data-[operation=true]:group-hover:bg-neutral-100 data-[operation=true]:hover:bg-neutral-100",
            wrapperClassName,
          )}
        >
          <div
            className="flex items-center"
            style={{ minWidth: labelWidth, width: labelWidth }}
            data-testid={`field-label-${label}`}
          >
            <Text className="text-sm text-neutral-600">{`${label} ${colon ? colonText : ""}`}</Text>
            <Show when={!!tooltip}>
              {isTooltipObject(tooltip) ? (
                <Info
                  info={tooltip!.content}
                  placement={tooltip!.placement}
                  className={isZhLocale ? "-ml-0.5" : "ml-1"}
                />
              ) : (
                <Info
                  info={tooltip}
                  className={isZhLocale ? "-ml-0.5" : "ml-1"}
                />
              )}
            </Show>
          </div>
          <div
            className="grow-0 truncate text-sm text-neutral-700"
            data-testid={`field-value-${label}`}
          >
            {_children ? _children : renderPlaceholder()}
          </div>
          {operations.length > 0 && (
            <FieldOperations operations={operations} copy={copy} />
          )}
        </div>
      </div>
    );
  };
  const renderTag = () => {
    return (
      <div
        className={cn(
          "group box-border flex min-h-7.5 w-full min-w-0 grow-0 items-start justify-start p-2",
          flush && "-ml-2",
          className,
        )}
      >
        <div className={cn("flex w-full items-start", wrapperClassName)}>
          <div className="mr-2 flex min-w-40 flex-col">
            <Text className="max-w-4/5 overflow-hidden text-sm text-ellipsis text-neutral-600">{`${label} ${colon ? colonText : ""}`}</Text>
            <Show when={!!tooltip}>
              {isTooltipObject(tooltip) ? (
                <Info
                  info={tooltip!.content}
                  placement={tooltip!.placement}
                  className={isZhLocale ? "ml-[-0.2rem]" : "ml-1"}
                />
              ) : (
                <Info
                  info={tooltip}
                  className={isZhLocale ? "ml-[-0.2rem]" : "ml-1"}
                />
              )}
            </Show>
          </div>
          <div className="min-w-0 flex-1">
            {children ? (
              <div className="flex flex-wrap gap-1">{children}</div>
            ) : (
              <div>{renderPlaceholder()}</div>
            )}
            {operations.length > 0 && (
              <div className="-mt-0.75">
                <FieldOperations operations={operations} copy={copy} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  if (fieldType === "multi") {
    return renderMulti();
  } else if (fieldType === "tag") {
    return renderTag();
  }
  return renderSingle();
};

interface FieldValueProps {
  children: React.ReactNode;
  placeholder?: "none" | "-";
}

const FieldValue = (props: FieldValueProps) => {
  const { children, placeholder = "-" } = props;
  return (
    <Show
      when={children}
      fallback={
        placeholder === "none" ? (
          <FieldPlaceholderNone />
        ) : (
          <FieldPlaceholderDash />
        )
      }
    >
      <Text>{children}</Text>
    </Show>
  );
};

Field.Group = FieldGroup;

export { Field, FieldPlaceholderDash, FieldPlaceholderNone, FieldValue };
