import { useAuthInfoContext, useKeyArr } from "../auth";

export function useTabs() {
  const locationKeyArr = useKeyArr();

  const {
    value: { key, keyArr },
  } = useAuthInfoContext();

  const activeKey = locationKeyArr?.[locationKeyArr?.length - 1];

  return {
    activeKey,
    currentTabPanelKey: key,
    // || 后面的判断原因（比如 tabs 嵌套 detail-nav 组件，且此时 detail-nav 没有点击时）
    equal:
      activeKey === key ||
      ((keyArr?.length ?? 0) > (locationKeyArr?.length ?? 0) &&
        activeKey === keyArr?.[(locationKeyArr?.length ?? 0) - 1]),
  };
}
