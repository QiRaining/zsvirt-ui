import { ZWatchAlarmQueryType } from "@zstack/zsphere-types";
import List from "zsv_shared/zwatch-alarm/resource/list";

import useComponentMap from "./detail/useComponentMap";

export default function ResourceList() {
  const source = useComponentMap();
  return (
    <List
      view="main.virtualization"
      defaultQuery={{
        type: ZWatchAlarmQueryType.Resource,
      }}
      source={source}
    />
  );
}
