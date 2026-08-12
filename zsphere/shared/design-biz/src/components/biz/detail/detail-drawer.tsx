"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@zstack/design";
import { Icon } from "@zstack/icon";
import { cn } from "@zstack/utils";
import React, { useMemo } from "react";

export interface DetailDrawerTabPane {
  /** Tab 的唯一标识 */
  key?: string | number;
  /** Tab 标题 */
  tab?: React.ReactNode;
  /** Tab 内容 */
  children?: React.ReactNode;
  /** 操作按钮配置 */
  action?: React.ReactNode;
  /** 权限配置 */
  auth?: {
    type: "view" | "block";
    resource: string;
    authKey: string;
    children?: React.ReactNode;
  };
}

export interface DetailDrawerProps {
  /** 是否显示抽屉 */
  open: boolean;
  /** 设置显示状态 */
  setOpen?: (open: boolean) => void;
  /** 关闭回调 */
  onClose?: (e?: any) => void;
  /** Tab 面板配置 */
  tabTabPanes?: DetailDrawerTabPane[];
  /** 自定义内容（优先于 tabTabPanes） */
  children?: React.ReactNode;
  /** 抽屉宽度 */
  width?: string | number;
  /** 是否显示遮罩 */
  mask?: boolean;
  /** 是否显示关闭按钮 */
  closable?: boolean;
  /** 关闭时是否销毁内容 */
  destroyOnClose?: boolean;
  /** 抽屉位置 */
  placement?: "top" | "right" | "bottom" | "left";
  /** 挂载容器 */
  getContainer?: string | HTMLElement;
  /** 自定义类名 */
  className?: string;
}

/**
 * DetailDrawer 详情抽屉组件
 *
 * 用于显示资源详情的侧边抽屉，支持 Tab 切换
 *
 * @example
 * ```tsx
 * <DetailDrawer
 *   open={visible}
 *   setOpen={setVisible}
 *   tabTabPanes={[
 *     { key: 'info', tab: '基本信息', children: <InfoPanel /> },
 *     { key: 'config', tab: '配置', children: <ConfigPanel /> },
 *   ]}
 * />
 * ```
 */
export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  open,
  setOpen,
  onClose: propOnClose,
  tabTabPanes = [],
  children,
  width = 600,
  className,
}) => {
  const [activeTab, setActiveTab] = React.useState<string | number>(
    tabTabPanes[0]?.key ?? 0,
  );

  const handleClose = (e?: any) => {
    setOpen?.(false);
    propOnClose?.(e);
  };

  const activePane = useMemo(() => {
    return tabTabPanes.find((pane, index) => (pane.key ?? index) === activeTab);
  }, [tabTabPanes, activeTab]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent
        className={cn(
          "fixed top-0 right-0 h-full",
          "bg-zsv-neutral-0",
          "shadow-zsv-deep",
          "flex flex-col",
          className,
        )}
        style={{ width: typeof width === "number" ? `${width}px` : width }}
      >
        {/* 头部 */}
        <DialogHeader className="zsv-drawer-header flex items-center justify-between">
          <DialogTitle className="text-zsv-neutral-800 text-lg font-semibold">
            {/* 如果有 tabs，显示 tab 导航 */}
            {tabTabPanes.length > 0 && !children && (
              <div className="flex gap-6">
                {tabTabPanes.map((pane, index) => {
                  const key = pane.key ?? index;
                  const isActive = key === activeTab;
                  return (
                    <button
                      key={key}
                      type="button"
                      className={cn(
                        "pb-2 text-sm font-medium transition-colors",
                        "border-b-2",
                        isActive
                          ? "text-theme-600 border-theme-600"
                          : "text-zsv-neutral-600 hover:text-zsv-neutral-800 border-transparent",
                      )}
                      onClick={() => setActiveTab(key)}
                    >
                      {pane.tab}
                    </button>
                  );
                })}
              </div>
            )}
          </DialogTitle>
          <DialogClose asChild>
            <button
              type="button"
              className="hover:bg-zsv-neutral-200 rounded p-1 transition-colors"
              onClick={handleClose}
            >
              <Icon type="close" className="text-zsv-neutral-600 h-5 w-5" />
            </button>
          </DialogClose>
        </DialogHeader>

        {/* 内容区域 */}
        <div className="flex-1 overflow-auto p-6">
          {children || (
            <div className="space-y-4">
              {/* 操作按钮 */}
              {activePane?.action && (
                <div className="flex items-center gap-2">
                  {activePane.action}
                </div>
              )}
              {/* Tab 内容 */}
              <div>{activePane?.children}</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

DetailDrawer.displayName = "DetailDrawer";

export default DetailDrawer;
