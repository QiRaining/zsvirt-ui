import { Tooltip as AntTooltip } from "antd";
import React, { useContext } from "react";

import { getTooltip } from "../../field/horizontal/index";
import { FormItemContext } from "../context";

import "../style.less";
import { IWithTooltipProps } from "./type";

export function fillRef<T>(ref: React.Ref<T>, node: T) {
  if (typeof ref === "function") {
    ref(node);
  } else if (typeof ref === "object" && ref && "current" in ref) {
    (ref as any).current = node;
  }
}

const Tooltip: React.ForwardRefRenderFunction<any, IWithTooltipProps> = (
  { tooltip, children, wrapper, wrapperProps, ...formItemTransferProps },
  ref,
) => {
  const { triggers } = useContext(FormItemContext);

  if (!React.isValidElement(children)) {
    return children as any;
  }

  // 触发用户，antd 绑定事件, ref
  const newProps = triggers.reduce(
    (prev, eventName) => ({
      ...prev,
      [eventName](...args: any) {
        (formItemTransferProps as any)?.[eventName]?.(...args);
        children?.props?.[eventName]?.(...args);
      },
    }),
    {
      ...formItemTransferProps,
      ref: (node: any) => {
        fillRef(ref, node);
        fillRef((children as any)?.ref, node);
      },
    },
  );

  return (
    <AntTooltip trigger="hover" {...getTooltip(tooltip)}>
      {wrapper
        ? React.createElement(
            wrapper,
            wrapperProps,
            React.cloneElement(children, newProps),
          )
        : React.cloneElement(children, newProps)}
    </AntTooltip>
  );
};

export default React.forwardRef<any, IWithTooltipProps>(Tooltip);
