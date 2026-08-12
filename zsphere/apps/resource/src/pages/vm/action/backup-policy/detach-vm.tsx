import { gql, useLazyQuery } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  VmInstance,
  SchedulerJobGroup,
} from "@zstack/zsphere-types/graphql";
import React, { useCallback } from "react";
import { useIntl } from "react-intl";

const schedulerJobGroupList = gql`
  query schedulerJobGroupList(
    $type: SchedulerJobGroupQueryType
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $extraConditions: [Condition!]
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    schedulerJobGroupList(
      type: $type
      start: $start
      limit: $limit
      replyWithCount: true
      conditions: $conditions
      extraConditions: $extraConditions
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      total
      list {
        ...schedulerJobGroupFields
      }
    }
  }
`;

const removeResourceFromBackupJob = gql`
  mutation removeResourceFromBackupJob(
    $input: RemoveResourceFromBackupJobInput!
  ) {
    removeResourceFromBackupJob(input: $input) {
      actionId
    }
  }
`;

export default function DetachVm({
  visible,
  setVisible,
  selectedList,
  source,
}: IActionWrapperProps<VmInstance, SchedulerJobGroup>) {
  const intl = useIntl();
  const doAction = useAction();

  const [refreshVmCount] = useLazyQuery(schedulerJobGroupList, {
    variables: {
      conditions: [{ key: "uuid", value: source?.uuid ?? "", op: Op.eq }],
    },
  });

  const onOk = useCallback(() => {
    const payload = {
      resourceUuids: selectedList.map((item) => item.rootVolumeUuid!),
      uuid: source?.uuid ?? "",
    };

    doAction({
      mutation: removeResourceFromBackupJob,
      payload,
      name: intl.formatMessage({
        id: "unbind.vm",
        defaultMessage: "Disassociate Virtual Machine",
      }),
      total: 1,
      type: "VmInstance",
      onFinish: (result) => {
        if (result.success > 0) {
          refreshVmCount();
        }
      },
    });
  }, [doAction, intl, selectedList, refreshVmCount, source]);

  return (
    <DialogP3
      title={intl.formatMessage({
        id: "backup.policy.unbind.vm.title",
        defaultMessage: "Disassociate Virtual Machine?",
      })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      resourceType={intl.formatMessage({
        id: "vm",
        defaultMessage: "Virtual Machine",
      })}
      visible={visible}
      setVisible={setVisible}
      onConfirm={() => {
        onOk();
      }}
      bannerMessage={intl.formatMessage({
        id: "backup.policy.unbind.vm.alert.warning",
        defaultMessage: "Disassociating VMs from a backup plan will stop back up data for the selected VMs. Proceed with caution.",
      })}
    />
  );
}
