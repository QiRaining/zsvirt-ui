import { ConfigProvider, Empty as AntEmpty } from "antd";
import { EmptyProps as AntEmptyProps } from "antd/es/empty";
import cls from "classnames";
import React from "react";
import { RawIntlProvider } from "react-intl";
import { useIntl } from "react-intl";

import { getBaseCls } from "../_utils/common";

import "./style.less";
import NodataSelectSrc from "../assets/empty/nodata-select.webp";
import NodataTableSrc from "../assets/empty/nodata-table.webp";
import NodataWhiteTableSrc from "../assets/empty/nodata-white-table.webp";

const baseCls = getBaseCls("empty");

// 安全渲染 SVG，支持 URL 字符串或 React 组件
function renderSvgImage(
  src: string | React.ComponentType<React.SVGProps<SVGSVGElement>>,
) {
  if (typeof src === "string") {
    return <img src={src} alt="" style={{ display: "block" }} />;
  }
  const SvgComponent = src;
  return <SvgComponent />;
}

function getAntEmptyProps(props: IEmptyProps) {
  const type = props.type || "Table";

  if (props?.loading && props?.isFirst) {
    // 判断第一次请求，且为loading状态

    return {
      image: renderSvgImage(NodataWhiteTableSrc),
      description: "",
      className: cls(`${baseCls}-table`, props.className),
    };
  }
  delete props.loading;
  delete props.isFirst;

  return {
    image: renderSvgImage(type === "Table" ? NodataTableSrc : NodataSelectSrc),
    ...props,
    className: cls(
      type === "Table" ? `${baseCls}-table` : `${baseCls}-select`,
      props.className,
    ),
  };
}

export function customRenderEmpty({
  type,
  ...rest
}: {
  type?: string;
  description?: React.ReactNode;
  loading?: boolean;
  isFirst?: boolean;
  style?: React.CSSProperties;
  imageStyle?: React.CSSProperties;
}) {
  return (
    <AntEmpty
      {...getAntEmptyProps({
        type: type === "Select" ? "Select" : "Table",
        ...rest,
      })}
    />
  );
}

type IConfigEmptyProviderProps = IEmptyProps;

export const ConfigEmptyProvider: React.FC<IConfigEmptyProviderProps> = ({
  children,
  ...rest
}) => {
  const intl = useIntl();

  return (
    <ConfigProvider
      renderEmpty={(componentName) =>
        customRenderEmpty({ ...rest, type: componentName })
      }
    >
      <RawIntlProvider value={intl}>{children}</RawIntlProvider>
    </ConfigProvider>
  );
};

export interface IEmptyProps extends AntEmptyProps {
  type?: "Table" | "Select";
  loading?: boolean;
  isFirst?: boolean;
}

export const Empty: React.FC<IEmptyProps> = (props) => (
  <AntEmpty {...getAntEmptyProps(props)} />
);
