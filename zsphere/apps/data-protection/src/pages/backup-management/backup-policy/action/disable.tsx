import { gql } from "@apollo/client";
import { DialogP1 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { SchedulerJobGroupState } from "@zstack/zsphere-types";
import type { SchedulerJobGroup } from "@zstack/zsphere-types/graphql";
import { useCallback } from "react";
import { useIntl } from "react-intl";

const changeSchedulerJobGroupBasicInfo = gql`
  mutation changeSchedulerJobGroupBasicInfo(
    $input: ChangeSchedulerJobGroupBasicInfoInput!
  ) {
    changeSchedulerJobGroupBasicInfo(input: $input) {
      actionId
    }
  }
`;

// FIXME
const isDefaultDatabase = false;

export default function Disable({
  visible,
  setVisible,
  selectedList,
}: IActionWrapperProps<SchedulerJobGroup>) {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = useCallback(() => {
    const payload = selectedList.map((item) => ({
      uuid: item.uuid,
      state: SchedulerJobGroupState.Disabled,
    }));
    doAction({
      mutation: changeSchedulerJobGroupBasicInfo,
      payload,
      name: intl.formatMessage({
        id: "disable.backup.policy",
        defaultMessage: "Disable Backup Plan",
      }),
      total: selectedList.length,
      type: "SchedulerJobGroup",
    });
  }, [doAction, intl, selectedList]);

  return (
    <DialogP1
      title={intl.formatMessage({
        id: "backup.policy.disable.title",
        defaultMessage: "Disable Backup Plan?",
      })}
      resourceType={intl.formatMessage({
        id: "backup.policy",
        defaultMessage: "Backup Plan",
      })}
      bannerMessage={
        isDefaultDatabase
          ? intl.formatMessage({
              id: "backup.policy.default.platform.database.disable.alert",
              defaultMessage:
                "Disabling the default backup plan for platform database stops automatic backups. This action poses a data security risk. Proceed with caution.",
            })
          : undefined
      }
      resourceNames={selectedList.map((r) => r.name)}
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
    />
  );
}
