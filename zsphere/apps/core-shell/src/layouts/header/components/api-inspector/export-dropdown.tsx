import { Icon } from "@zstack/icon";
import { cn } from "@zstack/utils";
import React, { useState, useRef, useEffect } from "react";

import {
  type ExportFormat,
  exportAsJSON,
  exportAsHAR,
  exportAsCSV,
  copyToClipboard,
} from "./export-utils";
import type { ApiInspectorDetailExtend } from "./utils";

interface ExportDropdownProps {
  filteredItems: ApiInspectorDetailExtend[];
  allItems: ApiInspectorDetailExtend[];
}

const COLORS = {
  border: {
    light: "#dbdde0",
    base: "#c8cacd",
  },
};

const FORMAT_OPTIONS = [
  {
    format: "json" as ExportFormat,
    label: "JSON 完整数据",
    description: "包含请求/响应的完整数据，适合开发调试",
    color: "bg-theme-500",
    recommended: true,
  },
  {
    format: "har" as ExportFormat,
    label: "HAR 格式",
    description: "HTTP Archive 标准格式，可导入浏览器 DevTools",
    color: "bg-positive-500",
    recommended: false,
  },
  {
    format: "csv" as ExportFormat,
    label: "CSV 摘要表格",
    description: "表格格式摘要，方便在 Excel 中分析耗时分布",
    color: "bg-alert-500",
    recommended: false,
  },
  {
    format: "clipboard" as ExportFormat,
    label: "复制到剪贴板",
    description: "JSON 格式复制到剪贴板，便于即时分享",
    color: "bg-violet-500",
    recommended: false,
  },
] as const;

export const ExportDropdown: React.FC<ExportDropdownProps> = React.memo(
  ({ filteredItems, allItems }) => {
    const [open, setOpen] = useState(false);
    const [scope, setScope] = useState<"filtered" | "all">("filtered");
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!open) {
        return;
      }

      const handleClickOutside = (event: MouseEvent): void => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setOpen(false);
        }
      };

      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }, [open]);

    const handleExport = (format: ExportFormat): void => {
      const items = scope === "filtered" ? filteredItems : allItems;
      switch (format) {
        case "json":
          exportAsJSON(items);
          break;
        case "har":
          exportAsHAR(items);
          break;
        case "csv":
          exportAsCSV(items);
          break;
        case "clipboard":
          copyToClipboard(items);
          break;
      }
      setOpen(false);
    };

    const currentCount =
      scope === "filtered" ? filteredItems.length : allItems.length;

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          className="bg-neutral-0 hover:text-theme-600 hover:bg-theme-50 inline-flex shrink-0 items-center justify-center gap-1 rounded px-2 py-1 text-xs font-medium text-neutral-600 transition-colors"
          style={{ border: `1px solid ${COLORS.border.base}` }}
          onClick={() => setOpen(!open)}
        >
          <Icon className="h-3.5 w-3.5" type="download" />
          导出
        </button>

        {open && (
          <div
            className="bg-neutral-0 absolute top-full right-0 z-50 mt-1 w-80 overflow-hidden rounded-lg shadow-lg"
            style={{ border: `1px solid ${COLORS.border.light}` }}
          >
            <div className="px-4 pt-3 pb-2">
              <div className="text-sm font-semibold text-neutral-800">
                导出请求数据
              </div>
              <div className="mt-0.5 text-xs text-neutral-400">
                导出当前筛选范围的 {currentCount} 条请求记录
              </div>
            </div>

            <div>
              {FORMAT_OPTIONS.map((option) => {
                const isRecommended = option.recommended;
                return (
                  <div
                    key={option.format}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 px-4 py-2.5 transition-colors",
                      isRecommended
                        ? "bg-theme-50 hover:bg-theme-100"
                        : "hover:bg-neutral-50",
                    )}
                    onClick={() => handleExport(option.format)}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                        option.color,
                      )}
                    >
                      {option.format === "clipboard" ? (
                        <Icon className="h-4 w-4 text-white" type="copy" />
                      ) : (
                        <Icon className="h-4 w-4 text-white" type="download" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-neutral-800">
                          {option.label}
                        </span>
                        {isRecommended && (
                          <span className="bg-positive-100 text-positive-700 rounded px-1.5 py-0.5 text-[10px] font-medium">
                            推荐
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs text-neutral-500">
                        {option.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className="bg-neutral-50 px-4 py-3"
              style={{ borderTop: `1px solid ${COLORS.border.light}` }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-600">导出范围</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      scope === "filtered"
                        ? "bg-theme-600 text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
                    )}
                    onClick={() => setScope("filtered")}
                  >
                    当前视图 ({filteredItems.length})
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      scope === "all"
                        ? "bg-theme-600 text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
                    )}
                    onClick={() => setScope("all")}
                  >
                    全部请求 ({allItems.length})
                  </button>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-[11px] text-neutral-400">
                <Icon className="h-3 w-3" type="download" />
                <span>文件将下载到浏览器的下载区</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

ExportDropdown.displayName = "ExportDropdown";
