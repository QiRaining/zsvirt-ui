import { useCopy } from "@zstack/hooks";
import { Icon } from "@zstack/icon";
import { genUuid, getThemeColor } from "@zstack/utils";
import { useInViewport } from "ahooks";
import { Tooltip, Typography } from "antd";
import { TooltipProps } from "antd/es/tooltip";
import { TextProps } from "antd/es/typography/Text";
import cs from "classnames";
import { throttle } from "lodash-es";

import "../field/style.less";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useIntl } from "react-intl";

import { getBaseCls } from "../../_utils/common";

import "./style.less";

const { Text: AntText } = Typography;

export interface IProps extends TextProps {
  value: any;
  ellipsis?: boolean;
  tooltipPlacement?:
    | "top"
    | "left"
    | "right"
    | "bottom"
    | "topLeft"
    | "topRight"
    | "bottomLeft"
    | "bottomRight"
    | "leftTop"
    | "leftBottom"
    | "rightTop"
    | "rightBottom";
  tooltipProps?: Partial<TooltipProps>;
  children?: React.ReactChild;
  toggle?: boolean;
  password?: boolean;
  wrapperClass?: string;
  wrapperStyle?: React.CSSProperties;
}
const mode = "light";
const textColor = getThemeColor("blue", mode, 500);

const Text: React.FC<IProps> = ({
  value,
  toggle,
  children,
  ellipsis: _ellipsis = true,
  tooltipPlacement = "top",
  tooltipProps,
  password = false,
  wrapperClass,
  wrapperStyle,
  className,
  style,
  ...rest
}) => {
  const intl = useIntl();
  const copy = useCopy();

  const [isEllipsis, setIsEllipsis] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const ref = useRef(null);
  const initRef = useRef(false);
  const inViewPort = useInViewport(ref);
  const baseCls = getBaseCls("field-horizontal");
  const content = useMemo(() => children || value, [children, value]);

  const isStringChildren = useMemo(
    () => typeof content === "string",
    [content],
  );

  const ellipsis = useMemo<TextProps["ellipsis"]>(() => {
    if (!_ellipsis) return false;
    // antd 4.11开始支持省略时展示tooltip 但是只支持string类型的child
    // 如果child是string类型, 我们就用antd的tooltip, 减少由于getComputedStyle导致的回流
    if (isStringChildren)
      return {
        tooltip: true,
      };
    return true;
  }, [_ellipsis, isStringChildren]);

  const baseNode = useMemo(() => {
    if (!isStringChildren) return content;
    const stringContent = (
      <span className={cs("ant-typography-ellipsis-single-line")}>
        {content}
      </span>
    );
    if (isEllipsis)
      return (
        <Tooltip
          {...tooltipProps}
          overlayInnerStyle={{ wordBreak: "break-all" }}
          title={value}
          placement={tooltipPlacement}
        >
          {stringContent}
        </Tooltip>
      );
    return stringContent;
  }, [content, isEllipsis, isStringChildren, value]);

  let baseText = useMemo(() => {
    const _className = cs(
      rest.copyable ? `${baseCls}-value-hover-show-icon` : "",
      className,
      "ant-typography-ellipsis",
      "ant-typography",
      isStringChildren
        ? `zstack-text-string-child`
        : "ant-typography-ellipsis-single-line",
    );
    const _style = { ...style, width: "100%" };
    // 如果只用到省略功能,我们只用span标签提升性能
    return (
      <span
        className={cs("zstack-text", wrapperClass)}
        style={wrapperStyle}
        ref={ref}
      >
        {Object.keys(rest).length ? (
          <AntText
            style={_style}
            {...rest}
            copyable={
              rest.copyable
                ? {
                    icon: <Icon type="copy" className={`${baseCls}-icon`} />,
                    text: value,
                  }
                : false
            }
            className={_className}
            ellipsis={false}
          >
            {baseNode}
          </AntText>
        ) : (
          <span style={_style} className={_className}>
            {baseNode}
          </span>
        )}
      </span>
    );
  }, [
    baseCls,
    baseNode,
    className,
    isStringChildren,
    rest,
    style,
    value,
    wrapperClass,
    wrapperStyle,
  ]);

  const setEllipsis = useCallback(() => {
    const current = ref.current as any as HTMLElement;
    const targetElement = password
      ? (current.children[0]?.children[0] as HTMLElement)
      : isStringChildren
        ? (current.children[0].children[0] as HTMLElement)
        : ((current.children[0] as HTMLElement) ?? {});
    const { offsetWidth = 0, scrollWidth = 0 } = targetElement || {};
    setIsEllipsis(offsetWidth < scrollWidth && _ellipsis);
  }, [isStringChildren, _ellipsis, password]);

  useEffect(() => {
    if (ref.current && inViewPort && !initRef.current && !toggle) {
      setEllipsis();
      initRef.current = true;
    }
  }, [inViewPort, toggle, setEllipsis]);

  // 单独处理 password 模式下 showPassword 变化的情况
  useEffect(() => {
    if (password && ref.current) {
      setIsEllipsis(false);
      const timer = setTimeout(() => {
        setEllipsis();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [password, setEllipsis, showPassword]);

  // password 模式下的复制处理，必须在组件顶层定义
  const passwordValue = useMemo(
    () => String(children || value),
    [children, value],
  );
  const handleCopy = useCallback(() => {
    if (password) {
      copy(passwordValue);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  }, [password, copy, passwordValue]);

  if (toggle) {
    if (visible) {
      baseText = (
        <span
          className={cs(wrapperClass, "baseSecretText")}
          style={wrapperStyle}
          ref={ref}
        >
          <AntText {...{ rest, className, style }} copyable ellipsis={ellipsis}>
            {children || value}
          </AntText>
          <span
            className="hidden"
            style={{ color: textColor }}
            onClick={() => setVisible(!visible)}
          >
            {intl.formatMessage({
              id: "hide",
              defaultMessage: "Hide",
            })}
          </span>
        </span>
      );
    } else {
      const defaultValue = intl.formatMessage({
        id: "show",
        defaultMessage: "Show",
      });
      baseText = (
        <span
          className={wrapperClass}
          style={wrapperStyle}
          onClick={() => setVisible(!visible)}
          ref={ref}
        >
          <AntText style={{ color: textColor }}>
            {children || defaultValue}
          </AntText>
        </span>
      );
    }
  }
  if (password) {
    baseText = (
      <div
        className={cs(wrapperClass, "wrapper")}
        style={wrapperStyle}
        ref={ref}
      >
        <AntText
          className={cs("text", className)}
          {...{ ...rest, style }}
          ellipsis={false}
          copyable={false}
        >
          <span
            className={cs({
              "ant-typography-ellipsis-single-line":
                _ellipsis && isStringChildren,
            })}
          >
            {showPassword ? children || value : "******"}
          </span>
        </AntText>
        <Tooltip
          title={
            copied
              ? intl.formatMessage({
                  id: "copy.successfully",
                  defaultMessage: "Duplicates created successfully",
                })
              : intl.formatMessage({
                  id: "copy",
                  defaultMessage: "Copy",
                })
          }
        >
          <Icon
            className="icon-copy-password"
            type={copied ? "checkmark" : "copy"}
            role="button"
            onClick={handleCopy}
          />
        </Tooltip>
        <Icon
          className={
            showPassword ? "icon-after-password" : "icon-after-hidden-password"
          }
          type={showPassword ? "eye" : "eye-off"}
          role="button"
          onClick={() => setShowPassword(!showPassword)}
        />
      </div>
    );
    if (isEllipsis && _ellipsis) {
      baseText = (
        <Tooltip
          {...tooltipProps}
          overlayInnerStyle={{ wordBreak: "break-all" }}
          title={showPassword ? value : "******"}
          placement={tooltipPlacement}
        >
          {baseText}
        </Tooltip>
      );
    }
  }
  // 没有值的话显示为空元素
  if (value !== 0 && !value && !children) {
    baseText = <></>;
  }
  if (isEllipsis && !isStringChildren) {
    return (
      <Tooltip {...tooltipProps} title={value} placement={tooltipPlacement}>
        {baseText}
      </Tooltip>
    );
  }
  return baseText;
};

const WrapperText: React.FC<IProps> = (props) => {
  // window resize 时强制重新渲染组件
  const [key, setKey] = useState<string>(genUuid());

  useEffect(() => {
    const onResize = throttle(
      () => {
        setKey(genUuid());
      },
      200,
      { leading: false, trailing: true },
    );

    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    setKey(genUuid());
  }, [props.value]);

  return <Text {...props} key={key} />;
};

export default WrapperText;
