import { useResponsive } from "ahooks";
import { useMemo } from "react";

interface ResponsiveInfo {
  sm: boolean;
  md: boolean;
  lg: boolean;
  xl: boolean;
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

export default function useResponseList<T>(
  list: Array<T> = [],
): [T[][], number] {
  const breakpoint: any = useResponsive();
  return useMemo(() => {
    const colNum: number = getColNum(breakpoint);
    const newList = getResponseList(list, colNum);
    return [newList, colNum];
  }, [breakpoint, list]);
}
