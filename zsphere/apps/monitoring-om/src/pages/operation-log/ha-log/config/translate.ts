import { SchedTypes } from "@zstack/zsphere-types";

export const translateSchedTypes = (intl: any, type: SchedTypes) => {
  const map = {
    [SchedTypes.VMHA]: intl.formatMessage({
      id: "zsv.schedTypes.vmha",
      defaultMessage: "High Availability Recovery of Virtual Machines",
    }),
    [SchedTypes.HMT]: intl.formatMessage({
      id: "zsv.schedTypes.hmt",
      defaultMessage: "Host Maintenance",
    }),
  };
  return map?.[type];
};
