import { useMemo, useState, useEffect } from "react";

// 定义响应式断点
const BREAKPOINTS = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
};

interface ResponsiveInfo {
  sm: boolean;
  md: boolean;
  lg: boolean;
  xl: boolean;
}

// 自定义 useResponsive hook 实现
function useResponsive(): ResponsiveInfo {
  const [responsive, setResponsive] = useState<ResponsiveInfo>({
    sm: false,
    md: false,
    lg: false,
    xl: false,
  });

  useEffect(() => {
    // 更新响应式状态
    const updateResponsive = () => {
      const width = window.innerWidth;
      setResponsive({
        sm: width >= BREAKPOINTS.sm,
        md: width >= BREAKPOINTS.md,
        lg: width >= BREAKPOINTS.lg,
        xl: width >= BREAKPOINTS.xl,
      });
    };

    // 初始化
    updateResponsive();

    // 监听窗口大小变化
    window.addEventListener("resize", updateResponsive);

    // 清理监听器
    return () => {
      window.removeEventListener("resize", updateResponsive);
    };
  }, []);

  return responsive;
}

function getColNum(breakpoint: ResponsiveInfo): number {
  if (breakpoint.xl) {
    return 6;
  }
  if (breakpoint.lg) {
    return 4;
  }
  return 3;
}

function getResponseList<T>(list: Array<T> = [], count: number) {
  const newList = [];
  let startIndex = 0;
  while (startIndex < list.length) {
    const endIndex = startIndex + count;
    newList.push(list.slice(startIndex, endIndex));
    startIndex += count;
  }
  return newList;
}

export function useResponseList<T>(list: Array<T> = []): [T[][], number] {
  const breakpoint = useResponsive();
  return useMemo(() => {
    const colNum: number = getColNum(breakpoint);
    const newList = getResponseList(list, colNum);
    return [newList, colNum];
  }, [breakpoint, list]);
}
