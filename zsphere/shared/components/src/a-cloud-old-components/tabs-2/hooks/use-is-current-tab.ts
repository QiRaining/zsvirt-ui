import { useLocation } from "react-router";
import { useShallow } from "zustand/react/shallow";

import { usePageStateStore } from "../store/page-state-store";

export const useIsCurrentTab = (contentId: string, tabKey: string) => {
  const [tabMemo] = usePageStateStore(useShallow((state) => [state.tabMemo]));
  const location = useLocation();
  const { pathname } = location;
  return tabMemo?.[pathname]?.[contentId] === tabKey;
};
