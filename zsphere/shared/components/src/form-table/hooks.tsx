import { DocumentNode, useLazyQuery } from "@apollo/client";
import { usePersistFn } from "ahooks";
import { useEffect, useState, useMemo } from "react";

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
}) {
  const [selectedList, setSelectedList] = useState<Array<T>>([]);

  // 使用深度比较来稳定 value 引用，避免不必要的重新渲染
  const stableValue = useMemo(() => value, [value]);

  const showSelectedCount =
    selectType === "checkbox" && maxSelectedCount !== -1;
  const isSelectOverflowMax =
    showSelectedCount && (stableValue?.length ?? 0) >= maxSelectedCount;

  const totalSelectedCount = stableValue?.length ?? 0;
  const isOverflowMax =
    showSelectedCount && totalSelectedCount >= maxSelectedCount;

  const numericalRatio = showSelectedCount
    ? `（${stableValue?.length ?? 0}/${maxSelectedCount}）`
    : null;

  const newSetSelectList = usePersistFn((_values: Array<T>) => {
    if (maxSelectedCount === -1) {
      setSelectedList(_values);
    } else {
      const remainingCount = maxSelectedCount - (stableValue?.length ?? 0);
      if (remainingCount > 0) {
        setSelectedList(_values.slice(0, remainingCount));
      } else {
        setSelectedList([]);
      }
    }
  });

  const setSelectedListByOk = usePersistFn(() => {
    if (!selectedList?.length) {
      return stableValue ?? [];
    }

    const existingUuids = new Set(
      (stableValue ?? []).map((item: any) => item.uuid),
    );
    const newItems = selectedList.filter(
      (item: any) => !existingUuids.has(item.uuid),
    );

    const newSelectedList =
      selectType === "checkbox"
        ? [
            ...(stableValue ?? []),
            ...(maxSelectedCount === -1
              ? newItems
              : newItems.slice(
                  0,
                  maxSelectedCount - (stableValue?.length ?? 0),
                )),
          ]
        : selectedList;

    setSelectedList([]);
    return newSelectedList;
  });

  const setSelectedListByCancel = usePersistFn(() => {
    setSelectedList([]);
  });

  useEffect(() => {
    if (visible) setSelectedList(stableValue ?? []);
  }, [visible, stableValue]);

  return {
    orginOnChange: onChange,
    originSelectedList: stableValue,
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

export function useAutoSelectQuery<T>({
  autoSelectGql,
}: {
  autoSelectGql: DocumentNode;
  autoSelect: boolean;
}) {
  const [autoSelectItem, setAutoSelectItem] = useState<any[]>();

  const [getAutoSelectItem, { data: autoSelectItemData }] = useLazyQuery(
    autoSelectGql as DocumentNode,
    {
      fetchPolicy: "no-cache",
    },
  );

  useEffect(() => {
    if (autoSelectItemData) {
      const result = Object.values(autoSelectItemData)?.[0] as any;
      setAutoSelectItem(result?.list as any[]);
    }
  }, [autoSelectItemData]);

  return {
    autoSelectItem,
    getAutoSelectItem,
  };
}
