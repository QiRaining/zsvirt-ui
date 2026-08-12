import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { SchedulerJobStateEvent } from "@zstack/zsphere-types";
import type { VmInstance } from "@zstack/zsphere-types/graphql";
import React, { useCallback } from "react";
import { useIntl } from "react-intl";

const changeSchedulerJobState = gql`
  mutation changeSchedulerJobState($input: ChangeSchedulerJobStateInput!) {
    changeSchedulerJobState(input: $input) {
      actionId
    }
  }
`;

export default function Disable({
  visible,
  setVisible,
  selectedList,
}: IActionWrapperProps<VmInstance>) {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = useCallback(() => {
    const payload = selectedList.map((item) => ({
      uuid: item.backupJob?.uuid,
      stateEvent: SchedulerJobStateEvent.disable,
    }));
    doAction({
      mutation: changeSchedulerJobState,
      payload,
      name: intl.formatMessage({
        id: "disable.backup.job",
        defaultMessage: "Disable Backup Task",
      }),
      total: selectedList.length,
      type: "VmInstance",
    });
  }, [doAction, intl, selectedList]);

  return (
    <DialogP3
      title={intl.formatMessage({
        id: "backup.job.disable.title",
        defaultMessage: "Disable Backup Job?",
      })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      resourceType={intl.formatMessage({
        id: "backup.job",
        defaultMessage: "Backup Job",
      })}
      visible={visible}
      setVisible={setVisible}
      onConfirm={() => {
        onOk();
      }}
    />
  );
}
