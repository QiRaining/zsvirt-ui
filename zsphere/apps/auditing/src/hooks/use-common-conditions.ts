import { Op } from "@zstack/zsphere-types";

export const useCommonConditions = () => {
  return [
    {
      key: "__AuditType__",
      op: Op.eq,
      value: "Resource",
    },
    {
      key: "__SliceRangeIndex__",
      op: Op.eq,
      value: 1,
    },
  ];
};
