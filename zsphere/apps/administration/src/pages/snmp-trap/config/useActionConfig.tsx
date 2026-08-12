import { useActionConfig } from "@zstack/zsphere-engine/src/snmp-trap";
import type { SnmpTrapReceiver } from "@zstack/zsphere-types/graphql";
import React from "react";

import { verifyDelete } from "../action/validator";

export default () => {
  return useActionConfig<SnmpTrapReceiver>([
    {
      key: "virtualization.add",
      autoInjectPreValidator: false,
      primary: true,
      ActionWrapper: require("../create").default,
    },
    {
      key: "modify.config",
      ActionWrapper: require("../action/update-modal").default,
    },
    {
      key: "delete",
      validators: [verifyDelete],
      ActionWrapper: require("../action/delete-modal").default,
    },
  ]);
};
