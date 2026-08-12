import { usePersistFn } from "ahooks";
import { useEffect, useState } from "react";

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

  const showSelectedCount =
    selectType === "checkbox" && maxSelectedCount !== -1;

  const isOverflowMax =
    showSelectedCount && (value?.length ?? 0) >= maxSelectedCount;

  const numericalRatio = showSelectedCount
    ? `（${value?.length ?? 0}/${maxSelectedCount}）`
    : null;

  const setSelectedListByOk = usePersistFn(() => {
    if (!selectedList?.length) {
      return value ?? [];
    }

    const newSelectedList =
      selectType === "checkbox"
        ? [
            ...(maxSelectedCount === -1
              ? selectedList
              : selectedList.slice(0, maxSelectedCount - (value?.length ?? 0))),
          ]
        : selectedList;

    onChange?.(newSelectedList);

    setSelectedList([]);

    return newSelectedList;
  });

  const setSelectedListByCancel = usePersistFn(() => {
    setSelectedList([]);
  });

  useEffect(() => {
    if (visible) {
      setSelectedList(value ?? []);
    }
  }, [value, visible]);

  return {
    orginOnChange: onChange,
    originSelectedList: value,
    selectedList,
    setSelectedList,
    setSelectedListByOk,
    setSelectedListByCancel,
    showSelectedCount,
    isOverflowMax,
    numericalRatio,
  };
}
