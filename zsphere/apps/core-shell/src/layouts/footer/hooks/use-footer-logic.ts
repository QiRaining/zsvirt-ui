import { Identity } from "@zstack/zsphere-types";
import { useCallback, useEffect } from "react";

import { PREDEFINED_OTHER_UUID, SodRoleMap } from "../../../layouts/constant";
import { COLLAPSED_HEIGHT, DEFAULT_HEIGHT, TAB_KEYS } from "../constants";

interface UseFooterLogicProps {
  currentUser: any;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  setLastCurrentTab: (tab: string) => void;
  lastCurrentTab: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  setSize: (size: any) => void;
  alarmListControllerRef: React.MutableRefObject<any>;
}

export const useFooterLogic = ({
  currentUser,
  currentTab,
  setCurrentTab,
  setLastCurrentTab,
  lastCurrentTab,
  visible: _visible,
  setVisible,
  setSize,
  alarmListControllerRef,
}: UseFooterLogicProps) => {
  // 处理三员的情况
  const validRole = currentUser?.IAM1?.systemRoles?.find(
    (role: { uuid: string }) => role.uuid !== PREDEFINED_OTHER_UUID,
  );

  const sodRole = validRole?.uuid ? SodRoleMap[validRole.uuid] : undefined;

  useEffect(() => {
    if (sodRole === Identity.IAM1SystemAdmin) {
      setCurrentTab(TAB_KEYS.ALARM_MESSAGE);
      setLastCurrentTab(TAB_KEYS.ALARM_MESSAGE);
    } else if (sodRole === Identity.IAM1AuditAdmin) {
      setCurrentTab(TAB_KEYS.OPERATION_LOG);
      setLastCurrentTab(TAB_KEYS.OPERATION_LOG);
    }
  }, [sodRole, setCurrentTab, setLastCurrentTab]);

  const setCurrentTabAndFilter = useCallback(
    (tab: string) => {
      setCurrentTab(tab);
      if (tab !== TAB_KEYS.ALARM_MESSAGE && tab !== currentTab) {
        alarmListControllerRef.current?.filter({
          alarmMessage: [],
          emergencyLevel: [],
        });
      }
    },
    [currentTab, setCurrentTab, alarmListControllerRef],
  );

  const onResizeStop = useCallback(
    (e: any, direction: any, resizeWrapper: HTMLElement) => {
      setVisible(resizeWrapper.clientHeight > COLLAPSED_HEIGHT);
      setLastCurrentTab(currentTab);

      if (resizeWrapper.clientHeight <= COLLAPSED_HEIGHT) {
        setCurrentTabAndFilter(TAB_KEYS.UNEXISTED_TAB);
      } else if (currentTab === TAB_KEYS.UNEXISTED_TAB) {
        setCurrentTabAndFilter(lastCurrentTab);
      }
    },
    [
      currentTab,
      lastCurrentTab,
      setCurrentTab,
      setLastCurrentTab,
      setVisible,
      setCurrentTabAndFilter,
    ],
  );

  const updateResizable = useCallback(
    (type: "up" | "down") => {
      setVisible(type === "up");
      setSize({
        width: undefined,
        height: type === "down" ? COLLAPSED_HEIGHT : DEFAULT_HEIGHT,
      });
      if (type === "down") {
        setLastCurrentTab(currentTab);
      }
      setCurrentTabAndFilter(
        type === "down" ? TAB_KEYS.UNEXISTED_TAB : lastCurrentTab,
      );
    },
    [
      currentTab,
      lastCurrentTab,
      setCurrentTab,
      setLastCurrentTab,
      setVisible,
      setSize,
      setCurrentTabAndFilter,
    ],
  );

  return {
    sodRole,
    setCurrentTabAndFilter,
    onResizeStop,
    updateResizable,
  };
};
