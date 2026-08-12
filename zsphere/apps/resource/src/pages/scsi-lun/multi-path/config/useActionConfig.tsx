import { useActionConfig } from "@zstack/zsphere-engine/src/scsi-lun";
import type { ScsiLun as IScsiLun } from "@zstack/zsphere-types/graphql";

export default () => {
  return useActionConfig<IScsiLun>([]);
};
