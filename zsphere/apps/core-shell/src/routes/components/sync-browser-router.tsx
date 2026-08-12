/**
 * 同步 BrowserRouter — 不使用 React.startTransition 包裹 location 状态更新。
 *
 * ## 背景
 * React Router v7 的 BrowserRouter 默认将 history.listen 回调包裹在
 * React.startTransition 中。当子路由中使用 useSuspenseQuery 时，
 * Suspense 会导致 transition 持续 pending，useLocation() 返回旧值，
 * 树的 selectedKey 和详情页 Outlet 都无法正确更新。
 *
 * ## 实现方式
 * 从 react-router v7.9.0 起，官方 BrowserRouter 新增了 `unstable_useTransitions`
 * prop。设为 false 时行为等价于本组件之前的手动实现（同步 setState，不走 startTransition）。
 * 现已切换为直接使用官方 BrowserRouter + unstable_useTransitions={false}，
 * 避免依赖 UNSAFE_createBrowserHistory 内部 API。
 *
 * ## 依赖版本
 * - react-router: 7.12.0（pnpm catalog）
 * - unstable_useTransitions prop 自 v7.9.0 起可用
 *
 * ## 风险评估
 * - 风险等级：低
 * - `unstable_useTransitions` 虽带 unstable_ 前缀，但它是官方公开导出的 prop，
 *   且行为清晰（控制是否使用 startTransition），比 UNSAFE_ 内部 API 稳定得多。
 * - 如果未来 React Router 将此 prop 稳定化（去掉 unstable_ 前缀），
 *   只需做简单的 prop 重命名即可。
 * - 如果该 prop 被移除，回退方案是恢复使用 UNSAFE_createBrowserHistory 手动实现。
 *
 * @see https://github.com/remix-run/react-router/releases — 关注 unstable_useTransitions 的稳定化
 */
import React from "react";
import { BrowserRouter } from "react-router";

interface SyncBrowserRouterProps {
  basename?: string;
  children?: React.ReactNode;
  window?: Window;
}

export function SyncBrowserRouter({
  basename,
  children,
  window: windowProp,
}: SyncBrowserRouterProps) {
  return (
    <BrowserRouter
      basename={basename}
      unstable_useTransitions={false}
      window={windowProp}
    >
      {children}
    </BrowserRouter>
  );
}
