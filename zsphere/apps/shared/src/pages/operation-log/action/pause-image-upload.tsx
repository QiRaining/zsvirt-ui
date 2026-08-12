import { DialogP3 } from "@zstack/zsphere-design-biz";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { OperationLongjobStatus } from "@zstack/zsphere-types";
import type { OperationLog } from "@zstack/zsphere-types/graphql";
import React, { useEffect, useMemo } from "react";
import { useIntl } from "react-intl";

import { useOperationLogUploadSessions } from "../upload-session-context";
import { useZsvResume } from "../use-zsv-resume";
import { pauseUploadSession } from "./pause-upload-session";
import { canManuallyContinueUploadJob } from "./upload-action-guards";
import { getAllLongjobs } from "./validators";

interface IProps extends IActionWrapperProps<OperationLog> {
  onVisibleChange: (visible: boolean) => void;
}

const PauseUpload: React.FC<IProps> = ({
  visible,
  setVisible,
  selectedList,
  onVisibleChange,
}) => {
  const intl = useIntl();
  const resume = useZsvResume();

  useEffect(() => {
    onVisibleChange(visible);
  }, [onVisibleChange, visible]);
  const canPauseList = useMemo(() => {
    return selectedList.flatMap((cv) => {
      const uploadControl = resume(cv);
      return getAllLongjobs(cv)
        .filter(
          (job) =>
            job?.longJobUuid && job?.state === OperationLongjobStatus.RUNNING,
        )
        .filter(() => Boolean(uploadControl.getFile?.()))
        .map((job) => ({
          ...cv,
          uuid: job.longJobUuid,
          longjobs: [job],
        }));
    });
  }, [resume, selectedList]);

  const onOk = () => {
    if (canPauseList.length > 0) {
      canPauseList.forEach((ele) => {
        const { getFile } = resume(ele);
        void pauseUploadSession(ele.uuid as string | undefined, getFile());
      });
    }
  };
  if (canPauseList.length === 0) {
    return null;
  }

  return (
    <DialogP3
      onConfirm={onOk}
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "operationLog.modal.title.confirm.pause.task",
        defaultMessage: "Pause Task?",
      })}
      resourceNames={canPauseList.map((it) => it?.name ?? it?.uuid ?? "")}
      bannerMessage={intl.formatMessage({
        id: "longJob.modal.pause.alert.warn",
        defaultMessage: "Some tasks cannot be paused. Only tasks that can be paused are displayed.",
      })}
    />
  );
};

const GoingOnUpload: React.FC<IProps> = ({
  visible,
  setVisible,
  selectedList,
  onVisibleChange,
}) => {
  const intl = useIntl();
  const resume = useZsvResume();
  const { getUploadSession, refreshUploadSessions } =
    useOperationLogUploadSessions();
  useEffect(() => {
    onVisibleChange(visible);
  }, [onVisibleChange, visible]);

  const canGoingOnList = useMemo(() => {
    return selectedList.flatMap((cv) =>
      getAllLongjobs(cv)
        .filter((job) =>
          canManuallyContinueUploadJob(job, getUploadSession(job?.longJobUuid)),
        )
        .map((job) => ({
          ...cv,
          uuid: job.longJobUuid,
          longjobs: [job],
        })),
    );
  }, [getUploadSession, selectedList]);

  const onOk = () => {
    if (canGoingOnList.length > 0) {
      canGoingOnList.forEach((ele) => {
        const { goingOn } = resume(ele);
        goingOn();
      });
      void refreshUploadSessions({ force: true });
    }
  };
  if (canGoingOnList.length === 0) {
    return null;
  }

  return (
    <DialogP3
      onConfirm={onOk}
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "operationLog.modal.title.confirm.goingOn.task",
        defaultMessage: "Continue Task?",
      })}
      resourceNames={canGoingOnList.map((it) => it?.name ?? it?.uuid ?? "")}
      bannerMessage={intl.formatMessage({
        id: "longJob.modal.goingOn.alert.warn",
        defaultMessage: "Some tasks cannot be continued. Only tasks that can be continued are displayed.",
      })}
    />
  );
};

export { PauseUpload, GoingOnUpload };
