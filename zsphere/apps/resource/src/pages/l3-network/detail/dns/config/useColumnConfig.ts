import { useColumnConfig } from "@zstack/zsphere-engine/src/dns";
import type { Dns as IDns } from "@zstack/zsphere-types/graphql";

export default () => {
  return useColumnConfig<IDns>([
    {
      key: "ipVersion",
      filters: [
        { text: "IPv4", value: 4 },
        { text: "IPv6", value: 6 },
      ],
      formatter: (current) => (current.dns?.includes(":") ? "IPv6" : "IPv4"),
    },
  ]);
};
