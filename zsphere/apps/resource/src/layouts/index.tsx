// import { AuthCheck } from "@components/no-permission-page/context"; 后面弄Auth再加
import { ResizableLayout } from "@zstack/zsphere-design-biz";
import cls from "classnames";
import { useState } from "react";
import { Outlet, useLocation } from "react-router";

import ResourceDirMenu from "./directory";

import style from "./style.module.less";

const RESIZABLE_SIZE_KEY = "leftNavWidth";

const DEFAULT_WIDTH = 280;

const ResourceLayout = () => {
  // 使用 useLocation 确保组件在路由变化时重新渲染，从而触发 Outlet 更新
  // 注意：这里必须用 useLocation 而不是 useUrlParamsWatcher，
  // 因为 Outlet 的路由匹配依赖 React Router 内部的 location context，
  // 如果 key 提前变化（通过浏览器 URL），但路由匹配还是旧 location，
  // Outlet 会重新挂载旧路由的组件，导致详情页显示错误。
  const location = useLocation();

  const [resizing, setResizing] = useState(false);

  // 左侧菜单拖动时，手动触发resize事件
  const handleDispatchEvent = () => {
    if (window.dispatchEvent) {
      const event = new Event("resize");
      window.dispatchEvent(event);
    }
  };

  return (
    <div
      className={cls(style.layout, {
        [style["dragger-active"]]: resizing,
      })}
      id="app-root"
    >
      <ResizableLayout
        storageKey={RESIZABLE_SIZE_KEY}
        defaultSize={DEFAULT_WIDTH}
        minSize={200}
        maxSize={600}
        direction="horizontal"
        resizeEdge="right"
        onResizingChange={setResizing}
        onResizeStop={handleDispatchEvent}
      >
        <ResourceDirMenu parentResizing={resizing} />
      </ResizableLayout>
      <div className={style.content} id="layout-content">
        {/*
          只使用 pathname 作为 key，确保：

          - 跨类型切换（vm → host）：pathname 变化 → 重挂载 ✓
          - 同类型切换（VM-A → VM-B）：pathname 不变 → 不重挂载 → 缓存机制生效 ✓
            详情页内部通过 useSearchParams 监听 uuid 变化，
            useMemo(current) 的三级降级（查询数据 > Zustand 缓存 > placeholder）
            提供即时占位数据，避免 Suspense 闪烁，实现丝滑切换。
          - Tab 切换、翻页等操作：pathname 不变 → 不重挂载 ✓

          不要在 key 中包含 search params（包括 uuid），
          否则会破坏同类型资源间的平滑切换体验。
        */}
        <Outlet key={location.pathname} />
      </div>
    </div>
  );
};

export default ResourceLayout;
export { ResourceLayout };
