import { useActionConfig } from "@zstack/zsphere-engine/src/iscsi-lun";
import type { IscsiLun as IIscsiLun } from "@zstack/zsphere-types/graphql";

import { verifyDetachVm, verifySingleSelect } from "../action/validator";

export default () => {
  return useActionConfig<IIscsiLun>([
    {
      key: "virtualization.iqn.iscsi.lun.attach.vm",
      preValidators: [verifySingleSelect],
      ActionWrapper:
        require("../action/attach-scsi-lun-to-vm-virtualization-modal").default,
    },
    {
      key: "virtualization.iqn.iscsi.lun.detach.vm",
      preValidators: [verifySingleSelect],
      validators: [verifyDetachVm],
      ActionWrapper:
        require("../action/detach-scsi-lun-from-vm-virtualization-modal")
          .default,
    },
  ]);
};
