import { useEffect, useState } from "react";

interface UseContainerOptions {
  id: string;
  zIndex: number;
  visible: boolean;
  disableContainer?: boolean; // 是否禁用独立容器（某些场景下可能不需要）
}

/**
 * useContainer - 自动管理弹窗的挂载容器
 *
 * 为每个弹窗创建独立的 DOM 容器，避免样式污染和 z-index 冲突
 *
 * 用法：
 * ```tsx
 * const MyDialog = ({ open }) => {
 *   const { zIndex, overlayId } = useOverlay({ type: 'dialog', open });
 *   const container = useContainer({ id: overlayId, zIndex, visible: open });
 *
 *   return createPortal(<DialogContent />, container);
 * };
 * ```
 *
 * @param options - 配置项
 * @param options.id - 弹窗唯一标识
 * @param options.zIndex - z-index 值
 * @param options.visible - 是否可见
 * @param options.disableContainer - 是否禁用独立容器
 * @returns {HTMLElement} 挂载容器
 */
export function useContainer(options: UseContainerOptions): HTMLElement {
  const { id, zIndex, visible, disableContainer = false } = options;
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // SSR 环境检查
    if (typeof window === "undefined") {
      return;
    }

    // 如果不可见或禁用容器，直接使用 body
    if (!visible || disableContainer) {
      setContainer(document.body);
      return;
    }

    // 创建独立容器
    const containerId = `overlay-container-${id}`;
    let containerElement = document.getElementById(
      containerId,
    ) as HTMLElement | null;

    if (!containerElement) {
      containerElement = document.createElement("div");
      containerElement.id = containerId;
      containerElement.style.position = "relative";
      containerElement.style.zIndex = String(zIndex);
      document.body.appendChild(containerElement);
    } else {
      // 更新已有容器的 z-index
      containerElement.style.zIndex = String(zIndex);
    }

    setContainer(containerElement);

    return () => {
      // 清理容器
      if (containerElement && containerElement.parentNode) {
        // 延迟删除，避免动画还没结束就移除了 DOM
        setTimeout(() => {
          if (containerElement && containerElement.parentNode) {
            containerElement.parentNode.removeChild(containerElement);
          }
        }, 300); // 与动画时长匹配
      }
    };
  }, [id, zIndex, visible, disableContainer]);

  return (
    container ?? (typeof window !== "undefined" ? document.body : (null as any))
  );
}
