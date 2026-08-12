import { EmergencyLevel } from "@zstack/zsphere-types";

export type AlarmFilterType = "Emergent" | "Important" | "Normal" | "All";

export function createAlarmFilterParams(
  type: AlarmFilterType,
  filterKey = "emergencyLevel",
) {
  return {
    [filterKey]: type === "All" ? [] : [EmergencyLevel[type]],
  };
}
