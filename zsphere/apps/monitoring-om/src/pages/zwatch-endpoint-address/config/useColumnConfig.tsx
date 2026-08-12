import { Text } from "@zstack/design";
import { useColumnConfig } from "@zstack/zsphere-engine/src/endpoint-email-address";
import type { EndPointEmailAddress as IEndPointEmailAddress } from "@zstack/zsphere-types/graphql";
import React from "react";

export default () => {
  return useColumnConfig<IEndPointEmailAddress>([
    {
      key: "emailAddress",
      formatter: (value: IEndPointEmailAddress) => {
        return <Text>{value?.emailAddress}</Text>;
      },
    },
  ]);
};
