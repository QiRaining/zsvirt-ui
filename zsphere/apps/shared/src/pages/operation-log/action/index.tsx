import { Action } from "@zstack/zsphere-components";
import type { IActionProps } from "@zstack/zsphere-types";
import type { OperationLog } from "@zstack/zsphere-types/graphql";
import React, { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";

import CancelModal from "./cancel-long-job";
import { cancelLocalUploadSessions } from "./cancel-upload-session";
import { PauseUpload, GoingOnUpload } from "./pause-image-upload";
import { verifyCancel, verifyPause, verifyGoingOn } from "./validators";
import { useZsvResume } from "../use-zsv-resume";

interface IProps extends IActionProps<OperationLog> {
  onVisibleChange: (visible: boolean) => void;
}

const OperationLongjobAction: React.FC<IProps> = ({
  view,
  position,
  selectedList,
  setSelectedList,
  refetch,
  onVisibleChange,
}) => {
  const intl = useIntl();
  const getUploadControl = useZsvResume();
  const onBeforeCancelLongJobs = useCallback(
    (operationLogs: OperationLog[]) => {
      cancelLocalUploadSessions(operationLogs, getUploadControl);
    },
    [getUploadControl],
  );

  const menuList = useMemo(
    () => [
      {
        key: "cancel",
        name: intl.formatMessage({ id: "cancel.task", defaultMessage: "Cancel Task" }),
        ActionWrapper: (props: any) => (
          <CancelModal
            {...props}
            onVisibleChange={onVisibleChange}
            onBeforeCancelLongJobs={onBeforeCancelLongJobs}
          />
        ),
        validators: [verifyCancel],
      },
      {
        key: "pause",
        name: intl.formatMessage({ id: "parse.task", defaultMessage: "Pause" }),
        ActionWrapper: (props: any) => (
          <PauseUpload {...props} onVisibleChange={onVisibleChange} />
        ),
        validators: [verifyPause],
      },
      {
        key: "goingOn",
        name: intl.formatMessage({
          id: "goingOn.task",
          defaultMessage: "Continue",
        }),
        ActionWrapper: (props) => (
          <GoingOnUpload {...props} onVisibleChange={onVisibleChange} />
        ),
        validators: [verifyGoingOn],
      },
    ],
    [intl, onBeforeCancelLongJobs, onVisibleChange],
  );

  return (
    <div className="flex items-center gap-2">
      <Action
        view={view}
        refetch={refetch}
        menuList={menuList as any}
        position={position}
        selectedList={selectedList}
        resource="operation.log"
        setSelectedList={setSelectedList as any}
      />
    </div>
  );
};

export default OperationLongjobAction;
