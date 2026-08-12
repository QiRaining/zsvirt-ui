import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { SchedulerJobGroup } from "@zstack/zsphere-types/graphql";
import { useCallback } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";

const deleteResourceBackupJob = gql`
  mutation deleteResourceBackupJob($input: DeleteResourceBackupJobInput!) {
    deleteResourceBackupJob(input: $input) {
      actionId
    }
  }
`;

export default function Delete({
  position,
  visible,
  setVisible,
  selectedList,
}: IActionWrapperProps<SchedulerJobGroup>) {
  const intl = useIntl();
  const doAction = useAction();
  const navigate = useNavigate();

  const onOk = useCallback(() => {
    doAction({
      mutation: deleteResourceBackupJob,
      payload: selectedList.map((item) => ({ uuid: item.uuid })),
      name: intl.formatMessage({
        id: "delete.backup.policy",
        defaultMessage: "Delete Backup Plan",
      }),
      total: selectedList.length,
      type: "SchedulerJobGroup",
      onFinish: (result) => {
        if (position === "header" && result.success === result.total) {
          navigate(-1);
        }
      },
    });
  }, [doAction, intl, selectedList, position]);

  return (
    <DialogP3
      title={intl.formatMessage({
        id: "backup.policy.delete.title",
        defaultMessage: "Delete Backup Plan?",
      })}
      resourceNames={selectedList.map((r) => r.name)}
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
    />
  );
}
