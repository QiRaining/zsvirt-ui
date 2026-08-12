import { useActionConfig } from "@zstack/zsphere-engine/src/operation-log";

import CancelLogCollect from "../action/cancel-collect-log";
import CancelModal from "../action/cancel-long-job";
import { GoingOnUpload, PauseUpload } from "../action/pause-image-upload";
import { verifyCancel, verifyGoingOn, verifyPause } from "../action/validators";

export default ({
  onVisibleChange,
}: {
  onVisibleChange: (visible: boolean) => void;
}) => {
  return useActionConfig([
    {
      validators: [verifyCancel],
      key: "cancelTask",
      ActionWrapper: (props: any) => {
        return ["CREATE_LOG_COLLECT", "RE_CREATE_LOG_COLLECT"].includes(
          props.selectedList?.[0]?.operationTasks?.[0]?.operationApis?.[0]
            ?.name as string,
        ) ? (
          <CancelLogCollect {...props} onVisibleChange={onVisibleChange} />
        ) : (
          <CancelModal {...props} onVisibleChange={onVisibleChange} />
        );
      },
    },
    {
      validators: [verifyPause],
      key: "suspend",
      ActionWrapper: (props: any) => (
        <PauseUpload {...props} onVisibleChange={onVisibleChange} />
      ),
    },
    {
      key: "goingOn",
      validators: [verifyGoingOn],
      ActionWrapper: (props: any) => (
        <GoingOnUpload {...props} onVisibleChange={onVisibleChange} />
      ),
    },
  ]);
};
