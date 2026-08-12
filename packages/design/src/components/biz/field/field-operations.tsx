
import { Icon } from "@zstack/icon";
import * as React from "react";

import { Tooltip } from "../../primitive/tooltip";
import { Copy } from "../copy";

export type FieldOperationType = "copy" | "edit" | "refresh";

export type FieldOperationFunc = () => void | Promise<void>;

// 定义元组，从左到右：类型，tooltip，点击回调，是否disabled
export type FieldOperation =
  | [FieldOperationType, React.ReactNode, FieldOperationFunc, boolean?]
  | FieldOperationType;

export interface FieldOperationsProps {
  operations: FieldOperation[];
  copy: () => void;
}

export const FieldOperations: React.FC<FieldOperationsProps> = (props) => {
  const { operations, copy } = props;
  const onClick = (_onClick: FieldOperationFunc, disabled?: boolean) => {
    if (!disabled) {
      _onClick?.();
    }
  };

  return (
    <div className="ml-2 flex h-7.5 items-center space-x-1 text-sm">
      {operations.map((op) => {
        if (typeof op === "string") {
          switch (op) {
            case "copy":
              return (
                <Copy
                  onClick={copy}
                  key={op}
                  data-testid="field-operation-copy"
                  className="group-hover:text-theme-600 data-[disabled=true]:group-hover:text-theme-200 text-transparent hover:opacity-80"
                />
              );
          }
        } else {
          const [type, tooltip, _onClick, disabled] = op;
          switch (type) {
            case "copy":
              return (
                <Copy
                  onClick={() => {
                    copy();
                    onClick(_onClick, disabled);
                  }}
                  key={type}
                  data-testid="field-operation-copy"
                  className="group-hover:text-theme-600 data-[disabled=true]:group-hover:text-theme-200 text-transparent hover:opacity-80"
                />
              );
            case "edit":
              return (
                <Tooltip title={tooltip} key={type}>
                  <span
                    data-disabled={disabled}
                    onClick={() => onClick(_onClick, disabled)}
                    className="text-theme-200 group-hover:text-theme-600 h-4 w-4 cursor-pointer hover:opacity-80 data-[disabled=false]:hover:opacity-80 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:text-neutral-500 data-[disabled=true]:group-hover:text-neutral-500"
                    data-testid="field-operation-edit"
                  >
                    <Icon type="edit" className="block" />
                  </span>
                </Tooltip>
              );
            case "refresh":
              return (
                <Tooltip title={tooltip} key={type}>
                  <span
                    data-disabled={disabled}
                    onClick={() => onClick(_onClick, disabled)}
                    className="group-hover:text-theme-600 h-4 w-4 cursor-pointer text-transparent hover:opacity-80 data-[disabled=false]:hover:opacity-80 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:text-neutral-500 data-[disabled=true]:group-hover:text-neutral-500"
                    data-testid="field-operation-refresh"
                  >
                    <Icon type="refresh" className="block" />
                  </span>
                </Tooltip>
              );
            default:
              return null;
          }
        }
      })}
    </div>
  );
};
