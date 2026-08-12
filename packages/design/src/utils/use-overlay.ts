import { useEffect, useId, useLayoutEffect, useState } from "react";

import { useOverlayContext } from "./overlay-context";

interface UseOverlayOptions {
  type: "dialog" | "drawer" | "popover" | "tooltip" | "toast";
  open?: boolean; // 是否打开
  customZIndex?: number; // 允许手动覆盖（渐进式迁移，向后兼容）
}

interface UseOverlayResult {
  zIndex: number;
  isTop: boolean;
  overlayId: string;
}

/**
 * useOverlay - 自动管理弹窗的 z-index
 *
 * 用法：
 * ```tsx
 * const MyDialog = ({ open }) => {
 *   const { zIndex, isTop } = useOverlay({ type: 'dialog', open });
 *
 *   return (
 *     <DialogContent style={{ zIndex }}>
 *       {isTop && <div>我是最顶层</div>}
 *     </DialogContent>
 *   );
 * };
 * ```
 *
 * @param options - 配置项
 * @param options.type - 弹窗类型
 * @param options.open - 是否打开（默认 false）
 * @param options.customZIndex - 自定义 z-index（覆盖自动计算的值）
 * @returns {UseOverlayResult} z-index 和相关状态
 */
export function useOverlay(options: UseOverlayOptions): UseOverlayResult {
  const { type, open = false, customZIndex } = options;
  const context = useOverlayContext();
  const id = useId();

  // 使用 lazy initialization 在首次渲染时立即计算 z-index
  const [state, setState] = useState(() => {
    if (!open) {
      return { zIndex: 1000, isTop: false, registered: false };
    }

    if (customZIndex !== undefined) {
      return { zIndex: customZIndex, isTop: false, registered: false };
    }

    // 首次渲染时同步注册
    const calculatedZIndex = context.register(id, type);
    return {
      zIndex: calculatedZIndex,
      isTop: context.isTop(id),
      registered: true,
    };
  });

  const { zIndex, isTop, registered } = state;

  // 使用 useLayoutEffect 在 DOM 更新前同步处理状态变化
  useLayoutEffect(() => {
    if (open) {
      if (customZIndex !== undefined && zIndex !== customZIndex) {
        setState({ zIndex: customZIndex, isTop: false, registered: false });
      } else if (!registered && customZIndex === undefined) {
        const calculatedZIndex = context.register(id, type);
        setState({
          zIndex: calculatedZIndex,
          isTop: context.isTop(id),
          registered: true,
        });
      }
    } else if (registered) {
      // 关闭时注销
      context.unregister(id);
      setState({ zIndex: 1000, isTop: false, registered: false });
    }
  }, [open, id, type, context, customZIndex, zIndex, registered]);

  // 清理：组件卸载时注销
  useEffect(() => {
    return () => {
      if (registered) {
        context.unregister(id);
      }
    };
  }, [id, context, registered]);

  return {
    zIndex,
    isTop,
    overlayId: id,
  };
}
