import { useActionConfig } from "@zstack/zsphere-engine/src/scsi-lun";
import type { ScsiLun as IScsiLun } from "@zstack/zsphere-types/graphql";

import { verifyMutilSelect, vmNotInCdpTask } from "../action/validator";

export default () => {
  return useActionConfig<IScsiLun>([
    {
      key: "vm.scsi.lun.detach.vm", // 云主机
      preValidators: [verifyMutilSelect, vmNotInCdpTask],
      ActionWrapper: require("../action/detach-scsi-lun-from-vm-modal").default,
    },
  ]);
};
