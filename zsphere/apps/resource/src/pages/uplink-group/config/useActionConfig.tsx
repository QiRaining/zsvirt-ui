import { useActionConfig } from "@zstack/zsphere-engine/src/uplink-group";
import { useIntl } from "react-intl";

import {
  verifyIsBond,
  verifyVSwitchIsNotDefault,
  verifyIsSingleInterface,
} from "../action/validator";

export default () => {
  const intl = useIntl();

  return useActionConfig([
    {
      key: "addNic",
      ActionWrapper: require("../action/add-physical-nic").default,
    },
    {
      key: "removeNic",
      validators: [verifyIsBond, verifyIsSingleInterface],
      ActionWrapper: require("../action/remove-physical-nic").default,
      tooltip: ({ selectedList, source }) => {
        if (!verifyIsSingleInterface(selectedList?.[0], source)) {
          return intl.formatMessage({
            id: "uplinkGroup.action.removeNic.num.limit.tooltip",
            defaultMessage: "Cannot Remove. At least one physical port must remain on the host.",
          });
        }
      },
    },
    {
      key: "remove.host.from.bond",
      validators: [verifyVSwitchIsNotDefault],
      ActionWrapper: require("../action/remove-host").default,
      tooltip: ({ selectedList }) => {
        return intl.formatMessage({
          id: "remove.host.from.defaultSwitch",
          defaultMessage: "You cannot disconnect uplink on a default distributed switch.",
        });
      },
    },
  ]);
};
