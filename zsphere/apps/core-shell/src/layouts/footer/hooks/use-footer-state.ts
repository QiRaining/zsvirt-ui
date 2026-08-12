import { useLocalStorageState } from "ahooks";
import type { NumberSize } from "re-resizable";
import { useMemo, useRef, useState } from "react";

import { STORAGE_KEYS, TAB_KEYS } from "../constants";
import type { ICurrentUser, TabControllerRefs } from "../types";

export const useFooterState = (currentUser: ICurrentUser) => {
  // 提取 primitive 依赖项，避免对象引用导致的重渲染
  const accountUuid = currentUser?.accountUuid;
  const userUuid = currentUser?.userUuid;
  const username = currentUser?.username;
  const userKey = accountUuid ?? userUuid ?? username ?? "";

  const [resizing, setResizing] = useState<boolean>(false);
  const [size, setSize] = useState<NumberSize | undefined>();

  const storageKeyForVisible = useMemo<string>(
    () => `${STORAGE_KEYS.VISIBLE}.username.${userKey}`,
    [userKey],
  );

  const storageKeyForTab = useMemo<string>(
    () => `${STORAGE_KEYS.TAB}.username.${userKey}`,
    [userKey],
  );

  const storageKeyForLastTab = useMemo<string>(
    () => `${STORAGE_KEYS.LAST_TAB}.username.${userKey}`,
    [userKey],
  );

  const [currentTab, setCurrentTab] = useLocalStorageState<string>(
    storageKeyForTab,
    TAB_KEYS.OPERATION_LOG,
  );

  const [lastCurrentTab, setLastCurrentTab] = useLocalStorageState<string>(
    storageKeyForLastTab,
    TAB_KEYS.OPERATION_LOG,
  );

  const [visible, setVisible] = useLocalStorageState<boolean>(
    storageKeyForVisible,
    false,
  );

  const controllerRefs: TabControllerRefs = {
    alarmListControllerRef: useRef(),
    thirdPartyListControllerRef: useRef(),
  };

  return {
    resizing,
    setResizing,
    size,
    setSize,
    currentTab,
    setCurrentTab,
    lastCurrentTab,
    setLastCurrentTab,
    visible,
    setVisible,
    controllerRefs,
  };
};
