import { useEffect } from "react";
import { useLocation } from "react-router";

export function useClearSearchConditionCache() {
  const location = useLocation();

  const routeList = ["/virtualization-dashboard"];

  useEffect(() => {
    if (routeList.includes(location.pathname)) {
      const clearList: string[] = [];
      for (const key in sessionStorage) {
        if (Object.prototype.hasOwnProperty.call(sessionStorage, key)) {
          if (key.endsWith("search-conditions")) {
            clearList.push(key);
          }
        }
      }
      clearList.forEach((key) => {
        sessionStorage.removeItem(key);
      });
    }
  }, [location]);
}
