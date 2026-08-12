import { Loader, Copy, Tooltip, Tag } from "@zstack/design";
import { cn } from "@zstack/utils";
import { ApiInspectorMethod } from "@zstack/zsphere-types";
import dayjs from "dayjs";
import React from "react";
import { useIntl } from "react-intl";

// 统一的颜色常量 - 使用 ZSV 项目定义的 neutral 颜色
const COLORS = {
  border: {
    light: "#dbdde0", // neutral-300
    base: "#c8cacd", // neutral-400
  },
  status: {
    danger: "#ff766f", // danger-400
    alert: "#FFB53F", // alert-400
  },
};

import type { ApiInspectorDetailExtend } from "./utils";
import { formatReqPath, getGqlPayloadVariables } from "./utils";

interface IProps {
  current: ApiInspectorDetailExtend;
  onGqlItemSelect?: (current: ApiInspectorDetailExtend) => void;
  setGqlDrawerVisible?: (visible: boolean) => void;
  onReqItemSelect?: (current: ApiInspectorDetailExtend) => void;
  setReqModalVisible?: (visible: boolean) => void;
  onSelectedLogItem?: (current: ApiInspectorDetailExtend) => void;
  setLogDetailModalVisible?: (visible: boolean) => void;
  mark?: string;
  inGqlDetail?: boolean;
}

// 方法标签配色映射到 Tag 的 theme
const methodThemeMap: Record<
  ApiInspectorMethod,
  {
    theme:
      | "violet"
      | "green"
      | "blue"
      | "yellow"
      | "yellow-green"
      | "red"
      | "teal";
    label: string;
  }
> = {
  [ApiInspectorMethod.GQL]: { theme: "violet", label: "GQL" },
  [ApiInspectorMethod.ZQL]: { theme: "teal", label: "ZQL" },
  [ApiInspectorMethod.GET]: { theme: "blue", label: "GET" },
  [ApiInspectorMethod.POST]: { theme: "yellow", label: "POST" },
  [ApiInspectorMethod.PUT]: { theme: "yellow-green", label: "PUT" },
  [ApiInspectorMethod.DELETE]: { theme: "red", label: "DEL" },
  [ApiInspectorMethod.UNKNOWN]: { theme: "teal", label: "???" },
};

// 状态指示器
const StatusIndicator = ({ item }: { item: ApiInspectorDetailExtend }) => {
  if (item?.responseTime) {
    const isSlowRequest = item.responseTime > 1000;
    const isMediumRequest = item.responseTime > 300;
    return (
      <span
        className={cn(
          "font-mono text-xs font-semibold tabular-nums",
          isSlowRequest
            ? "text-danger-600"
            : isMediumRequest
              ? "text-alert-600"
              : "text-positive-600",
        )}
      >
        {item.responseTime}
        <span className="ml-0.5 text-[10px] font-normal opacity-50">ms</span>
      </span>
    );
  }
  if (item.status === "WaitingWebHook") {
    return (
      <span className="text-alert-600 flex items-center gap-1 text-xs font-medium">
        <span className="bg-alert-500 h-1.5 w-1.5 animate-pulse rounded-full" />
        Hook
      </span>
    );
  }
  return (
    <span className="text-info-500 flex items-center">
      <Loader className="h-3.5 w-3.5" />
    </span>
  );
};

const SingleRequest: React.FC<IProps> = ({
  current,
  onGqlItemSelect,
  setGqlDrawerVisible,
  onReqItemSelect,
  setReqModalVisible,
  onSelectedLogItem,
  setLogDetailModalVisible,
  mark = "",
  inGqlDetail = false,
}) => {
  const intl = useIntl();

  const generateReqPath = (reqPath: string, highlight: string) => {
    if (!highlight) {
      return reqPath;
    }
    const reg = new RegExp(`(${highlight})`, "gi");
    return (
      <span
        dangerouslySetInnerHTML={{
          __html: reqPath.replace(
            reg,
            `<mark class="bg-theme-100 text-theme-700 px-0.5 rounded font-semibold">$1</mark>`,
          ),
        }}
      />
    );
  };

  const generateBody = (body: string, method: ApiInspectorMethod) => {
    if (method === ApiInspectorMethod.GQL) {
      return getGqlPayloadVariables(body);
    }
    return body;
  };

  const handleCopy = () => {
    const text = current.zql || formatReqPath(current.reqPath);
    navigator.clipboard.writeText(text);
  };

  const handleViewDetail = () => {
    if (inGqlDetail || current.method !== "GQL") {
      onReqItemSelect?.(current);
      setReqModalVisible?.(true);
    } else {
      onGqlItemSelect?.(current);
      setGqlDrawerVisible?.(true);
    }
  };

  const handleViewLog = () => {
    onSelectedLogItem?.(current);
    setLogDetailModalVisible?.(true);
  };

  const isPending = current.status === "Pending";
  const isSlowRequest = (current.responseTime ?? 0) > 1000;
  const methodConfig = current.method ? methodThemeMap[current.method] : null;

  const isMediumRequest = (current.responseTime ?? 0) > 300;

  // 根据请求状态获取边框颜色
  const getBorderColor = () => {
    if (isSlowRequest) {
      return COLORS.status.danger;
    }
    if (isMediumRequest) {
      return COLORS.status.alert;
    }
    return COLORS.border.light;
  };

  return (
    <div
      className={cn(
        "group relative flex h-full cursor-pointer items-start gap-2 rounded px-3 py-2 transition-all duration-100",
        "bg-neutral-0",
        isSlowRequest
          ? "bg-danger-50/30"
          : isMediumRequest
            ? "bg-alert-50/20"
            : "",
        "hover:bg-theme-50/30 hover:shadow-sm",
      )}
      style={{
        border: `1px solid ${getBorderColor()}`,
      }}
      onClick={handleViewDetail}
    >
      {/* 左侧：状态指示条 + 时间 */}
      <div className="flex w-16 flex-shrink-0 flex-col items-end gap-1 pt-0.5">
        <StatusIndicator item={current} />
        <span className="font-mono text-[10px] text-neutral-400 tabular-nums">
          {dayjs(current.timestamp).format("HH:mm:ss")}
        </span>
      </div>

      {/* 状态指示条 */}
      <div className="relative w-0.5 flex-shrink-0 self-stretch overflow-hidden rounded-full bg-neutral-200">
        <div
          className={cn(
            "absolute inset-0 transition-colors",
            isPending
              ? "bg-info-500 animate-pulse"
              : isSlowRequest
                ? "bg-danger-500"
                : isMediumRequest
                  ? "bg-alert-500"
                  : "bg-positive-500",
          )}
        />
      </div>

      {/* 中间：请求信息 */}
      <div className="flex min-w-0 flex-1 flex-col gap-1 overflow-hidden pl-1">
        {/* 第一行：方法标签 + SDK名称 */}
        <div className="flex flex-wrap items-center gap-1.5">
          {methodConfig && (
            <Tag size="small" theme={methodConfig.theme} level="base">
              {methodConfig.label}
            </Tag>
          )}
          {current.method !== ApiInspectorMethod.GQL && current.sdkName && (
            <span
              className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500"
              style={{ border: `1px solid ${COLORS.border.light}` }}
            >
              {current.method === ApiInspectorMethod.ZQL
                ? "ZQL"
                : current.sdkName}
            </span>
          )}
          {current.children && current.children.length > 1 && (
            <Tag size="small" theme="violet" level="base">
              {current.children.length}
            </Tag>
          )}
        </div>

        {/* 第二行：请求路径 */}
        <div className="truncate font-mono text-xs leading-normal text-neutral-700">
          {generateReqPath(current.zql || formatReqPath(current.reqPath), mark)}
        </div>

        {/* 第三行：请求体（如果有）- 单行截断 + 省略号 */}
        {current?.body && current?.body !== "{}" && current.method && (
          <div className="truncate font-mono text-[10px] text-neutral-400">
            {generateBody(current.body, current.method)}
          </div>
        )}
      </div>

      {/* 右侧：操作按钮 */}
      <div
        className="flex h-7 flex-shrink-0 items-center self-center overflow-hidden rounded opacity-0 transition-opacity group-hover:opacity-100"
        style={{ border: `1px solid ${COLORS.border.base}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <Tooltip title="复制">
          <button
            onClick={handleCopy}
            className="bg-neutral-0 hover:text-theme-600 hover:bg-theme-50 flex h-full w-7 cursor-pointer items-center justify-center border-none text-neutral-400 transition-colors"
          >
            <Copy className="mt-0.5 h-4 w-4" />
          </button>
        </Tooltip>
        <div
          className="h-3.5 w-px"
          style={{ backgroundColor: COLORS.border.light }}
        />
        <Tooltip
          title={intl.formatMessage({
            id: "viewLog",
            defaultMessage: "Log",
          })}
        >
          <button
            onClick={handleViewLog}
            className="bg-neutral-0 hover:text-theme-600 hover:bg-theme-50 flex h-full cursor-pointer items-center justify-center border-none px-2.5 text-xs font-medium text-neutral-500 transition-colors"
          >
            Log
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default SingleRequest;
