import { Input, Copy, type CheckboxGroupItem } from "@zstack/design";
import { Icon } from "@zstack/icon";
import type { ApiInspectorMethod } from "@zstack/zsphere-types";
import * as _ from "lodash-es";
import React, { useEffect, useState, useMemo } from "react";
import { useIntl } from "react-intl";

import SingleRequest from "../single-request";
import type { ApiInspectorDetailExtend } from "../utils";
import { formatReqPath } from "../utils";

// 统一的颜色常量 - 使用 ZSV 项目定义的 neutral 颜色
const COLORS = {
  border: {
    light: "#dbdde0", // neutral-300
    base: "#c8cacd", // neutral-400
  },
};

interface IProps {
  current?: ApiInspectorDetailExtend;
  checkedHttpMethod: ApiInspectorMethod[];
  checkOptions: CheckboxGroupItem[];
  onBack: () => void;
  onReqItemSelect?: (current: ApiInspectorDetailExtend) => void;
  onSelectedLogItem?: (current: ApiInspectorDetailExtend) => void;
}

const GqlDetailView: React.FC<IProps> = ({
  current,
  checkedHttpMethod,
  onBack,
  onReqItemSelect,
  onSelectedLogItem,
}) => {
  const intl = useIntl();
  const [filterDurationComparison, setFilterDurationComparison] = useState<
    ">=" | "<=" | "="
  >(">=");
  const [filterDuration, setFilterDuration] = useState<number | "">("");
  const [filterReqPath, setFilterReqPath] = useState<string>("");

  useEffect(() => {
    setFilterDuration("");
    setFilterReqPath("");
  }, [current]);

  const handleCopyTraceId = () => {
    navigator.clipboard.writeText(current?.traceId || "");
  };

  const list: ApiInspectorDetailExtend[] = useMemo(() => {
    let resList = _.sortBy(current?.children, "timestamp");
    resList = resList?.filter(
      (e) => e.method && checkedHttpMethod.includes(e.method),
    );
    const filterDurationNum =
      filterDuration !== "" ? filterDuration : undefined;
    if (filterDurationNum) {
      resList = resList.filter((e) => {
        switch (filterDurationComparison) {
          case "<=":
            return e.responseTime && e.responseTime <= filterDurationNum;
          case "=":
            return e.responseTime && e.responseTime === filterDurationNum;
          case ">=":
          default:
            return (
              !e.responseTime ||
              (e.responseTime && e.responseTime >= filterDurationNum)
            );
        }
      });
    }
    if (filterReqPath) {
      resList = resList.filter((e) =>
        formatReqPath(e.reqPath)
          .toLowerCase()
          .includes(filterReqPath.toLowerCase()),
      );
    }
    return resList;
  }, [
    current,
    checkedHttpMethod,
    filterDuration,
    filterDurationComparison,
    filterReqPath,
  ]);

  return (
    <div className="bg-neutral-0 flex h-full flex-col">
      {/* Header */}
      <div
        className="flex h-12 shrink-0 items-center justify-between bg-neutral-50 px-4"
        style={{ borderBottom: `1px solid ${COLORS.border.light}` }}
      >
        <div className="inline-flex items-center gap-4">
          <button
            onClick={onBack}
            className="bg-neutral-0 inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded px-3 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
            style={{ border: `1px solid ${COLORS.border.base}` }}
          >
            <Icon className="h-4 w-4" type="arrow-left" />
            {intl.formatMessage({
              id: "back",
              defaultMessage: "Go back",
            })}
          </button>
          <div
            className="h-6 w-px"
            style={{ backgroundColor: COLORS.border.light }}
          />
          <div className="inline-flex items-center gap-2.5">
            <span className="text-sm font-semibold text-neutral-800">
              GQL 请求详情
            </span>
          </div>
          <div className="inline-flex items-center gap-2 text-xs">
            <span className="text-neutral-500">traceId:</span>
            <code
              className="inline-flex items-center rounded bg-neutral-100 px-2 py-1 font-mono text-xs text-neutral-700"
              style={{ border: `1px solid ${COLORS.border.light}` }}
            >
              {current?.traceId || "-"}
            </code>
            <button
              onClick={handleCopyTraceId}
              className="bg-neutral-0 inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
              style={{ border: `1px solid ${COLORS.border.base}` }}
            >
              <Copy className="mt-0.5 h-4 w-4" />
            </button>
          </div>
          <span
            className="inline-flex items-center rounded bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600"
            style={{ border: `1px solid ${COLORS.border.light}` }}
          >
            {list.length} 条
          </span>
        </div>
      </div>

      {/* 工具栏 */}
      <div
        className="bg-neutral-0 flex shrink-0 items-center gap-4 px-4 py-3"
        style={{ borderBottom: `1px solid ${COLORS.border.light}` }}
      >
        <div className="inline-flex shrink-0 items-center gap-2">
          <span className="text-xs font-medium whitespace-nowrap text-neutral-500">
            耗时
          </span>
          <div
            className="bg-neutral-0 inline-flex h-8 items-center overflow-hidden rounded"
            style={{ border: `1px solid ${COLORS.border.light}` }}
          >
            <select
              value={filterDurationComparison}
              onChange={(e) =>
                setFilterDurationComparison(e.target.value as ">=" | "<=" | "=")
              }
              className="h-full cursor-pointer border-none bg-transparent px-2 text-xs text-neutral-700 outline-none"
              style={{ minWidth: "48px" }}
            >
              <option value=">=">≥</option>
              <option value="<=">≤</option>
              <option value="=">=</option>
            </select>
            <div
              className="h-4 w-px shrink-0"
              style={{ backgroundColor: COLORS.border.light }}
            />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="ms"
              className="h-full w-16 border-none bg-transparent px-2 text-xs text-neutral-700 outline-none"
              value={filterDuration}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || /^\d+$/.test(val)) {
                  setFilterDuration(val === "" ? "" : Number(val));
                }
              }}
            />
          </div>
        </div>

        <div
          className="h-6 w-px shrink-0"
          style={{ backgroundColor: COLORS.border.light }}
        />

        <div className="relative shrink-0">
          <Input
            placeholder="搜索请求..."
            className="h-8 w-44 pl-4 text-xs"
            value={filterReqPath}
            onChange={(e) => setFilterReqPath(e.target.value)}
          />
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-auto bg-neutral-50/50 p-3">
        {list?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
            <div
              className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100"
              style={{ border: `1px solid ${COLORS.border.light}` }}
            >
              <Icon className="h-5 w-5 text-neutral-400" type="activity" />
            </div>
            <span className="text-sm">暂无请求记录</span>
          </div>
        ) : (
          <div className="space-y-1.5">
            {list?.map((item) => (
              <div key={item.apiId} className="mt-1">
                {item && (
                  <SingleRequest
                    current={item}
                    onReqItemSelect={onReqItemSelect}
                    setReqModalVisible={() => {}}
                    onSelectedLogItem={onSelectedLogItem}
                    setLogDetailModalVisible={() => {}}
                    mark={filterReqPath}
                    inGqlDetail
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex h-9 shrink-0 items-center bg-neutral-50 px-4"
        style={{ borderTop: `1px solid ${COLORS.border.light}` }}
      >
        <div className="max-w-full truncate font-mono text-xs text-neutral-500">
          {current?.reqPath || "-"}
        </div>
      </div>
    </div>
  );
};

export default GqlDetailView;
