import { Text } from "@zstack/design";
import { useColumnConfig } from "@zstack/zsphere-engine/src/endpoint-sms-address";
import type { EndPointSmsAddress as IEndPointSmsAddress } from "@zstack/zsphere-types/graphql";
import React from "react";

export default () => {
  return useColumnConfig<IEndPointSmsAddress>([
    {
      key: "phoneNumber",
      formatter: (value: IEndPointSmsAddress) => {
        return <Text>{value?.phoneNumber}</Text>;
      },
    },
  ]);
};
