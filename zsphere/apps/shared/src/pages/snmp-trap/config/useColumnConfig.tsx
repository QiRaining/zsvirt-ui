import { useColumnConfig } from "@zstack/zsphere-engine/src/snmp-trap";
import type { SnmpTrapReceiver } from "@zstack/zsphere-types/graphql";

export default () => {
  return useColumnConfig<SnmpTrapReceiver>([
    {
      key: "snmpPort",
    },
  ]);
};
