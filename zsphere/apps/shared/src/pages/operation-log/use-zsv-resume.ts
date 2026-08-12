import { openZsvUploadConfirmModal } from "@zstack/zsphere-components";
import { useResume } from "@zstack/zsphere-hooks";

export const useZsvResume = () =>
  useResume({ openConfirmModal: openZsvUploadConfirmModal });
