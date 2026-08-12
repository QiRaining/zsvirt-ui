import { gql, useLazyQuery } from "@apollo/client";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { DialogWeak } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  VmInstance,
  SchedulerJobGroup,
} from "@zstack/zsphere-types/graphql";
import { usePersistFn } from "ahooks";
import React, { useEffect } from "react";
import { useIntl } from "react-intl";
import { priorityValueMap } from "zsv_data_protection_shared/backup-management/backup-policy/mf-index";

import SelectVm from "../../../action/components/SelectVm";

import style from "./style.module.less";

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
        uuid
        name
        description
        state
        # status
        jobType
        jobData
        triggersUuid
        jobsUuid
        owner {
          name
          uuid
          type
        }
        localBackupStorage {
          name
          uuid
        }
        remoteBackupStorage {
          name
          uuid
        }
        schedulerTriggers {
          uuid
          name
          description
          jobsUuid
          schedulerType
          schedulerInterval
          repeatCount
          startTime
          stopTime
          state
          cron
        }
        createDate
        lastOpDate
        zoneUuid
        zone {
          uuid
          name
        }
        lastJobResult {
          id
          fireInstanceId
          successCount
          failCount
          runningCount
        }
        jobs {
          uuid
          jobData
          targetResourceUuid
          schedulerJobGroupJobRefs {
            schedulerJobGroupUuid
            priority
          }
        }
      }
    }
  }
`;

const addResourceToBackupJob = gql`
  mutation addResourceToBackupJob($input: AddResourceToBackupJobInput!) {
    addResourceToBackupJob(input: $input) {
      actionId
    }
  }
`;

export default function AttachVm({
  visible,
  setVisible,
  source,
}: IActionWrapperProps<VmInstance, SchedulerJobGroup>) {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const [refreshVmCount] = useLazyQuery(schedulerJobGroupList, {
    variables: {
      conditions: [{ key: "uuid", value: source?.uuid ?? "", op: Op.eq }],
    },
  });

  const onOk = usePersistFn((values: any) => {
    const payload = {
      uuid: source?.uuid ?? "",
      resourceUuids: values.vm.map((item: VmInstance) => item.rootVolumeUuid!),
      priorities:
        values.priority &&
        Object.entries(values.priority).map(([rootVolumeUuid, priority]) => ({
          rootVolumeUuid,
          priority: priorityValueMap[priority as string],
        })),
    };

    doAction({
      mutation: addResourceToBackupJob,
      payload,
      type: "VmInstance",
      name: intl.formatMessage({ id: "bind.vm", defaultMessage: "Associate Virtual Machine" }),
      total: 1,
      onFinish: (result) => {
        if (result.success > 0) {
          refreshVmCount();
        }
      },
    });
  });

  if (!source?.localBackupStorage?.length) {
    return (
      <DialogWeak
        visible={visible}
        setVisible={setVisible}
        type="warning"
        title={intl.formatMessage({
          id: "backup.policy.bind.vm.confirm.no.storage.title",
          defaultMessage: "Cannot Associate VM",
        })}
        onConfirm={() => setVisible(false)}
        description={intl.formatMessage({
          id: "backup.policy.bind.vm.confirm.no.storage.description",
          defaultMessage:
            "The current back plan does not associate with any backup storage. Modify the configuration and try again.",
        })}
        hideCancelButton
      />
    );
  }

  return (
    <DialogForm
      form={form}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      title={intl.formatMessage({
        id: "bind.vm",
        defaultMessage: "Associate Virtual Machine",
      })}
      resourceName={source?.name}
    >
      <Form form={form}>
        <SelectVm zoneUuid={source?.zoneUuid} />
      </Form>
    </DialogForm>
  );
}
