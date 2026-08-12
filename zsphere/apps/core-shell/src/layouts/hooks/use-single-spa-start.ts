import { useMount } from "ahooks";
import { getMountedApps, start as singleSpaStart } from "single-spa";

export function useSingleSpaStart() {
  useMount(() => {
    // when none app mounted single-spa is not start,navigateToUrl will be invalid
    const appNames = getMountedApps();
    if (!appNames?.length) {
      singleSpaStart();
    }
  });
}
