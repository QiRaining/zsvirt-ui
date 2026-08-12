import { Checkbox, RadioGroup, Loader, Tag } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { CodeEditor } from "@zstack/unifie";
import { cn } from "@zstack/utils";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { ApiInspectorMethod } from "@zstack/zsphere-types";
import React, { useMemo, useEffect } from "react";
import { useIntl } from "react-intl";

import useGetServerLog from "../use-get-server-log";
import type { ApiInspectorDetailExtend, MnLogInfo } from "../utils";
import {
  formatReqPath,
  getGqlPayloadVariables,
  combineAndSortMnLogs,
} from "../utils";

// 统一的颜色常量 - 与 api-inspector/index.tsx 保持一致
const COLORS = {
  border: {
    light: "#e5e7eb", // neutral-200 - 更浅的边框，避免看起来像黑色
    base: "#d1d5db", // neutral-300 - 基础边框
  },
};

interface IProps {
  current?: ApiInspectorDetailExtend;
  onBack: () => void;
}

type ActiveType = "ui-server" | "mn";
type LogFile =
  | "zstack-ui-server.log"
  | "nginx-access.log"
  | "management-server.log";

const tabs: { [key in ActiveType]: LogFile[] } = {
  "ui-server": ["zstack-ui-server.log", "nginx-access.log"],
  mn: ["management-server.log"],
};

const logContentInit: { [key in LogFile]: string | MnLogInfo[] } = {
  "zstack-ui-server.log": "",
  "nginx-access.log": "",
  "management-server.log": "",
};

const LogDetailView: React.FC<IProps> = ({ current, onBack }) => {
  const intl = useIntl();
  const managementNode = usePlatformStore(
    (state: unknown) =>
      (state as { managementNode: { isDoubleManagementNode: boolean } })
        .managementNode,
  );
  const [wordWrapChecked, setWordWrapChecked] = React.useState<boolean>(false);
  const [activeTabKey, setActiveTabKey] = React.useState<LogFile>(
    tabs["ui-server"][0],
  );
  const {
    loading,
    getUiServerLog,
    getNginxAccessLog,
    getMNLog,
    getDoubleMNLog: getDoubleMNLogFn,
  } = useGetServerLog();
  const [logContent, setLogContent] = React.useState<{
    [key in LogFile]: string | MnLogInfo[];
  }>(
    managementNode?.isDoubleManagementNode
      ? {
          ...logContentInit,
          "management-server.log": [] as MnLogInfo[],
        }
      : logContentInit,
  );
  const [currentMn, setCurrentMn] = React.useState<string>("");

  const getLogContent = async (file: LogFile) => {
    if (
      logContent[file] &&
      (typeof logContent[file] === "string"
        ? logContent[file]
        : (logContent[file] as MnLogInfo[]).length > 0)
    ) {
      return logContent[file];
    }
    let data: string | MnLogInfo[] = "";
    if (file === "zstack-ui-server.log") {
      const result = await getUiServerLog(current?.traceId ?? "");
      data = extractLogData(result);
    } else if (file === "nginx-access.log") {
      const result = await getNginxAccessLog(current?.traceId ?? "");
      data = extractLogData(result);
    } else if (file === "management-server.log") {
      if (managementNode.isDoubleManagementNode) {
        const result = await getDoubleMNLogFn(current?.apiId ?? "");
        const requestData = extractMnLogData(result);
        data = [
          ...requestData,
          {
            ip: "Combined",
            log: combineAndSortMnLogs(requestData),
            ownsVip: false,
          },
        ];
        if (data.length > 0) {
          setCurrentMn(data[0].ip);
        }
      } else {
        const result = await getMNLog(current?.apiId ?? "");
        data = extractLogData(result);
      }
    }
    setLogContent({
      ...logContent,
      [file]: data,
    });
    return data;
  };

  const extractLogData = (result: unknown): string => {
    if (typeof result === "string") {
      return result;
    }
    if (result && typeof result === "object" && "data" in result) {
      const data = (result as { data: unknown }).data;
      return typeof data === "string" ? data : "";
    }
    return "";
  };

  const extractMnLogData = (result: unknown): MnLogInfo[] => {
    if (Array.isArray(result)) {
      return result as MnLogInfo[];
    }
    if (result && typeof result === "object" && "data" in result) {
      const data = (result as { data: unknown }).data;
      if (Array.isArray(data)) {
        return data as MnLogInfo[];
      }
    }
    return [];
  };

  const generateBody = (body: string, method?: ApiInspectorMethod) => {
    if (method === ApiInspectorMethod.GQL) {
      return getGqlPayloadVariables(body);
    }
    return body;
  };

  const activeIdType: ActiveType = useMemo(() => {
    if (current?.method === ApiInspectorMethod.GQL) {
      setActiveTabKey(tabs["ui-server"][0]);
      return "ui-server";
    }
    setActiveTabKey(tabs["mn"][0]);
    return "mn";
  }, [current]);

  useEffect(() => {
    setLogContent(
      managementNode?.isDoubleManagementNode
        ? {
            ...logContentInit,
            "management-server.log": [] as MnLogInfo[],
          }
        : logContentInit,
    );
    getLogContent(activeTabKey);
  }, [current, activeTabKey]);

  const onTabChange = async (key: string) => {
    setActiveTabKey(key as LogFile);
  };

  const generateResponseTime = (item: ApiInspectorDetailExtend | undefined) => {
    if (item && item.responseTime) {
      return (
        <span
          className={cn(
            "font-mono font-semibold",
            item.responseTime > 1000
              ? "text-danger-600"
              : item.responseTime > 300
                ? "text-alert-600"
                : "text-positive-600",
          )}
        >
          {item.responseTime} ms
        </span>
      );
    }
    if (item && item.status === "WaitingWebHook") {
      return <span className="text-alert-600">WaitingWebHook</span>;
    }
    return (
      <span className="text-info-500 flex items-center gap-1.5">
        <Loader className="h-3.5 w-3.5" />
        <span className="text-xs">加载中...</span>
      </span>
    );
  };

  const generateLogContent = (logFile: LogFile): string => {
    if (
      logFile === "management-server.log" &&
      managementNode.isDoubleManagementNode
    ) {
      const content = logContent[logFile];
      if (Array.isArray(content) && content.length > 0 && currentMn) {
        return content.find((it: MnLogInfo) => it.ip === currentMn)?.log || "";
      }
      return "";
    }
    return (logContent[logFile] as string) || "";
  };

  // const tabsList = tabs[activeIdType].map((tabKey: LogFile) => ({
  //   value: tabKey,
  //   label: (
  //     <span
  //       className={cn(
  //         "flex items-center gap-2 text-xs transition-colors py-0.5",
  //         activeTabKey === tabKey
  //           ? "text-theme-600"
  //           : "text-neutral-600 hover:text-neutral-900",
  //       )}
  //     >
  //       <span
  //         className={cn(
  //           "w-1.5 h-1.5 rounded-full transition-colors",
  //           activeTabKey === tabKey
  //             ? "bg-theme-500 shadow-[0_0_0_2px_rgba(var(--theme-500),0.2)]"
  //             : "bg-neutral-300",
  //         )}
  //       />
  //       <span
  //         className={cn(
  //           "font-medium transition-all",
  //           activeTabKey === tabKey ? "font-semibold" : "",
  //         )}
  //       >
  //         {tabKey}
  //       </span>
  //     </span>
  //   ),
  //   content: (
  //     <div className="pt-4">
  //       {tabKey === "management-server.log" &&
  //         managementNode.isDoubleManagementNode && (
  //           <div
  //             className="mb-4 p-3 bg-neutral-50 rounded-md"
  //             style={{ border: `1px solid ${COLORS.border.light}` }}
  //           >
  //             <div className="flex items-center gap-2 mb-3">
  //               <span className="text-xs text-neutral-600 font-medium">
  //                 选择节点
  //               </span>
  //             </div>
  //             <RadioGroup
  //               options={(Array.isArray(logContent["management-server.log"])
  //                 ? (logContent["management-server.log"] as MnLogInfo[])
  //                 : []
  //               ).map((item: MnLogInfo) => ({
  //                 value: item.ip,
  //                 label: (
  //                   <span className="flex items-center gap-2">
  //                     <span className="font-mono text-xs">{item.ip}</span>
  //                     {item.ownsVip && (
  //                       <span
  //                         className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-theme-50 text-theme-600 font-medium"
  //                         style={{ border: `1px solid ${COLORS.border.light}` }}
  //                       >
  //                         VIP
  //                       </span>
  //                     )}
  //                   </span>
  //                 ),
  //               }))}
  //               onValueChange={(value) => setCurrentMn(value)}
  //               value={currentMn}
  //               variant="button"
  //               className="text-xs"
  //             />
  //           </div>
  //         )}
  //       <div
  //         className="rounded-md overflow-hidden"
  //         style={{ border: `1px solid ${COLORS.border.light}` }}
  //       >
  //         <CodeEditor
  //           key={`${tabKey}-${wordWrapChecked}`}
  //           className="h-[calc(100%-80px)] min-h-[200px] w-full"
  //           value={loading ? "// Loading..." : generateLogContent(tabKey)}
  //           editable={false}
  //           lineWrapping={wordWrapChecked}
  //         />
  //       </div>
  //     </div>
  //   ),
  // }));

  return (
    <div className="bg-neutral-0 flex h-full flex-col">
      {/* Header */}
      <div
        className="flex h-12 shrink-0 items-center justify-between bg-neutral-50 px-5"
        style={{ borderBottom: `1px solid ${COLORS.border.light}` }}
      >
        <div className="inline-flex items-center gap-4">
          <button
            onClick={onBack}
            className="bg-neutral-0 hover:text-theme-600 hover:bg-theme-50 inline-flex h-8 cursor-pointer items-center justify-center gap-2 rounded-md px-3 text-xs font-medium text-neutral-600 transition-colors"
            style={{ border: `1px solid ${COLORS.border.light}` }}
          >
            <Icon className="h-3.5 w-3.5" type="arrow-left" />
            {intl.formatMessage({
              id: "back",
              defaultMessage: "Go back",
            })}
          </button>
          <div
            className="h-5 w-px"
            style={{ backgroundColor: COLORS.border.light }}
          />
          <div className="inline-flex items-center gap-2.5">
            <div className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-amber-100">
              <Icon className="h-3.5 w-3.5 text-amber-600" type="file-text" />
            </div>
            <span className="text-sm font-semibold text-neutral-800">
              Request Log
            </span>
          </div>
          {current?.method && (
            <Tag
              size="small"
              theme={
                current.method === ApiInspectorMethod.GQL ? "violet" : "blue"
              }
              level="base"
            >
              {current.method}
            </Tag>
          )}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-auto bg-neutral-50/50 px-5 py-4">
        {/* 请求信息卡片 */}
        <div
          className="bg-neutral-0 mb-4 rounded-md p-4"
          style={{ border: `1px solid ${COLORS.border.light}` }}
        >
          <div className="grid grid-cols-3 gap-5 text-xs">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-medium tracking-wider text-neutral-400 uppercase">
                traceId
              </span>
              <code className="truncate font-mono text-xs text-neutral-700">
                {current?.traceId ?? "-"}
              </code>
            </div>
            {current?.method !== ApiInspectorMethod.GQL && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-medium tracking-wider text-neutral-400 uppercase">
                  apiId
                </span>
                <code className="truncate font-mono text-xs text-neutral-700">
                  {current?.apiId ?? "-"}
                </code>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-medium tracking-wider text-neutral-400 uppercase">
                ResponseTime
              </span>
              <span className="text-xs">{generateResponseTime(current)}</span>
            </div>
          </div>

          <div
            className="mt-4 pt-4"
            style={{ borderTop: `1px solid ${COLORS.border.light}` }}
          >
            <div className="font-mono text-xs break-all text-neutral-600">
              {formatReqPath(current?.reqPath)}
            </div>
            {current?.body && current?.body !== "{}" && (
              <div className="mt-2 line-clamp-2 font-mono text-[10px] break-all text-neutral-400">
                {generateBody(current.body, current.method)}
              </div>
            )}
          </div>
        </div>

        {/* 自定义 Tabs Header 和 工具栏 */}
        <div
          className="mb-4 flex shrink-0 items-center justify-between px-1"
          style={{ borderBottom: `1px solid ${COLORS.border.light}` }}
        >
          {/* Tabs */}
          <div className="flex items-center gap-6">
            {tabs[activeIdType].map((tabKey) => (
              <button
                key={tabKey}
                onClick={() => onTabChange(tabKey)}
                className={cn(
                  "relative cursor-pointer border-none bg-transparent py-2.5 text-xs font-medium transition-colors outline-none",
                  activeTabKey === tabKey
                    ? "text-theme-600 font-semibold"
                    : "text-neutral-600 hover:text-neutral-900",
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full transition-all",
                      activeTabKey === tabKey
                        ? "bg-theme-500 shadow-[0_0_0_2px_rgba(var(--theme-500),0.2)]"
                        : "bg-neutral-300",
                    )}
                  />
                  {tabKey}
                </div>
                {/* 底部指示条 */}
                {activeTabKey === tabKey && (
                  <div className="bg-theme-600 absolute right-0 bottom-0 left-0 h-0.5 rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {/* 工具栏 (Checkbox) */}
          <div className="flex items-center">
            <label className="group flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 transition-colors select-none hover:bg-neutral-100">
              <div className="flex h-4 w-4 shrink-0 items-center justify-center">
                <Checkbox
                  checked={wordWrapChecked}
                  onCheckedChange={(checked) =>
                    setWordWrapChecked(checked as boolean)
                  }
                />
              </div>
              <span className="text-xs text-neutral-600 transition-colors group-hover:text-neutral-900">
                自动换行
              </span>
            </label>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {tabs[activeIdType].map((tabKey) => {
            if (tabKey !== activeTabKey) {
              return null;
            }
            return (
              <div key={tabKey} className="flex h-full flex-col">
                {tabKey === "management-server.log" &&
                  managementNode.isDoubleManagementNode && (
                    <div
                      className="mb-4 shrink-0 rounded-md bg-neutral-50 p-3"
                      style={{ border: `1px solid ${COLORS.border.light}` }}
                    >
                      <div className="mb-3 flex items-center gap-2">
                        <span className="text-xs font-medium text-neutral-600">
                          选择节点
                        </span>
                      </div>
                      <RadioGroup
                        options={(Array.isArray(
                          logContent["management-server.log"],
                        )
                          ? (logContent["management-server.log"] as MnLogInfo[])
                          : []
                        ).map((item: MnLogInfo) => ({
                          value: item.ip,
                          label: (
                            <span className="flex items-center gap-2">
                              <span className="font-mono text-xs">
                                {item.ip}
                              </span>
                              {item.ownsVip && (
                                <span
                                  className="bg-theme-50 text-theme-600 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium"
                                  style={{
                                    border: `1px solid ${COLORS.border.light}`,
                                  }}
                                >
                                  VIP
                                </span>
                              )}
                            </span>
                          ),
                        }))}
                        onValueChange={(value) => setCurrentMn(value)}
                        value={currentMn}
                        variant="button"
                        className="text-xs"
                      />
                    </div>
                  )}
                <div
                  className="flex-1 overflow-hidden rounded-md"
                  style={{ border: `1px solid ${COLORS.border.light}` }}
                >
                  <CodeEditor
                    key={`${tabKey}-${wordWrapChecked}`}
                    className="h-full w-full"
                    value={
                      loading ? "// Loading..." : generateLogContent(tabKey)
                    }
                    editable={false}
                    lineWrapping={wordWrapChecked}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LogDetailView;
