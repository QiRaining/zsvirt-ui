import { useActionConfig } from "@zstack/zsphere-engine/src/host-kernel-interface";
import { useIntl } from "react-intl";

import { validateDeletion } from "../action/validators";

export default () => {
  const intl = useIntl();
  return useActionConfig([
    {
      key: "virtualization.zskernel.create",
      autoInjectPreValidator: false,
      ActionWrapper: require("../create").default,
    },
    {
      key: "virtualization.zskernel.delete",
      ActionWrapper: require("../action/delete").default,
      validators: [validateDeletion],
      tooltipPlacement: "top",
      tooltip: ({ selectedList }) => {
        if (!selectedList?.length) {
          return null;
        }
        return {
          title: intl.formatMessage({
            id: "hostKernelInterface.action.delete.tooltip",
            defaultMessage: "You cannot delete a default Kernel adapter.",
          }),
        };
      },
    },
    {
      key: "virtualization.zskernel.edit.config",
      ActionWrapper: require("../action/edit-config").default,
    },
    {
      key: "virtualization.zskernel.edit.nameAndDescription",
      ActionWrapper: require("../action/edit-name-desc").default,
    },
  ]);
};
