import { DocumentNode, useLazyQuery } from "@apollo/client";
import { usePersistFn } from "ahooks";
import { useEffect, useRef, useState } from "react";

interface ResolveSelectedListParams<T> {
  selectedList: T[];
  value?: T[];
  selectType?: "checkbox" | "radio";
  maxSelectedCount?: number;
}

export function limitModalSelectSelectedList<T>(
  selectedList: T[],
  maxSelectedCount = -1,
) {
  return maxSelectedCount === -1
    ? selectedList
    : selectedList.slice(0, maxSelectedCount);
}

export function resolveModalSelectSelectedList<T>({
  selectedList,
  value,
  selectType = "checkbox",
  maxSelectedCount = -1,
}: ResolveSelectedListParams<T>) {
  if (!selectedList?.length && selectType !== "checkbox") {
    return value ?? [];
  }

  return limitModalSelectSelectedList(selectedList ?? [], maxSelectedCount);
}

export function useSelectedList<T>({
  value,
  onChange,
  maxSelectedCount = -1,
  selectType = "checkbox",
  visible,
}: {
  value?: Array<T>;
  selectType?: "checkbox" | "radio";
  onChange?: (v: Array<T>) => void;
  maxSelectedCount?: number;
  visible?: boolean;
  destroyOnClose?: boolean;
}) {
  const [selectedList, setSelectedList] = useState<Array<T>>([]);
  const lastVisibleRef = useRef<boolean>(!!visible);

  const showSelectedCount =
    selectType === "checkbox" && maxSelectedCount !== -1;

  const isOverflowMax = false;
  const isSelectOverflowMax =
    showSelectedCount && selectedList.length >= maxSelectedCount;

  const numericalRatio = showSelectedCount
    ? `（${value?.length ?? 0}/${maxSelectedCount}）`
    : null;

  const newSetSelectList = (_values: Array<T>) => {
    if (maxSelectedCount === -1) {
      setSelectedList(_values);
    } else {
      setSelectedList(limitModalSelectSelectedList(_values, maxSelectedCount));
    }
  };

  const setSelectedListByOk = usePersistFn(() => {
    const newSelectedList = resolveModalSelectSelectedList({
      selectedList,
      value,
      selectType,
      maxSelectedCount,
    });

    onChange?.(newSelectedList);

    setSelectedList([]);

    return newSelectedList;
  });

  const setSelectedListByCancel = usePersistFn(() => {
    setSelectedList([]);
  });

  useEffect(() => {
    // 检测visible从false变为true（弹窗打开）
    const visibleChanged = visible && !lastVisibleRef.current;
    lastVisibleRef.current = !!visible;

    if (visibleChanged) {
      setSelectedList(value ?? []);
    }
  }, [value, visible]);

  return {
    orginOnChange: onChange,
    originSelectedList: value,
    selectedList,
    setSelectedList: newSetSelectList,
    setSelectedListByOk,
    setSelectedListByCancel,
    showSelectedCount,
    isOverflowMax,
    isSelectOverflowMax,
    numericalRatio,
  };
}

export function useAutoSelectQuery({
  autoSelectGql,
}: {
  autoSelectGql: DocumentNode;
  autoSelect: boolean;
}) {
  const [autoSelectItem, setAutoSelectItem] = useState<any[]>();

  const [getAutoSelectItem, result] = useLazyQuery(
    autoSelectGql as DocumentNode,
    {
      fetchPolicy: "no-cache",
    },
  );

  const resultData = (result as any).data;
  useEffect(() => {
    if (resultData) {
      const firstValue = Object.values(resultData)?.[0];
      if (
        firstValue &&
        typeof firstValue === "object" &&
        "list" in firstValue
      ) {
        setAutoSelectItem((firstValue as any).list as any[]);
      } else {
        setAutoSelectItem([]);
      }
    }
  }, [resultData]);

  return {
    autoSelectItem,
    getAutoSelectItem,
  };
}
