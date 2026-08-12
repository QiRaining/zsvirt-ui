import { gql, useLazyQuery } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  VmInstance,
  SnapshotStrategy,
} from "@zstack/zsphere-types/graphql";
import { useCallback } from "react";
import { useIntl } from "react-intl";

const deleteSchedulerJob = gql`
  mutation deleteSchedulerJob($input: DeleteSchedulerJobInput!) {
    deleteSchedulerJob(input: $input) {
      actionId
    }
  }
`;

const snapshotStrategyList = gql`
  query snapshotStrategyList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $extraConditions: [Condition!] = []
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    snapshotStrategyList(
      start: $start
      limit: $limit
      conditions: $conditions
      extraConditions: $extraConditions
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      total
      list {
        uuid
        name
        description
        state
        jobsUuid
        jobs {
          uuid
          name
          jobData
          targetResourceUuid
          schedulerJobGroupUuids
          lastOpDate
          createDate
        }
        jobData
        triggersUuid
        triggers {
          uuid
          name
          cron
          startTime
          stopTime
          lastOpDate
          createDate
        }
        owner {
          uuid
          name
          type
        }
        lastOpDate
        createDate
      }
    }
  }
`;

export default function DetachVm({
  visible,
  setVisible,
  selectedList,
  source,
}: IActionWrapperProps<VmInstance, SnapshotStrategy>) {
  const intl = useIntl();
  const doAction = useAction();

  const [refreshVmCount] = useLazyQuery(snapshotStrategyList, {
    variables: {
      conditions: [{ key: "uuid", value: source?.uuid ?? "", op: Op.eq }],
    },
  });

  const onOk = useCallback(() => {
    const payload = selectedList.map((item) => {
      return {
        uuid: item.snapshotSchedulerJob?.[0]?.uuid,
      };
    });
    doAction({
      mutation: deleteSchedulerJob,
      payload,
      name: intl.formatMessage({
        id: "remove.vm",
        defaultMessage: "Remove Virtual Machine",
      }),
      total: selectedList.length,
      type: "VmInstance",
      onFinish: (result) => {
        if (result.success > 0) {
          refreshVmCount();
        }
      },
    });
  }, [doAction, intl, selectedList, refreshVmCount]);

  return (
    <DialogP3
      title={intl.formatMessage({
        id: "snapshot.strategy.remove.vm.title",
        defaultMessage: "Remove Virtual Machine?",
      })}
      resourceNames={selectedList.map((r) => r.name)}
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
    />
  );
}
