import { Text } from "@zstack/design";
import { Constant } from "@zstack/zsphere-design-biz";
import { keys } from "lodash-es";
import React from "react";

import { getOption, formatValue, formatLinkUuid, Link } from "../../utils";
import { fetchData } from "../fetch";
import { buildOption } from "./build";

function renderComponent(
  type: string,
  {
    key,
    options,
    getServerTime,
  }: { key: string; options: any[]; getServerTime: any },
) {
  let renderText: (value: any) => React.ReactNode;
  switch (type) {
    case "link":
      renderText = (value: any) => {
        const linkResource = getOption(key, options)?.linkResource || "";
        return (
          <Text>
            <Link to={linkResource} uuid={formatLinkUuid(key, value, options)}>
              {formatValue(key, value, options)}
            </Link>
          </Text>
        );
      };

    case "copyable":
      renderText = (value: any) => {
        return <Text>{formatValue(key, value, options)}</Text>;
      };

    case "ellipsis":
      renderText = (value: any) => {
        return <Text>{formatValue(key, value, options)}</Text>;
      };

    case "constant":
      renderText = (value: any) => (
        <Constant value={formatValue(key, value, options)} />
      );

    case "date":
      renderText = (value: any) =>
        getServerTime(formatValue(key, value, options)).format(
          "YYYY-MM-DD HH:mm:ss",
        );

    case "text":
    default:
      renderText = (value: any) => {
        return <Text>{formatValue(key, value, options)}</Text>;
      };
  }
  const renderExtra = getOption(key, options)?.extra;
  if (renderExtra) {
    return (value: any) => (
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-auto">{renderText(value)}</div>
        <div className="flex-none">{renderExtra(value)}</div>
      </div>
    );
  }
  return renderText;
}

export function renderColumnOption(
  option: ReturnType<typeof buildOption>,
  intl: any,
  { options, getServerTime }: { options: any[]; getServerTime: any },
) {
  const { columns, viewMap, sheetName } = option;
  return {
    list: columns.map((column) => {
      const { i18nKey, key, width, sorter, filters, renderType } = column;
      const config = {
        title: intl.formatMessage({ id: i18nKey ?? `${sheetName}.${key}` }),
        key,
        width,
        sorter,
        filters: filters && [],
        render: renderComponent(renderType, { key, options, getServerTime }),
      };
      return config;
    }),
    viewMap: viewMap.reduce((views: any, map: any) => {
      const { view, keys } = map;
      views[view] = keys.split(", ").map((cv: string) => cv.slice(1, -1));
      return views;
    }, {} as any),
  };
}

export async function genColumnFromRemote(
  resourceKey: string,
  intl: any,
  {
    options: extraOptions,
    getServerTime,
  }: { options: any[]; getServerTime: any },
) {
  const result = await fetchData("Field", { resourceKey });
  const sheet = keys(result)[0];
  const tableData = result[sheet];
  const option = buildOption(sheet, tableData);
  return renderColumnOption(option, intl, {
    options: extraOptions,
    getServerTime,
  });
}
