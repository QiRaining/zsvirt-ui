import { useTabStore } from "./use-store";

// 用pathname作为key在localstorage记录tab的value值
// contentId 区分同一pathname下的不同选项
export function useTabPersist(contentId: string) {
  const [tabStore, setTabStore] = useTabStore((state) => [
    state.tabStore,
    state.setTabStore,
  ]);
  const pathname =
    typeof window !== "undefined" ? window?.location.pathname : "Unknown";

  // 若无tabMemo[pathname]则先设置一个空对象
  // 否则无法访问 tabMemo[pathname][contetnId]
  if (!tabStore[pathname]) {
    setTabStore(pathname);
  }
  // 初次访问默认第一项
  if (!tabStore[pathname][contentId]) {
    setTabStore(pathname, contentId, contentId);
  }

  // 取数据
  const getValue = () => {
    return tabStore[pathname][contentId]
      ? tabStore[pathname][contentId]
      : contentId;
  };
  // 存数据
  const onChange = (value: string) => {
    setTabStore(pathname, contentId, value);
  };
  return { getValue, onChange };
}
