import { useState, useEffect, useCallback, useRef, useMemo } from "react";

/**
 * 自定义 useSessionStorageState hook
 * 用于在 sessionStorage 中持久化状态
 */
export function useSessionStorageState<T>(
  key: string,
  defaultValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setStorageState = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const newValue =
          typeof value === "function" ? (value as (prev: T) => T)(prev) : value;
        try {
          sessionStorage.setItem(key, JSON.stringify(newValue));
        } catch {
          // ignore
        }
        return newValue;
      });
    },
    [key],
  );

  return [state, setStorageState];
}

/**
 * 自定义 useSize hook
 * 用于监听元素尺寸变化
 */
export function useSize(
  ref: React.RefObject<HTMLElement | null>,
): { width: number; height: number } | undefined {
  const [size, setSize] = useState<
    { width: number; height: number } | undefined
  >();

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    observer.observe(element);
    // 初始化尺寸
    const { width, height } = element.getBoundingClientRect();
    setSize({ width, height });

    return () => observer.disconnect();
  }, [ref]);

  return size;
}

interface VirtualListOptions<T> {
  overscan?: number;
  itemHeight: number | ((index: number, data?: T) => number);
}

interface VirtualListResult<T> {
  list: Array<{ data: T; index: number }>;
  containerProps: {
    ref: React.RefObject<HTMLDivElement>;
    style: React.CSSProperties;
  };
  wrapperProps: {
    style: React.CSSProperties;
  };
  scrollTo: (index: number) => void;
}

/**
 * 自定义 useVirtualList hook
 * 用于虚拟列表渲染
 */
export function useVirtualList<T>(
  list: T[],
  options: VirtualListOptions<T>,
): VirtualListResult<T> {
  const { overscan = 5, itemHeight } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // 计算单个 item 的高度
  const getItemHeight = useCallback(
    (index: number): number => {
      if (typeof itemHeight === "function") {
        return itemHeight(index, list[index]);
      }
      return itemHeight;
    },
    [itemHeight, list],
  );

  // 计算总高度和每个 item 的位置
  const { totalHeight, itemPositions } = useMemo(() => {
    const positions: number[] = [];
    let total = 0;
    for (let i = 0; i < list.length; i++) {
      positions.push(total);
      total += getItemHeight(i);
    }
    return { totalHeight: total, itemPositions: positions };
  }, [list, getItemHeight]);

  // 计算可见范围
  const { startIndex, endIndex } = useMemo(() => {
    if (containerHeight === 0) {
      return {
        startIndex: 0,
        endIndex: Math.min(overscan * 2, list.length - 1),
      };
    }

    // 二分查找起始索引
    let start = 0;
    let end = list.length - 1;
    while (start < end) {
      const mid = Math.floor((start + end) / 2);
      if (itemPositions[mid] + getItemHeight(mid) < scrollTop) {
        start = mid + 1;
      } else {
        end = mid;
      }
    }

    const visibleStart = Math.max(0, start - overscan);

    // 查找结束索引
    let visibleEnd = start;
    let accHeight = itemPositions[start] - scrollTop;
    while (
      visibleEnd < list.length &&
      accHeight < containerHeight + overscan * getItemHeight(visibleEnd)
    ) {
      accHeight += getItemHeight(visibleEnd);
      visibleEnd++;
    }
    visibleEnd = Math.min(list.length - 1, visibleEnd + overscan);

    return { startIndex: visibleStart, endIndex: visibleEnd };
  }, [
    scrollTop,
    containerHeight,
    list.length,
    itemPositions,
    getItemHeight,
    overscan,
  ]);

  // 监听滚动
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // 监听容器尺寸变化
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    observer.observe(container);
    setContainerHeight(container.clientHeight);

    return () => observer.disconnect();
  }, []);

  // 构建虚拟列表数据
  const virtualList = useMemo(() => {
    const result: Array<{ data: T; index: number }> = [];
    for (let i = startIndex; i <= endIndex && i < list.length; i++) {
      result.push({ data: list[i], index: i });
    }
    return result;
  }, [list, startIndex, endIndex]);

  // wrapper 的 padding，用于定位
  const wrapperStyle = useMemo(
    () => ({
      paddingTop: itemPositions[startIndex] || 0,
      boxSizing: "border-box" as const,
      minHeight: totalHeight,
    }),
    [itemPositions, startIndex, totalHeight],
  );

  const scrollTo = useCallback(
    (index: number) => {
      const container = containerRef.current;
      if (container && itemPositions[index] !== undefined) {
        container.scrollTop = itemPositions[index];
      }
    },
    [itemPositions],
  );

  return {
    list: virtualList,
    containerProps: {
      ref: containerRef,
      style: { overflow: "auto" },
    },
    wrapperProps: {
      style: wrapperStyle,
    },
    scrollTo,
  };
}
