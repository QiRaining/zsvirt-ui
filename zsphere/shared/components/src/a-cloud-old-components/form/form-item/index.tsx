import { InfoPopover } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { getLocaleFromStorage } from "@zstack/zsphere-utils";
import { Form, Tooltip } from "antd";
import classNames from "classnames";
import FieldContext from "rc-field-form/es/FieldContext";
import React, { useContext, useEffect, useMemo } from "react";

import { getBaseCls } from "../../../_utils/common";
import Auth from "../../auth";
import { getTooltip } from "../../field/horizontal/index";
import Text from "../../text";
import { FormContext, FormItemContext } from "../context";

import "../style.less";
import TooltipWarpper from "./tooltip";
import type {
  IFormItemProps,
  IGetRequiredParams,
  IWithTooltipProps,
} from "./type";

const baseCls = getBaseCls("form-item");
const LABEL_TOOLTIP_Z_INDEX = 1200;

interface ILabelTextProps {
  label: React.ReactNode;
}

const FormItemLabelText: React.FC<ILabelTextProps> = ({ label }) => {
  const targetRef = React.useRef<HTMLSpanElement>(null);
  const [isOverflow, setIsOverflow] = React.useState(false);

  const checkOverflow = React.useCallback(() => {
    const target = targetRef.current;
    const textElement = target?.querySelector(
      ".ant-typography-ellipsis-single-line",
    ) as HTMLElement | null;

    if (!target || !textElement) {
      setIsOverflow(false);
      return;
    }

    setIsOverflow(textElement.scrollWidth > textElement.clientWidth);
  }, []);

  React.useEffect(() => {
    checkOverflow();

    const target = targetRef.current;
    if (!target) {
      return;
    }

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", checkOverflow);
      return () => window.removeEventListener("resize", checkOverflow);
    }

    const observer = new ResizeObserver(checkOverflow);
    observer.observe(target);

    return () => observer.disconnect();
  }, [checkOverflow, label]);

  const tooltipTitle =
    typeof label === "string" && isOverflow ? label : undefined;

  return (
    <Tooltip title={tooltipTitle} zIndex={LABEL_TOOLTIP_Z_INDEX}>
      <span
        ref={targetRef}
        className={`${baseCls}-label-container-tooltip-target`}
      >
        <Text
          value={label}
          ellipsis={false}
          className={`${baseCls}-label-container-label`}
          wrapperClass={`${baseCls}-label-container-text`}
        />
      </span>
    </Tooltip>
  );
};

function toArray(list?: IWithTooltipProps["validateTrigger"]): string[] {
  if (!list) {
    return [];
  }

  return Array.isArray(list) ? list : [list];
}

function getRequired({
  rules,
  required,
  hideRequiredMark,
}: IGetRequiredParams): boolean {
  if (required !== undefined) {
    return required;
  }

  if (hideRequiredMark) {
    return false;
  }

  return (
    rules?.some((rule) => typeof rule !== "function" && rule?.required) ?? false
  );
}

const FormItem: React.FC<IFormItemProps> = ({
  icon,
  iconTooltip,
  labelWidth = 160,
  formItemHeigth = "normal",
  children,
  trigger = "onChange",
  validateTrigger,
  tooltip,
  description = "",
  validateFirst = true,
  auth,
  selectParams = false,
  withBorder = false,
  hideRequiredMessage,
  textFormItem,
  ...originFormItemProps
}) => {
  const formContext = useContext(FormContext);
  const { form } = formContext;
  const { validateTrigger: contextValidateTrigger } = useContext(FieldContext);
  const {
    colon = formContext.colon,
    label,
    className,
    htmlFor,
  } = originFormItemProps;

  if (withBorder) {
    originFormItemProps = {
      ...originFormItemProps,
      ...{ labelCol: { span: 12 } },
    };
  }

  const isRequired = getRequired({
    ...originFormItemProps,
    hideRequiredMark: formContext.hideRequiredMark,
  });

  /* 增加 span 元素处理 icon 组件不符合 tooltip 使用要求问题  */
  const iconTooltipEle = useMemo(() => {
    if (!icon) {
      return;
    }

    const newIcon = (
      <span className={`${baseCls}-label-container-icon`}>
        <Icon type={icon} />
      </span>
    );

    const tooltipProps = getTooltip(iconTooltip);
    if (tooltipProps && tooltipProps.title && icon) {
      return <InfoPopover content={tooltipProps.title as React.ReactNode} />;
    }

    return newIcon;
  }, [iconTooltip, icon]);

  const labelEle = useMemo(() => {
    if (!label) {
      return;
    }

    const newlabelWidth = (width = 160) => {
      if (isRequired && icon) {
        return width - 29.5;
      }
      if (isRequired) {
        return width - 9.5;
      }
      if (icon) {
        return width - 20;
      }
      return width;
    };

    return (
      <div
        className={`${baseCls}-label-container`}
        style={{ width: labelWidth }}
      >
        {/* 代码里有两种方式设置sub-form宽度：添加className或labelWidth */}
        <div
          className={`${baseCls}-label-container-content`}
          style={{
            maxWidth: newlabelWidth(labelWidth),
          }}
        >
          <FormItemLabelText label={label} />
        </div>
        {isRequired && (
          <span className={`${baseCls}-label-container-required`}>*</span>
        )}
        {colon && <span className={`${baseCls}-label-container-colon`}>:</span>}
        {iconTooltipEle}
      </div>
    );
  }, [label, colon, isRequired, iconTooltipEle, labelWidth, icon, className]);

  const { name: itemName } = originFormItemProps;

  const local = getLocaleFromStorage();

  useEffect(() => {
    if (itemName) {
      const error = form?.getFieldError(itemName) as any;
      if (error?.length > 0) {
        form?.validateFields([itemName]);
      }
    }
  }, [local, itemName]);

  const formItemValue = useMemo(
    () => ({
      isRequired,
      triggers: Array.from(
        new Set([
          ...toArray(trigger),
          ...toArray(
            validateTrigger !== undefined
              ? validateTrigger
              : contextValidateTrigger!,
          ),
        ]),
      ),
    }),
    [isRequired, trigger, validateTrigger, contextValidateTrigger],
  );

  const formItem = (
    <Form.Item
      {...originFormItemProps}
      validateFirst={validateFirst}
      trigger={trigger}
      validateTrigger={validateTrigger}
      colon={false}
      required={false}
      htmlFor={htmlFor ?? ""}
      label={labelEle}
      className={classNames(
        baseCls,
        {
          [`${baseCls}-hide-required-message`]: hideRequiredMessage,
          [`${baseCls}-text`]: textFormItem,
          [`${baseCls}-mini`]: formItemHeigth === "mini",
          [`${baseCls}-zsv`]: true,
          [`${baseCls}-with-border`]: withBorder,
        },
        originFormItemProps.className,
      )}
    >
      {tooltip ? (
        <TooltipWarpper tooltip={tooltip}>{children as any}</TooltipWarpper>
      ) : (
        children
      )}
    </Form.Item>
  );

  const ele = formContext.isCustom ? (
    <FormItemContext.Provider value={formItemValue}>
      {formItem}
      {description ? (
        <div
          className={classNames(`${baseCls}-input-description`, {
            [`${baseCls}-input-description-zsv`]: true,
          })}
          style={{ marginLeft: labelWidth + 8 }}
        >
          {description}
        </div>
      ) : null}
    </FormItemContext.Provider>
  ) : (
    <Form.Item
      {...originFormItemProps}
      validateFirst={validateFirst}
      htmlFor={htmlFor ?? ""}
      trigger={trigger}
      validateTrigger={validateTrigger}
    >
      {children}
    </Form.Item>
  );

  const authProps = {
    type: "block" as const,
    resource: formContext.resource,
    ...auth,
  } as any;

  return auth ? <Auth {...authProps}>{ele}</Auth> : ele;
};

FormItem.displayName = "FormItem";

export default FormItem;
export type { IFormItemProps, IStackGlobalParam } from "./type";
