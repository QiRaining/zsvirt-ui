import { useVirtualizer, type VirtualItem } from "@tanstack/react-virtual";
import { Tooltip, Input, Tag, type CheckboxGroupItem } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { cn } from "@zstack/utils";
import { ApiInspectorMethod } from "@zstack/zsphere-types";
import uniq from "lodash-es/uniq";
import React, { useState, useMemo, useCallback, useRef } from "react";

import { ExportDropdown } from "./export-dropdown";
import { useSessionStorageState } from "./hooks";
import SingleRequest from "./single-request";
import { useStandaloneSubscription } from "./use-apollo-standalone";
import { useInspectorReceiver } from "./use-inspector-channel";
import { formatReqPath, type ApiInspectorDetailExtend } from "./utils";
import { GqlDetailView, ReqDetailView, LogDetailView } from "./views";

type IShowType = "flatten" | "group";
type ViewType = "list" | "gql-detail" | "req-detail" | "log-detail";

const COLORS = {
  border: {
    light: "#dbdde0",
    base: "#c8cacd",
  },
};

const defaultCheckedMethods: ApiInspectorMethod[] = [
  ApiInspectorMethod.GQL,
  ApiInspectorMethod.ZQL,
  ApiInspectorMethod.GET,
  ApiInspectorMethod.POST,
  ApiInspectorMethod.PUT,
  ApiInspectorMethod.DELETE,
];

const checkOptions: CheckboxGroupItem[] = [
  { label: "GQL", value: ApiInspectorMethod.GQL },
  { label: "ZQL", value: ApiInspectorMethod.ZQL },
  { label: "GET", value: ApiInspectorMethod.GET },
  { label: "POST", value: ApiInspectorMethod.POST },
  { label: "PUT", value: ApiInspectorMethod.PUT },
  { label: "DEL", value: ApiInspectorMethod.DELETE },
];

const LIMIT = 500;

const PopupWindow = () => {
  const [currentView, setCurrentView] = useState<ViewType>("list");

  const [selectedGqlItem, setSelectedGqlItem] = useState<
    ApiInspectorDetailExtend | undefined
  >();
  const [selectedReqItem, setSelectedReqItem] = useState<
    ApiInspectorDetailExtend | undefined
  >();
  const [selectedLogItem, setSelectedLogItem] = useState<
    ApiInspectorDetailExtend | undefined
  >();

  const [timelineShowType, setTimelineShowType] =
    useSessionStorageState<IShowType>(
      "apiInspectorPopupTimelineShowType",
      "group",
    );
  const [filterDurationComparison, setFilterDurationComparison] = useState<
    ">=" | "<=" | "="
  >(">=");
  const [filterDuration, setFilterDuration] = useState<number | "">("");
  const [filterReqPath, setFilterReqPath] = useState<string>("");
  const [checkedHttpMethod, setCheckedHttpMethodType] = useSessionStorageState<
    ApiInspectorMethod[]
  >("apiInspectorPopupCheckedType", defaultCheckedMethods);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const {
    data: channelData,
    isMainWindowActive,
    clearData: clearChannelData,
  } = useInspectorReceiver();

  const {
    data: standaloneData,
    loading: standaloneLoading,
    error: standaloneError,
    clearData: clearStandaloneData,
  } = useStandaloneSubscription(!isMainWindowActive);

  const rawData = isMainWindowActive ? channelData : standaloneData;

  const requestCount = rawData.length;
  const pendingCount = useMemo(() => {
    return rawData.filter((item) => item.status === "Pending").length;
  }, [rawData]);

  const list = useMemo(() => {
    const sortedData = [...rawData].sort(
      (a: ApiInspectorDetailExtend, b: ApiInspectorDetailExtend) =>
        (b.timestamp ?? 0) - (a.timestamp ?? 0),
    );

    let filteredList: ApiInspectorDetailExtend[];
    if (timelineShowType === "flatten") {
      filteredList = sortedData.map((e: ApiInspectorDetailExtend) => {
        if (e.method === ApiInspectorMethod.GQL) {
          return {
            ...e,
            children: sortedData.filter(
              (i: ApiInspectorDetailExtend) =>
                i.traceId === e.traceId && i !== e,
            ),
          };
        }
        return e;
      });
    } else {
      const gqlEntries = sortedData.filter(
        (e: ApiInspectorDetailExtend) => e.method === ApiInspectorMethod.GQL,
      );
      filteredList = gqlEntries.map((e: ApiInspectorDetailExtend) => ({
        ...e,
        children: sortedData.filter(
          (i: ApiInspectorDetailExtend) => i.traceId === e.traceId && i !== e,
        ),
      }));
    }

    filteredList = filteredList.filter(
      (e) => e.method && checkedHttpMethod?.includes(e.method),
    );

    const filterDurationNum =
      filterDuration !== "" ? filterDuration : undefined;
    if (filterDurationNum) {
      filteredList = filteredList.filter((e) => {
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
      filteredList = filteredList.filter((e) =>
        formatReqPath(e.reqPath)
          .toLowerCase()
          .includes(filterReqPath.toLowerCase()),
      );
    }

    return filteredList;
  }, [
    rawData,
    timelineShowType,
    checkedHttpMethod,
    filterDuration,
    filterDurationComparison,
    filterReqPath,
  ]);

  const virtualizer = useVirtualizer({
    count: list.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 88,
    overscan: 5,
    gap: 6,
  });

  const virtualItems = virtualizer.getVirtualItems();

  const handleGqlItemSelect = useCallback((item: ApiInspectorDetailExtend) => {
    setSelectedGqlItem(item);
    setCurrentView("gql-detail");
  }, []);

  const handleReqItemSelect = useCallback((item: ApiInspectorDetailExtend) => {
    setSelectedReqItem(item);
    setCurrentView("req-detail");
  }, []);

  const handleLogItemSelect = useCallback((item: ApiInspectorDetailExtend) => {
    setSelectedLogItem(item);
    setCurrentView("log-detail");
  }, []);

  const handleBackToList = useCallback(() => {
    setCurrentView("list");
  }, []);

  const handleBackFromReqDetail = useCallback(() => {
    if (selectedGqlItem) {
      setCurrentView("gql-detail");
    } else {
      setCurrentView("list");
    }
  }, [selectedGqlItem]);

  const handleBackFromLogDetail = useCallback(() => {
    if (selectedGqlItem) {
      setCurrentView("gql-detail");
    } else {
      setCurrentView("list");
    }
  }, [selectedGqlItem]);

  const handleShowTypeChange = (value: string) => {
    if (value === "group") {
      setCheckedHttpMethodType((prev) =>
        uniq([...(prev || []), ApiInspectorMethod.GQL]),
      );
    }
    setTimelineShowType(value as IShowType);
  };

  const onCheckboxChange = (checkedValues: string[]) => {
    setCheckedHttpMethodType(checkedValues as ApiInspectorMethod[]);
  };

  const handleClearRecords = () => {
    if (isMainWindowActive) {
      clearChannelData();
    } else {
      clearStandaloneData();
    }
    setCurrentView("list");
    setSelectedGqlItem(undefined);
    setSelectedReqItem(undefined);
    setSelectedLogItem(undefined);
  };

  const renderView = () => {
    switch (currentView) {
      case "gql-detail":
        return (
          <GqlDetailView
            current={selectedGqlItem}
            checkedHttpMethod={checkedHttpMethod || []}
            checkOptions={checkOptions}
            onBack={handleBackToList}
            onReqItemSelect={handleReqItemSelect}
            onSelectedLogItem={handleLogItemSelect}
          />
        );
      case "req-detail":
        return (
          <ReqDetailView
            current={selectedReqItem}
            onBack={handleBackFromReqDetail}
          />
        );
      case "log-detail":
        return (
          <LogDetailView
            current={selectedLogItem}
            onBack={handleBackFromLogDetail}
          />
        );
      default:
        return renderListView();
    }
  };

  const renderListView = () => (
    <>
      {/* 工具栏 */}
      <div
        className="bg-neutral-0 flex shrink-0 items-center justify-between px-4 py-3"
        style={{ borderBottom: `1px solid ${COLORS.border.light}` }}
      >
        <div className="inline-flex shrink-0 items-center gap-4">
          {/* 耗时筛选 */}
          <div className="inline-flex shrink-0 items-center gap-2.5">
            <span className="mr-0.5 text-xs font-medium whitespace-nowrap text-neutral-500">
              耗时
            </span>
            <div
              className="bg-neutral-0 inline-flex h-8 items-center overflow-hidden rounded"
              style={{ border: `1px solid ${COLORS.border.light}` }}
            >
              <select
                value={filterDurationComparison}
                onChange={(e) =>
                  setFilterDurationComparison(
                    e.target.value as ">=" | "<=" | "=",
                  )
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

          {/* 分隔线 */}
          <div
            className="h-6 w-px shrink-0"
            style={{ backgroundColor: COLORS.border.light }}
          />

          {/* 路径搜索 */}
          <div className="relative shrink-0">
            <Input
              placeholder="搜索请求..."
              className="h-8 w-52 text-xs"
              value={filterReqPath}
              onChange={(e) => setFilterReqPath(e.target.value)}
            />
          </div>

          {/* 方法类型筛选 */}
          {timelineShowType === "flatten" && (
            <>
              <div
                className="h-6 w-px shrink-0"
                style={{ backgroundColor: COLORS.border.light }}
              />
              <div className="inline-flex shrink-0 items-center gap-1">
                {checkOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      const newValues = checkedHttpMethod?.includes(
                        opt.value as ApiInspectorMethod,
                      )
                        ? checkedHttpMethod.filter((v) => v !== opt.value)
                        : [...(checkedHttpMethod || []), opt.value];
                      onCheckboxChange(newValues);
                    }}
                    className={cn(
                      "inline-flex items-center justify-center rounded px-2 py-1 text-xs font-medium transition-all duration-100",
                      checkedHttpMethod?.includes(
                        opt.value as ApiInspectorMethod,
                      )
                        ? "bg-theme-50 text-theme-600"
                        : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-600",
                    )}
                    style={{
                      border: `1px solid ${
                        checkedHttpMethod?.includes(
                          opt.value as ApiInspectorMethod,
                        )
                          ? "#93c5fd"
                          : COLORS.border.light
                      }`,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ExportDropdown filteredItems={list} allItems={rawData} />
          <button
            onClick={handleClearRecords}
            className="bg-neutral-0 hover:text-theme-600 hover:bg-theme-50 inline-flex shrink-0 items-center justify-center gap-1 rounded px-2 py-1 text-xs font-medium whitespace-nowrap text-neutral-600 transition-colors"
            style={{ border: `1px solid ${COLORS.border.base}` }}
          >
            <Icon className="h-3.5 w-3.5" type="trash" />
            清空
          </button>
        </div>
      </div>

      {/* 列表区域 */}
      <div className="flex-1 overflow-hidden bg-neutral-50/50">
        {list.length > 0 ? (
          <div ref={scrollContainerRef} className="h-full overflow-auto">
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {virtualItems.map((virtualRow: VirtualItem) => {
                const item = list[virtualRow.index];
                return (
                  <div
                    key={item?.apiId || virtualRow.index}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className="px-3 py-1.5"
                  >
                    {item && (
                      <SingleRequest
                        current={item}
                        onGqlItemSelect={handleGqlItemSelect}
                        setGqlDrawerVisible={() => {}}
                        onReqItemSelect={handleReqItemSelect}
                        setReqModalVisible={() => {}}
                        onSelectedLogItem={handleLogItemSelect}
                        setLogDetailModalVisible={() => {}}
                        mark={filterReqPath}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-neutral-400">
            <Icon className="mb-3 h-12 w-12 opacity-30" type="activity" />
            <span className="text-sm">暂无请求</span>
            <span className="mt-1 text-xs text-neutral-300">
              {isMainWindowActive
                ? "在主窗口进行操作，请求将同步显示在这里"
                : "独立模式：在页面上进行操作，请求将显示在这里"}
            </span>
          </div>
        )}
      </div>

      {/* 底部状态栏 */}
      {list.length >= LIMIT * (checkedHttpMethod?.length || 1) && (
        <div
          className="bg-alert-50 shrink-0 py-1.5 text-center"
          style={{ borderTop: "1px solid #fcd34d" }}
        >
          <span className="text-alert-600 text-xs">
            仅显示最近 {LIMIT * (checkedHttpMethod?.length || 1)} 条
          </span>
        </div>
      )}
    </>
  );

  return (
    <div className="flex h-screen flex-col bg-neutral-50">
      {/* Header */}
      <div
        className="flex h-12 shrink-0 items-center justify-between bg-gradient-to-r from-neutral-50 to-neutral-100 px-4"
        style={{ borderBottom: `1px solid ${COLORS.border.light}` }}
      >
        {/* 左侧：标题 + 切换 + 统计 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-theme-50 border-theme-100 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border">
              <span className="text-theme-600 text-[10px] font-bold">API</span>
            </div>
            <span className="text-sm font-semibold text-neutral-800">
              Inspector
            </span>
          </div>

          {/* 视图切换 */}
          {currentView === "list" && (
            <div
              className="flex h-7 shrink-0 items-center overflow-hidden rounded"
              style={{ border: `1px solid ${COLORS.border.light}` }}
            >
              <button
                onClick={() => handleShowTypeChange("group")}
                className={cn(
                  "flex h-full cursor-pointer items-center justify-center gap-1.5 border-none px-3 text-xs font-medium transition-all duration-150",
                  timelineShowType === "group"
                    ? "bg-theme-50 text-theme-600"
                    : "bg-neutral-0 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700",
                )}
              >
                <Icon className="h-3.5 w-3.5" type="grid" />
                分组
              </button>
              <div
                className="h-4 w-px"
                style={{ backgroundColor: COLORS.border.light }}
              />
              <button
                onClick={() => handleShowTypeChange("flatten")}
                className={cn(
                  "flex h-full cursor-pointer items-center justify-center gap-1.5 border-none px-3 text-xs font-medium transition-all duration-150",
                  timelineShowType === "flatten"
                    ? "bg-theme-50 text-theme-600"
                    : "bg-neutral-0 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700",
                )}
              >
                <Icon className="h-3.5 w-3.5" type="list" />
                平铺
              </button>
            </div>
          )}

          {/* 统计 */}
          <div className="flex items-center gap-2 text-xs">
            <Tag size="small" level="weak" className="font-medium tabular-nums">
              {list.length}/{requestCount}
            </Tag>
            {pendingCount > 0 && (
              <Tag
                size="small"
                theme="yellow"
                level="base"
                className="animate-pulse font-medium tabular-nums"
              >
                {pendingCount} pending
              </Tag>
            )}
          </div>
        </div>

        {/* 右侧：连接状态 */}
        <div className="flex items-center gap-2">
          <Tooltip
            title={
              isMainWindowActive
                ? "已连接主窗口 - 数据实时同步"
                : "独立模式 - 直接订阅 WebSocket"
            }
          >
            <div
              className={cn(
                "flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium",
                isMainWindowActive
                  ? "bg-positive-50 text-positive-700"
                  : "bg-alert-50 text-alert-700",
              )}
            >
              {isMainWindowActive ? (
                <>
                  <Icon className="h-3.5 w-3.5" type="wifi" />
                  同步模式
                </>
              ) : (
                <>
                  <Icon className="h-3.5 w-3.5" type="wifi-off" />
                  独立模式
                </>
              )}
            </div>
          </Tooltip>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex flex-1 flex-col overflow-hidden">{renderView()}</div>

      {/* 独立模式错误提示 */}
      {!isMainWindowActive && standaloneError && (
        <div
          className="bg-danger-50 absolute right-4 bottom-4 left-4 rounded-lg p-3 shadow-lg"
          style={{ border: `1px solid ${COLORS.border.light}` }}
        >
          <div className="text-danger-700 text-sm">
            <strong>连接错误：</strong>
            {standaloneError.message}
          </div>
        </div>
      )}

      {/* 独立模式连接中 */}
      {!isMainWindowActive && standaloneLoading && (
        <div
          className="bg-info-50 absolute right-4 bottom-4 left-4 rounded-lg p-3 shadow-lg"
          style={{ border: `1px solid ${COLORS.border.light}` }}
        >
          <div className="text-info-700 text-sm">正在建立独立连接...</div>
        </div>
      )}
    </div>
  );
};

export default React.memo(PopupWindow);
