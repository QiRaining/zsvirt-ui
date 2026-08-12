import { useLazyQuery } from "@apollo/client";
import { Icon } from "@zstack/icon";
import { IQuery, Item } from "@zstack/zsphere-types";
import { getGQL } from "@zstack/zsphere-utils";
import { Button, Dropdown, Tooltip } from "antd";
import dayjs from "dayjs";
import { cloneDeep, flattenDeep, intersectionBy, uniq } from "lodash-es";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactDOMServer from "react-dom/server";
import { useIntl } from "react-intl";

import ConfigProvider, { ConfigContext } from "../../../config";
import { IColumnType, IQueryListResult } from "../../base-type";
import { serializeCsv } from "./csv";
import {
  CustomExportProps,
  IBaseExportToExcelProps,
  IBaseHookProps,
  IExportToExcelProps,
} from "./type";

export type { CustomExportProps } from "./type";

type ILimitType = "current" | "all";

const LIMIT_LOOP = 500;

const htmlDecode = (input: string) => {
  const doc = new DOMParser().parseFromString(input, "text/html");
  return doc.documentElement.textContent;
};

const getTextFromReactNode = (node: React.ReactNode | string): string => {
  if (typeof node === "string") {
    return String(node);
  }

  if (!React.isValidElement(node)) {
    return "";
  }

  // 处理类似Select组件
  const nodeProps = node?.props as any;

  // 优先处理 Text 组件的 value prop
  if (nodeProps?.value !== undefined) {
    if (
      typeof nodeProps.value === "string" ||
      typeof nodeProps.value === "number"
    ) {
      return String(nodeProps.value);
    }
  }

  if (nodeProps?.value !== undefined && nodeProps?.children) {
    const children = nodeProps?.children;
    if (Array.isArray(children)) {
      const valueChild = children.find(
        (child: { key: any }) => child.key === nodeProps.value,
      );
      if (valueChild?.props?.children) {
        return getTextFromReactNode(valueChild.props.children);
      }
    }
  }

  const childrenResult = React.Children.map(nodeProps?.children, (child: any) =>
    getTextFromReactNode(child),
  );
  return Array.isArray(childrenResult) ? childrenResult.join("") : "";
};

export const formatElement = (element: React.ReactNode | string): string => {
  let label = cloneDeep(element);
  if (typeof label !== "string") {
    try {
      label = getTextFromReactNode(element);
    } catch (error) {
      console.error(error);
    }
  }
  return label as string;
};

function useBaseProps<T extends Item, U extends Item>(
  props: IBaseHookProps<T>,
) {
  const { extraColumns = [], _filterColumns, query } = props;

  const [limitType, setLimitType] = useState<ILimitType>("current");
  const [list, setList] = useState<Array<T>>([]);
  const [total, setTotal] = useState<number>(0);
  const [extraQuery, setExtraQuery] = useState<IQuery>({});
  const [customColumns, setCustomColumns] = useState<Array<IColumnType<T>>>([]);

  const newQuery = useMemo(
    () => ({ ...query, ...extraQuery }),
    [extraQuery, query],
  );

  const filterColumns = useMemo(() => {
    const columns = _filterColumns;
    if (extraColumns.length > 0) {
      // 如果key相同，对应的extraColumns会覆盖columns
      const repeatColumnKeys = intersectionBy(
        columns,
        extraColumns,
        "key",
      )?.map((column: any) => column?.key);
      const _columns = columns.filter(
        (column) => !repeatColumnKeys?.includes(column?.key),
      );
      return _columns.concat(extraColumns);
    }
    return columns;
  }, [_filterColumns, extraColumns]);

  const newColumns = useMemo(
    () => (customColumns.length ? customColumns : filterColumns),
    [customColumns, filterColumns],
  );

  return {
    newQuery,
    filterColumns,
    newColumns,
    limitType,
    setLimitType,
    list,
    setList,
    total,
    setTotal,
    extraQuery,
    setExtraQuery,
    customColumns,
    setCustomColumns,
  };
}

function ExportToExcel<T extends Item>(props: IExportToExcelProps<T>) {
  const {
    gql: _gql,
    query,
    limitLoop = LIMIT_LOOP,
    extraColumns = [],
    filterColumns: _filterColumns,
    allGqlKeysWhenExport,
    ...rest
  } = props;

  const {
    limitType,
    list,
    setList,
    total,
    setTotal,
    newQuery,
    newColumns,
    ...propsRest
  } = useBaseProps({ extraColumns, _filterColumns, query });

  const gqlKeys: string[] = useMemo(
    () => uniq(flattenDeep(newColumns.map((it) => it?.gqlKey ?? it.key))),
    [newColumns],
  );

  const gql = useMemo(() => {
    if (allGqlKeysWhenExport) {
      return _gql;
    }
    return getGQL(_gql, gqlKeys);
  }, [_gql, gqlKeys, allGqlKeysWhenExport]);

  const [getData, result] = useLazyQuery(gql, {
    errorPolicy: "ignore",
    fetchPolicy: "no-cache",
    notifyOnNetworkStatusChange: true,
  });

  // 处理数据获取完成后的逻辑
  useEffect(() => {
    const data = (result as any)?.data;
    if (data) {
      const firstValue = (Object.values(data ?? {})?.[0] ?? {}) as any;
      const rawList = firstValue?.list;
      const listRemote: T[] = Array.isArray(rawList) ? rawList : [];
      const totalRemote: number =
        typeof firstValue?.total === "number" ? firstValue?.total : 0;

      setList((prevList) => {
        const newList = [...prevList, ...listRemote];
        let newTotal = listRemote.length;
        if (limitType === "all") {
          newTotal = totalRemote;
        }
        setTotal(newTotal);

        if (newList.length < newTotal) {
          getData({
            variables: {
              ...newQuery,
              limit: limitType === "all" ? limitLoop : newQuery?.limit || 0,
              start: newList.length,
            },
          });
        }

        return newList;
      });
    }
  }, [result, limitType, limitLoop, newQuery, getData, setTotal, setList]);

  return (
    <BaseExportToExcel
      allGqlKeysWhenExport={allGqlKeysWhenExport}
      total={total}
      setTotal={setTotal}
      list={list}
      setList={setList}
      getData={getData}
      newQuery={newQuery}
      limitType={limitType}
      newColumns={newColumns}
      limitLoop={limitLoop}
      {...rest}
      {...propsRest}
    />
  );
}

function BaseExportToExcel<T extends Item, U extends Item>(
  props: IBaseExportToExcelProps<T>,
) {
  const {
    getData,
    newQuery,
    filterColumns,
    newColumns,
    limitType,
    setLimitType,
    list,
    setList,
    total,
    setTotal,
    setExtraQuery,
    setCustomColumns,
    columnConfig,
    view,
    resource,
    customFileName,
    limitLoop = LIMIT_LOOP,
    showExtraColumnKey = false,
    renderCustomExportModal,
  } = props;

  const { constant, RawIntlProvider } = React.useContext(ConfigContext);
  const intl = useIntl() as any;
  const [customModalVisible, setCustomModalVisible] = useState(false);

  const customColumnPath = `${resource}.${view}`;

  useEffect(() => {
    setList([]);
    setTotal(0);
  }, [setList, setTotal]);

  const transformHeader = useCallback(
    (header: Array<IColumnType<T>>) => {
      const obj: Item = {};
      header?.forEach((item) => {
        if (item.i18nKey) {
          obj[item.key] = `${intl.formatMessage({ id: item.i18nKey })}${
            showExtraColumnKey ? `(${item.key})` : ""
          }`;
        } else {
          obj[item.key] = `${formatElement(item.title as any)}${
            showExtraColumnKey ? `(${item.key})` : ""
          }`;
        }
      });
      return obj;
    },
    [showExtraColumnKey, intl],
  );

  const transformColumn = useCallback(
    (header: Array<IColumnType<T>>, columnListParam: T[] = []) => {
      const res: any[] = [];
      columnListParam.forEach((e, i) => {
        const obj: Item = {};
        header?.forEach((f) => {
          if (f.exportToCSVRender) {
            let renderedStr = "";
            try {
              renderedStr = f?.exportToCSVRender(e, e, i) || "";
              obj[f.key] = renderedStr;
              return;
            } catch {
              renderedStr = e?.[f?.key] ?? "";
            }
          }

          if (f.render) {
            let renderedDom: any = "";

            try {
              renderedDom = f?.render(e, e, i) || "";
            } catch {
              renderedDom = e?.[f?.key] ?? "";
            }

            // 如果 render 返回的是字符串或数字，直接使用
            if (
              typeof renderedDom === "string" ||
              typeof renderedDom === "number"
            ) {
              obj[f.key] = String(renderedDom);
              return;
            }

            if (renderedDom && React.isValidElement(renderedDom)) {
              const directText = getTextFromReactNode(renderedDom);
              if (directText) {
                obj[f.key] = directText;
                return;
              }
            }

            renderedDom = (
              <ConfigProvider constant={constant}>{renderedDom}</ConfigProvider>
            );

            if (RawIntlProvider) {
              renderedDom = (
                <RawIntlProvider value={intl}>{renderedDom}</RawIntlProvider>
              );
            }

            let renderedStr = "";
            try {
              renderedStr =
                ReactDOMServer.renderToStaticMarkup(renderedDom) || "";
            } catch (_error) {
              renderedStr = e?.[f?.key] ?? (f as any)?.formatter?.(e) ?? "";
            }

            if (f.exportToCSVRender) {
              try {
                renderedStr = f?.exportToCSVRender(e, e, i) || "";
              } catch {
                renderedStr = e?.[f?.key] ?? "";
              }
            }

            const formatString = String(renderedStr)
              .replace(/<[^>]*>?/gm, " ")
              .replace(/ +/gm, " ")
              .trim();
            obj[f.key] = htmlDecode(formatString);
          } else {
            obj[f.key] = e[f.key];
          }
        });
        res.push(obj);
      });
      return res;
    },
    [constant, RawIntlProvider, intl],
  );

  useEffect(() => {
    if (list.length === total && total > 0) {
      const columns = newColumns.map(({ key }) => key);
      const csv = serializeCsv(columns, [
        transformHeader(newColumns),
        ...transformColumn(newColumns, list),
      ]);
      let downLoadFileName = customFileName || customColumnPath;
      // 保留原有的文件名长度限制，避免改变用户下载到的文件名
      if (downLoadFileName.length > 31) {
        downLoadFileName = "exportFile";
      }
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${downLoadFileName}-${dayjs().format("YYYY_MM_DD_HH_mm_ss")}.csv`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(objectUrl), 0);
    }
  }, [
    list,
    total,
    customColumnPath,
    newColumns,
    transformHeader,
    customFileName,
    transformColumn,
  ]);

  const downloadFile = useCallback(
    (type: ILimitType, _query?: IQuery) => {
      const args = _query ?? newQuery;
      getData({
        variables: {
          ...args,
          start: type === "all" ? 0 : args?.start || 0,
          limit: type === "all" ? limitLoop : args?.limit || 0,
        },
      });
    },
    [getData, newQuery, limitLoop],
  );

  const onDownloadClick = useCallback(
    (type: ILimitType) => {
      setList([]);
      setTotal(0);
      setLimitType(type);
      if (renderCustomExportModal) {
        setCustomModalVisible(true);
      } else {
        downloadFile(type);
      }
    },
    [setList, setTotal, setLimitType, renderCustomExportModal, downloadFile],
  );

  const customModalExport: CustomExportProps<T>["callback"] = ({
    variables,
    customColumns: _customColumns,
  }) => {
    setExtraQuery(variables);
    setCustomColumns(_customColumns ?? []);
    downloadFile(limitType, { ...newQuery, ...variables });
  };

  const customModaltitle = useMemo(() => {
    if (limitType === "current") {
      return intl.formatMessage({
        id: "export.custom.modal.title.current",
        defaultMessage: "Export Current Page",
      });
    }
    if (limitType === "all") {
      return intl.formatMessage({
        id: "export.custom.modal.title.all",
        defaultMessage: "Export All Pages",
      });
    }
  }, [limitType, intl]);

  const customExportModalProps: CustomExportProps<T> = {
    visible: customModalVisible,
    setVisible: setCustomModalVisible,
    title: customModaltitle || "",
    callback: customModalExport,
    columnConfig,
    filterColumns,
  };

  const menuItems = useMemo(
    () => [
      {
        key: "current",
        label: intl.formatMessage({
          id: "currentPage",
          defaultMessage: "Current Page",
        }),
        onClick: () => onDownloadClick("current"),
      },
      {
        key: "all",
        label: intl.formatMessage({
          id: "all",
          defaultMessage: "All",
        }),
        onClick: () => onDownloadClick("all"),
      },
    ],
    [intl, onDownloadClick],
  );

  return (
    <>
      <Dropdown menu={{ items: menuItems }} placement="bottomRight">
        <Tooltip
          title={intl.formatMessage({
            id: "export",
            defaultMessage: "Export ",
          })}
        >
          <Button>
            <Icon type="download" />
          </Button>
        </Tooltip>
      </Dropdown>
      {renderCustomExportModal?.(customExportModalProps)}
    </>
  );
}

export default ExportToExcel;
