import { keys } from "lodash-es";
import { pascalCase } from "pascal-case";

import { Item } from "./type";

export const formatRenderKey = (showType?: string) => {
  if (!showType) return "default";
  if (
    ["link", "copyable", "ellipsis", "text", "constant", "date"].includes(
      showType,
    )
  ) {
    return showType;
  }
  return "default";
};

const hasFormatTime = (rows: Item[]) => {
  return rows.some((row) => row.showType === "date");
};

const hasConstant = (rows: Item[]) => {
  return rows.some((row) => row.showType === "constant");
};

const isTableFilter = (value?: string) => {
  if (value) {
    return /(singleFilter|multipleFilter)/.test(value);
  }
  return false;
};

const buildIKey = (rows: Item[]) => {
  const keys = rows.map((row) => `'${row.key}'`).concat(`'__action__'`);
  return keys.join(" | ");
};

const buildColumns = (rows: Item[], sheetName: string) => {
  return rows.map((row) => {
    return {
      key: row.key,
      i18nKey: row.i18nKey,
      name: row.name,
      width: row.width,
      renderType: formatRenderKey(row.showType),
      sorter: !!row.isSort,
      filters: isTableFilter(row.queryType),
      valueExpr: `formatValue('${row.key}', value, options)`,
      [formatRenderKey(row.showType)]: {
        constantType: pascalCase(`${sheetName}-${row.key}`),
      },
    };
  });
};

const buildViewMap = (rows: Item[]) => {
  const views = keys(rows[0].custom);
  const filterKeys = (view: string) =>
    rows.reduce((keys, row) => {
      if (row.custom[view].value) {
        keys.push(row.key);
      }
      return keys;
    }, [] as string[]);
  return views.map((view: string) => {
    return {
      view,
      keys: filterKeys(view)
        .map((cv) => `'${cv}'`)
        .join(", "),
    };
  });
};

export const buildOption = (sheetName: string, rows: Item[]) => {
  const option = {
    sheetName,
    formatTime: hasFormatTime(rows),
    importConstant: hasConstant(rows),
    IKey: buildIKey(rows),
    columns: buildColumns(rows, sheetName),
    viewMap: buildViewMap(rows),
    isVirtualization: sheetName.startsWith("virtualization"),
  };
  return option;
};
