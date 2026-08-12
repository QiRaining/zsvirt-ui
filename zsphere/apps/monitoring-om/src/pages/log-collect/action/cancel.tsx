import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { OperationLog } from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import React, { useEffect } from "react";
import { useIntl } from "react-intl";

import { cancelLogCollect } from "../../../gql/collect-log.gql";

interface IProps extends IActionWrapperProps<OperationLog> {
  onVisibleChange: (visible: boolean) => void;
}

const CancelLogCollect: FC<IProps> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
  onVisibleChange,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const uuid = selectedList?.[0]?.operationTasks?.[0].operationApis?.[0]?.apiId;
  const actionUuid = selectedList?.[0]?.operationTasks?.[0].actionId;
  const taskUuid = selectedList?.[0]?.operationTasks?.[0].taskId;

  useEffect(() => {
    onVisibleChange(visible);
  }, [onVisibleChange, visible]);

  const onOk = async () => {
    setVisible?.(false);
    await doAction({
      mutation: cancelLogCollect,
      payload: {
        uuid,
        actionUuid,
        taskUuid,
      },
      name: intl.formatMessage({
        id: "cancel.task",
        defaultMessage: "Cancel Task",
      }),
      total: selectedList.length,
      type: "LogCollect",
      onFinish: () => {
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogP3
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "operationLog.modal.title.confirm.cancel.task",
        defaultMessage: "Cancel Task?",
      })}
      resourceNames={
        selectedList?.map((it) => it?.name ?? it?.uuid ?? "") ?? []
      }
      onConfirm={onOk}
    />
  );
};

export default CancelLogCollect;
