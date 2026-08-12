import { Auth, ConfigProvider } from "@zstack/zsphere-components";
import { useConstantMap } from "@zstack/zsphere-constant";
import { ResizableLayout } from "@zstack/zsphere-design-biz";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { Op } from "@zstack/zsphere-types";
import { bus } from "@zstack/zsphere-utils";
import { memo, useCallback, useMemo } from "react";
import { useIntl } from "react-intl";

import { AlarmNotification } from "./alarm-message";
import { AlarmTabs, TabArrow, TabContent } from "./components";
import { ZSVAction } from "./components/zsv-action";
import { COLLAPSED_HEIGHT, DEFAULT_HEIGHT } from "./constants";
import { useFooterLogic, useFooterState, useOperation } from "./hooks";

export default memo(function Footer() {
  const intl = useIntl();

  // 分开订阅，避免订阅整个 store
  const currentUser = usePlatformStore((state) => state.currentUser) as any;

  const {
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
  } = useFooterState(currentUser);

  const { setCurrentTabAndFilter, onResizeStop, updateResizable } =
    useFooterLogic({
      currentUser,
      currentTab,
      setCurrentTab,
      setLastCurrentTab,
      lastCurrentTab,
      visible,
      setVisible,
      setSize,
      alarmListControllerRef: controllerRefs.alarmListControllerRef,
    });

  const { runnningTaskCount, refetchRunningCount } = useOperation();
  const operationNum = useMemo(() => {
    if (!runnningTaskCount) {
      return null;
    }
    return runnningTaskCount;
  }, [runnningTaskCount]);

  const constant = useConstantMap(intl);

  const tabBarRightExtraContent = useMemo(() => {
    return visible ? <TabContent currentTab={currentTab} intl={intl} /> : null;
  }, [currentTab, intl, visible]);

  const tabBarLeftExtraContent = useMemo(() => {
    return (
      <TabArrow
        visible={visible}
        onToggle={() => updateResizable(visible ? "down" : "up")}
      />
    );
  }, [visible, updateResizable]);

  const platformAlarmMessageDefaultQuery = useMemo(() => {
    return {
      conditions: [
        {
          key: "readStatus",
          op: Op.in,
          values: ["false"],
        },
      ],
      limit: 50,
      start: 0,
    };
  }, []);

  const handleResizingChange = useCallback(
    (isResizing: boolean) => {
      if (isResizing) {
        setSize(undefined);
      }
      setResizing(isResizing);
    },
    [setSize, setResizing],
  );

  const handleResize = useCallback(
    (
      e: MouseEvent | TouchEvent,
      _direction: string,
      _refToElement: HTMLElement,
      _delta: { width: number; height: number },
    ) => {
      bus.emit("TABLE_HEIGHT_CHANGED", e);
    },
    [],
  );

  return (
    <ConfigProvider constant={constant}>
      <Auth
        resource="virtualization.op.alarm"
        type="block"
        authKey="opreation.log.alarm"
      >
        <ResizableLayout
          defaultSize={visible ? DEFAULT_HEIGHT : COLLAPSED_HEIGHT}
          minSize={COLLAPSED_HEIGHT}
          maxSize="50vh"
          direction="vertical"
          resizeEdge="top"
          onResizeStop={onResizeStop}
          onResizingChange={handleResizingChange}
          onResize={handleResize}
          size={size}
          style={{ zIndex: 1000 }}
          disableAutoSave
        >
          <AlarmTabs
            currentTab={currentTab}
            visible={visible}
            tabBarLeftExtraContent={tabBarLeftExtraContent}
            tabBarRightExtraContent={tabBarRightExtraContent}
            operationNum={operationNum}
            platformAlarmMessageDefaultQuery={platformAlarmMessageDefaultQuery}
            controllerRefs={controllerRefs}
            onTabChange={setCurrentTabAndFilter}
            onExpand={() => updateResizable("up")}
            resizing={resizing}
          />
        </ResizableLayout>
      </Auth>
      <ZSVAction refetch={refetchRunningCount} />
      <AlarmNotification />
    </ConfigProvider>
  );
});
