import { Icon } from "@zstack/icon";
import { getSemanticColor } from "@zstack/zsphere-utils";
import classNames from "classnames";
import React, { useMemo, isValidElement } from "react";

import { getBaseCls } from "../../../_utils/common";
import Auth from "../../auth";
import { aligns } from "../const";

import "../style.less";
import { IFieldVerticalProps } from "../type";

const baseCls = getBaseCls("field-vertical");

function isEmpty(p: any): p is undefined | "" | null | boolean {
  return (
    p === undefined ||
    p === null ||
    p === "" ||
    typeof p === "boolean" ||
    (Array.isArray(p) && p.length === 0)
  );
}

const Vertical: React.FC<IFieldVerticalProps> = ({
  icon,
  label,
  color,
  children,
  align = "center",
  className,
  style: externalStyle,
  iconColor,
  auth,
}) => {
  const iconEle = useMemo(() => {
    if (!icon) {
      return;
    }

    if (typeof icon === "string") {
      return <Icon type={icon} color={iconColor} />;
    }
    if (isValidElement(icon)) {
      return icon;
    }

    const _icon: never = icon;
    return _icon;
  }, [icon, iconColor]);

  const childrenEle = useMemo(() => {
    if (isEmpty(children)) {
      return;
    }

    return (
      <div
        className={`${baseCls}-value`}
        style={{ color: color && getSemanticColor(color, "light") }}
      >
        {children}
      </div>
    );
  }, [children, color]);

  // align 优先级高与 style
  const styleComputed = useMemo(() => {
    const styleInner: any = { ...externalStyle };

    if (align) {
      styleInner.alignItems = aligns[align];
    }

    return styleInner;
  }, [align, externalStyle]);

  const ele = (
    <div style={styleComputed} className={classNames(baseCls, className)}>
      <div className={`${baseCls}-top`}>
        {iconEle && <div className={`${baseCls}-top-icon`}>{iconEle}</div>}
        <div className={`${baseCls}-top-label`}>{label}</div>
      </div>
      {childrenEle}
    </div>
  );

  const authProps = {
    type: "block" as const,
    ...auth,
  } as any;

  return auth ? <Auth {...authProps}>{ele}</Auth> : ele;
};

Vertical.displayName = "Vertical";

export default Vertical;
