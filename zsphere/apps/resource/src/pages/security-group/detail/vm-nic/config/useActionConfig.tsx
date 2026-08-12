import { useActionConfig } from "@zstack/zsphere-engine/src/vm-nic";
import type { SecurityGroup, VmNic } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import UnBindModal from "../action/unbind";

export default (param: { zoneUuid?: string } = {}) => {
  const intl = useIntl();

  const actionConfigs = useActionConfig<VmNic>([
    {
      key: "bind.nic",
      name: intl.formatMessage({
        id: "sg.bind.vmNic",
        defaultMessage: "Associate VM NIC",
      }),
      ActionWrapper: (props) => {
        const { source, ...other } = props;
        const BindModal = require("../action/bind").default;
        return (
          <BindModal
            {...other}
            source={source as SecurityGroup}
            securityGroupUuid={(source as SecurityGroup)?.uuid}
            zoneUuid={param.zoneUuid}
          />
        );
      },
      autoInjectPreValidator: false,
    },
    {
      key: "unbind.nic",
      name: intl.formatMessage({
        id: "sg.unbind.vmNic",
        defaultMessage: "Disassociate VM NIC",
      }),
      ActionWrapper: (props) => (
        <UnBindModal
          {...props}
          securityGroup={props?.source as SecurityGroup}
        />
      ),
    },
  ]);

  return {
    ...actionConfigs,
    getItemName: (nic: VmNic) => nic?.internalName,
  };
};
