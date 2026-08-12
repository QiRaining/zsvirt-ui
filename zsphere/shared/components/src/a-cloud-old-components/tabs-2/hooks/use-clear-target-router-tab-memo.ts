export const useClearTargetRouterTabMemo = () => {
  const clearTargetRouterTabMemo = () => {
    window.needClearTab = true;
  };
  return { clearTargetRouterTabMemo };
};
