import { useQueryConfig as _useQueryConfig } from "@zstack/zsphere-engine/src/baremetal-instance";
import { usePlatformStore } from "@zstack/zsphere-platform-store";

function useQueryConfig({
  defaultQuery,
  view,
}: {
  defaultQuery?: any;
  view?: string;
}) {
  const { currentUser } = usePlatformStore();

  let filteredKeys: string[] | undefined;

  if (view) {
    if (["sub.baremetalInstance.tag"].includes(view)) {
      filteredKeys = ["name", "uuid"];
    }
  }

  const queryProps = {
    defaultQuery,
    resourceType: "BaremetalInstance",
    currentUser,
    filteredKeys,
    needFuzzyQuery: true,
  };

  return _useQueryConfig([], queryProps);
}

export default useQueryConfig;
