import { gql } from "@apollo/client";
import { useActionConfig } from "@zstack/zsphere-engine/src/backup-job";
import { useAction } from "@zstack/zsphere-hooks";
import {
  SchedulerJobGroupState,
  SchedulerJobGroupType,
} from "@zstack/zsphere-types";
import type { SchedulerJobGroup } from "@zstack/zsphere-types/graphql";
import { bus } from "@zstack/zsphere-utils";
import { useIntl } from "react-intl";

import {
  verifyDisabledSchedulerJobGroup,
  verifyEnableSchedulerJobGroup,
  verifyMultiSelect,
  verifySingleSelect,
  verifyTriggerNow,
} from "../action/validator";

const changeSchedulerJobGroupBasicInfo = gql`
  mutation changeSchedulerJobGroupBasicInfo(
    $input: ChangeSchedulerJobGroupBasicInfoInput!
  ) {
    changeSchedulerJobGroupBasicInfo(input: $input) {
      actionId
    }
  }
`;

const runSchedulerTrigger = gql`
  mutation runSchedulerTrigger($input: RunSchedulerTriggerInput!) {
    runSchedulerTrigger(input: $input) {
      actionId
    }
  }
`;

export default () => {
  const intl = useIntl();
  const doAction = useAction();
  return useActionConfig<SchedulerJobGroup>([
    {
      key: "create",
      primary: true,
      autoInjectPreValidator: false,
      ActionWrapper: require("../action/create").default,
    },
    {
      key: "delete",
      preValidators: [verifyMultiSelect],
      ActionWrapper: require("../action/delete").default,
    },
    {
      key: "disable",
      preValidators: [verifyMultiSelect],
      validators: [verifyDisabledSchedulerJobGroup],
      ActionWrapper: require("../action/disable").default,
    },
    {
      key: "enable",
      preValidators: [verifyMultiSelect],
      validators: [verifyEnableSchedulerJobGroup],
      onClick: ({ selectedList }) => {
        const payload = selectedList.map((item) => ({
          uuid: item.uuid,
          state: SchedulerJobGroupState.Enabled,
        }));
        doAction({
          mutation: changeSchedulerJobGroupBasicInfo,
          payload,
          name: intl.formatMessage({
            id: "enable.backup.policy",
            defaultMessage: "Enable Backup Plan",
          }),
          total: selectedList.length,
          type: "SchedulerJobGroup",
        });
      },
    },
    {
      key: "editNameDesc",
      ActionWrapper: require("../action/edit-name-desc").default,
    },
    {
      key: "triggerNow",
      preValidators: [verifySingleSelect],
      validators: [verifyTriggerNow],
      ActionWrapper: require("../action/trigger-now").default,
      onClick: ({ selectedList }) => {
        const current = selectedList[0];
        if (current?.jobType === SchedulerJobGroupType.databaseBackup) {
          const payload = {
            uuid: current?.triggersUuid?.[0],
          };
          doAction({
            mutation: runSchedulerTrigger,
            payload: [payload],
            name: intl.formatMessage({
              id: "backup.policy.trigger.now.title",
              defaultMessage: "Backup Now",
            }),
            total: 1,
            type: "SchedulerJobGroup",
            onFinish: () => {
              bus.emit("action:refetch:SchedulerJobHistory");
            },
          });
        }
      },
    },
    {
      key: "editBasicConfig",
      preValidators: [verifySingleSelect],
      ActionWrapper: require("../action/edit-basic-config").default,
    },
    {
      key: "editBackupPolicy",
      preValidators: [verifySingleSelect],
      ActionWrapper: require("../action/edit-backup-policy").default,
    },
  ]);
};
