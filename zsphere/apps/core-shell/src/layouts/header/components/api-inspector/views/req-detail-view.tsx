import { Copy, Tooltip, Loader, Tag } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { cn } from "@zstack/utils";
import { ApiInspectorMethod } from "@zstack/zsphere-types";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import ReactJSON from "react-json-view";

import type { ApiInspectorDetailExtend } from "../utils";
import {
  formatReqPath,
  formatCliByReqPath,
  formatRequestMethod,
  formatCurl,
} from "../utils";

// 统一的颜色常量 - 使用 ZSV 项目定义的 neutral 颜色

interface IProps {
  current?: ApiInspectorDetailExtend;
  onBack: () => void;
}

// 描述项组件
interface DescItemProps {
  label: string;
  children: React.ReactNode;
  copyable?: boolean;
  copyText?: string;
  wordBreak?: boolean;
  highlight?: boolean;
}

const DescItem: React.FC<DescItemProps> = ({
  label,
  children,
  copyable,
  copyText,
  wordBreak,
  highlight,
}) => {
  const handleCopy = () => {
    if (copyText) {
      navigator.clipboard.writeText(copyText);
    }
  };

  return (
    <div
      className={cn(
        "group flex border-b border-solid border-neutral-200 transition-colors last:border-b-0",
        "hover:bg-neutral-50/50",
      )}
    >
      <div
        className={cn(
          "w-24 flex-shrink-0 px-3 py-2 text-xs font-medium tracking-wide text-neutral-500 uppercase",
          "border-r border-solid border-neutral-200 bg-neutral-50",
        )}
      >
        {label}
      </div>
      <div
        className={cn(
          "flex-1 px-3 py-2 text-xs text-neutral-700",
          wordBreak && "font-mono text-xs break-all",
          highlight && "bg-theme-50/50",
        )}
      >
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">{children}</div>
          {copyable && copyText && (
            <Tooltip title="复制">
              <button
                onClick={handleCopy}
                className="bg-neutral-0 flex h-6 w-6 flex-shrink-0 cursor-pointer items-center justify-center rounded border border-solid border-neutral-200 text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-neutral-100 hover:text-neutral-600"
              >
                <Copy className="mt-0.5 h-4 w-4" />
              </button>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
};

// 方法标签 theme 映射
const methodThemeMap: Record<
  string,
  "blue" | "yellow" | "yellow-green" | "red" | "violet" | "teal"
> = {
  GET: "blue",
  POST: "yellow",
  PUT: "yellow-green",
  DELETE: "red",
  GQL: "violet",
  ZQL: "teal",
};

const ReqDetailView: React.FC<IProps> = ({ current, onBack }) => {
  const intl = useIntl();

  const headers: Record<string, string> = useMemo(() => {
    const res: Record<string, string> = {
      "Content-Type": "application/json;charset=UTF-8",
    };
    if (current?.method === ApiInspectorMethod.GQL) {
      res["x-session-id"] = `${localStorage.getItem("sessionId")}`;
    } else {
      res["Authorization"] = `OAuth ${localStorage.getItem("sessionId")}`;
    }
    return res;
  }, [current]);

  const curlCommand = useMemo(() => {
    let command = 'curl -H "Content-Type: application/json;charset=UTF-8" ';
    if (current?.method === ApiInspectorMethod.GQL) {
      command += `-H "x-session-id: ${localStorage.getItem("sessionId")}" `;
    } else {
      command += `-H "Authorization: OAuth ${localStorage.getItem("sessionId")}" `;
    }
    command += `-X ${formatRequestMethod(current?.method)} `;
    command += current?.body ? `-d '${current?.body}' ` : "";
    command += formatCurl(formatReqPath(current?.reqPath), !!current?.zql);
    return command;
  }, [current]);

  const methodLabel = formatRequestMethod(current?.method);
  const methodTheme = methodThemeMap[methodLabel] || "teal";

  return (
    <div className="bg-neutral-0 flex h-full flex-col">
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-solid border-neutral-200 bg-neutral-50 px-4">
        <div className="inline-flex items-center gap-4">
          <button
            onClick={onBack}
            className="bg-neutral-0 inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded border border-solid border-neutral-200 px-3 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
          >
            <Icon className="h-4 w-4" type="arrow-left" />
            {intl.formatMessage({
              id: "back",
              defaultMessage: "Go back",
            })}
          </button>
          <div className="h-6 w-px bg-neutral-200" />
          <div className="inline-flex items-center gap-2.5">
            <span className="text-sm font-semibold text-neutral-800">
              Request 详情
            </span>
          </div>
          <Tag size="small" theme={methodTheme} level="base">
            {methodLabel}
          </Tag>
          {current?.responseTime && (
            <span
              className={cn(
                "inline-flex items-center rounded border border-solid px-2.5 px-3 py-1 font-mono text-xs font-semibold",
                current.responseTime > 1000
                  ? "bg-danger-50 text-danger-600 border-danger-200"
                  : current.responseTime > 300
                    ? "bg-alert-50 text-alert-600 border-alert-200"
                    : "bg-positive-50 text-positive-600 border-positive-200",
              )}
            >
              {current.responseTime} ms
            </span>
          )}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-auto bg-neutral-50/50">
        <div className="divide-y divide-neutral-200">
          {/* 基础信息区块 */}
          <div className="bg-neutral-0 px-3 py-3">
            <h3 className="mb-2 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
              基本信息
            </h3>
            <div className="bg-neutral-0 overflow-hidden rounded border border-solid border-neutral-200">
              <DescItem label="traceId" copyable copyText={current?.traceId}>
                <code className="font-mono text-xs text-violet-600">
                  {current?.traceId}
                </code>
              </DescItem>
              <DescItem label="apiId" copyable copyText={current?.apiId}>
                <code className="font-mono text-xs text-neutral-600">
                  {current?.apiId}
                </code>
              </DescItem>
              <DescItem
                label="URL"
                copyable
                copyText={formatReqPath(current?.reqPath)}
                wordBreak
                highlight
              >
                {formatReqPath(current?.reqPath)}
              </DescItem>
            </div>
          </div>

          {/* 请求头区块 */}
          <div className="bg-neutral-0 px-3 py-3">
            <h3 className="mb-2 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
              请求头
            </h3>
            <div className="bg-neutral-0 overflow-hidden rounded border border-solid border-neutral-200">
              <DescItem label="Headers">
                <ReactJSON
                  src={headers}
                  name={null}
                  collapsed={false}
                  displayDataTypes={false}
                  enableClipboard={false}
                  style={{ fontSize: "11px" }}
                />
              </DescItem>
            </div>
          </div>

          {/* 请求体区块（如果有） */}
          {current?.body && (
            <div className="bg-neutral-0 px-3 py-3">
              <h3 className="mb-2 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                请求体
              </h3>
              <div className="bg-neutral-0 overflow-hidden rounded border border-solid border-neutral-200">
                <DescItem label="Body">
                  <ReactJSON
                    src={JSON.parse(current?.body || "{}")}
                    name={null}
                    displayDataTypes={false}
                    enableClipboard={false}
                    style={{ fontSize: "11px" }}
                  />
                </DescItem>
              </div>
            </div>
          )}

          {/* ZQL / CLI 区块 */}
          {(current?.method === ApiInspectorMethod.ZQL ||
            (current?.sdkName && current?.method)) && (
            <div className="bg-neutral-0 px-3 py-3">
              <h3 className="mb-2 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                命令行工具
              </h3>
              <div className="bg-neutral-0 overflow-hidden rounded border border-solid border-neutral-200">
                {current?.method === ApiInspectorMethod.ZQL ? (
                  <>
                    <DescItem
                      label="ZQL"
                      copyable
                      copyText={current?.zql}
                      wordBreak
                    >
                      {current?.zql}
                    </DescItem>
                    <DescItem
                      label="CLI"
                      copyable
                      copyText={`ZQLQuery zql="${current?.zql}"`}
                      wordBreak
                    >
                      {`ZQLQuery zql="${current?.zql}"`}
                    </DescItem>
                  </>
                ) : (
                  current?.sdkName &&
                  current?.method && (
                    <DescItem
                      label="CLI"
                      copyable
                      copyText={formatCliByReqPath(
                        current.sdkName,
                        current.method,
                        current.reqPath,
                        JSON.parse(current?.body || "{}"),
                      )}
                      wordBreak
                    >
                      {formatCliByReqPath(
                        current.sdkName,
                        current.method,
                        current.reqPath,
                        JSON.parse(current?.body || "{}"),
                      )}
                    </DescItem>
                  )
                )}
                <DescItem
                  label="Curl"
                  copyable
                  copyText={curlCommand}
                  wordBreak
                >
                  {curlCommand}
                </DescItem>
              </div>
            </div>
          )}

          {/* 响应区块 */}
          <div className="bg-neutral-0 px-3 py-3">
            <h3 className="mb-2 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
              响应数据
            </h3>
            <div className="bg-neutral-0 overflow-hidden rounded border border-solid border-neutral-200">
              {current?.method &&
                [
                  ApiInspectorMethod.POST,
                  ApiInspectorMethod.PUT,
                  ApiInspectorMethod.DELETE,
                ].includes(current.method) && (
                  <DescItem label="WebHook">
                    {current?.webHookResponse ? (
                      <ReactJSON
                        src={JSON.parse(current?.webHookResponse || "{}")}
                        name={null}
                        collapsed
                        displayDataTypes={false}
                        enableClipboard={false}
                        style={{ fontSize: "11px" }}
                      />
                    ) : (
                      <>
                        {current?.response ? (
                          <span className="text-neutral-400">-</span>
                        ) : (
                          <div className="text-info-500 flex items-center gap-2">
                            <Loader className="h-3.5 w-3.5" />
                            <span className="text-xs">等待中...</span>
                          </div>
                        )}
                      </>
                    )}
                  </DescItem>
                )}
              <DescItem label="Response">
                {current?.response ? (
                  <ReactJSON
                    src={JSON.parse(current?.response || "{}")}
                    name={null}
                    displayDataTypes={false}
                    enableClipboard={false}
                    style={{ fontSize: "11px" }}
                  />
                ) : (
                  <div className="text-info-500 flex items-center gap-2">
                    <Loader className="h-3.5 w-3.5" />
                    <span className="text-xs">加载中...</span>
                  </div>
                )}
              </DescItem>
              {current?.responseTime && (
                <DescItem label="耗时">
                  <span
                    className={cn(
                      "font-mono text-xs font-semibold",
                      current.responseTime > 1000
                        ? "text-danger-600"
                        : current.responseTime > 300
                          ? "text-alert-600"
                          : "text-positive-600",
                    )}
                  >
                    {current.responseTime} ms
                  </span>
                </DescItem>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReqDetailView;
