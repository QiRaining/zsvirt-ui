import { useColumnConfig } from "@zstack/zsphere-engine/src/nvme-namespace";
import { formatStorage } from "@zstack/zsphere-utils";

export default () => {
  return useColumnConfig([
    {
      key: "capacity",
      formatter: ({ size = 0 }) => formatStorage(size, 2),
    },
  ]);
};
