import { genUuid } from "@zstack/zsphere-utils";
import { Typography } from "antd";
import { TextProps } from "antd/es/typography/Text";
import cs from "classnames";
import { throttle } from "lodash-es";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";

import { getBaseCls } from "../_utils/common";
import ZSText from "../a-cloud-old-components/text";

import "./styles.less";

const { Paragraph: AntParagraph } = Typography;

export interface IProps extends TextProps {
  ellipsis?: boolean;
  value: any[];
  copyable?: boolean;
  toggle?: boolean;
  password?: boolean;
  needWrap?: boolean;
  wrapperClass?: string;
  wrapperStyle?: React.CSSProperties;
}

interface TextComponentProps extends IProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

function isPrimitiveTextNode(val: unknown): val is string | number {
  return typeof val === "string" || typeof val === "number";
}

const Text: React.FC<TextComponentProps> = ({
  toggle: _toggle,
  value,
  copyable = false,
  needWrap = false,
  wrapperClass,
  wrapperStyle,
  className,
  style,
  visible,
  setVisible,
  ...rest
}) => {
  const intl = useIntl() as any;
  const [isEllipsis, setIsEllipsis] = useState<boolean>(false);
  const ref = useRef<HTMLSpanElement | null>(null);
  const baseCls = getBaseCls("zsv-item-list");
  const toggle = useMemo(
    () => (value?.length > 1 && needWrap) || isEllipsis,
    [value?.length, needWrap, isEllipsis],
  );

  const containsNonPrimitiveNode = useMemo(
    () => (value ?? []).some((item) => !isPrimitiveTextNode(item)),
    [value],
  );

  const baseNode = useMemo(
    () =>
      value?.map((item, index) => (
        <div
          style={{
            display: needWrap ? "block" : "inline-block",
            marginBottom: "4px",
          }}
          key={`basenode-${index}`}
        >
          {isPrimitiveTextNode(item) ? (
            <ZSText copyable={copyable} value={item} />
          ) : (
            item
          )}
        </div>
      )),
    [value, needWrap, copyable],
  );

  let baseText;
  if (!value?.length) return null;

  if (needWrap) {
    if (visible) {
      baseText = (
        <span
          className={cs(wrapperClass, "baseSecretText", `${baseCls}-show`)}
          style={wrapperStyle}
          ref={ref}
        >
          <AntParagraph {...{ rest, className, style }}>
            {baseNode}
          </AntParagraph>
          <span className="toggleText" onClick={() => setVisible(!visible)}>
            {toggle &&
              intl.formatMessage({
                id: "showUp",
                defaultMessage: "Fold up.",
              })}
          </span>
        </span>
      );
    } else {
      const firstNode: any = (
        <>
          {value[0]!}
          {value.length > 1 ? "..." : ""}
        </>
      );
      baseText = (
        <span
          className={cs(wrapperClass, "baseSecretText")}
          style={wrapperStyle}
          ref={ref}
        >
          <AntParagraph ellipsis={{ rows: 1 }} {...{ rest, className, style }}>
            <ZSText copyable={copyable} value={value?.[0]}>
              {firstNode}
            </ZSText>
          </AntParagraph>
          <span className="toggleText" onClick={() => setVisible(!visible)}>
            {toggle &&
              intl.formatMessage({
                id: "more",
                defaultMessage: "More",
              })}
          </span>
        </span>
      );
    }
  } else {
    if (visible) {
      baseText = (
        <span
          className={cs(wrapperClass, "baseSecretText", `${baseCls}-show`)}
          style={wrapperStyle}
          ref={ref}
        >
          <AntParagraph {...{ rest, className, style }}>
            {baseNode}
          </AntParagraph>
          <span className="toggleText" onClick={() => setVisible(!visible)}>
            {toggle &&
              intl.formatMessage({
                id: "showUp",
                defaultMessage: "Fold up.",
              })}
          </span>
        </span>
      );
    } else {
      // antd Paragraph 的 ellipsis 对复杂 ReactNode（例如 Tag 列表）支持不稳定，
      // 容易直接渲染成纯 "..."；这里对非纯文本场景做兼容，使用我们自己的“第一个 + ... + 更多”
      if (containsNonPrimitiveNode) {
        baseText = (
          <span
            className={cs(wrapperClass, "baseSecretText")}
            style={wrapperStyle}
            ref={ref}
          >
            <span
              className={cs(className)}
              style={{ ...style, whiteSpace: "nowrap" }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    minWidth: 0,
                    overflow: "hidden",
                  }}
                >
                  {value[0]!}
                </span>
                {value.length > 1 ? <span>...</span> : null}
              </span>
            </span>
            <span className="toggleText" onClick={() => setVisible(!visible)}>
              {toggle &&
                intl.formatMessage({
                  id: "more",
                  defaultMessage: "More",
                })}
            </span>
          </span>
        );
      } else {
        baseText = (
          <span
            className={cs(wrapperClass, "baseSecretText")}
            style={wrapperStyle}
            ref={ref}
          >
            <AntParagraph
              ellipsis={{ rows: 1, onEllipsis: () => setIsEllipsis(true) }}
              {...{ rest, className, style }}
            >
              {baseNode}
            </AntParagraph>
            <span className="toggleText" onClick={() => setVisible(!visible)}>
              {toggle &&
                intl.formatMessage({
                  id: "more",
                  defaultMessage: "More",
                })}
            </span>
          </span>
        );
      }
    }
  }

  return baseText;
};

const WrapperText: React.FC<IProps> = (props) => {
  // window resize 时强制重新渲染组件
  const [key, setKey] = useState<string>(genUuid());
  const [visible, setVisible] = useState<boolean>(false);

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
  }, [props.children]);

  return (
    <Text {...props} key={key} visible={visible} setVisible={setVisible} />
  );
};

export default WrapperText;
