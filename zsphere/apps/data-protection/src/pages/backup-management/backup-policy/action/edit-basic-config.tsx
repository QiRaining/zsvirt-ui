import { gql, useApolloClient } from "@apollo/client";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op, SchedulerJobGroupType, VmQueryType } from "@zstack/zsphere-types";
import type {
  SchedulerJobGroup,
  VmInstance,
  BackupStorage,
} from "@zstack/zsphere-types/graphql";
import { usePersistFn } from "ahooks";
import { useEffect, useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import { priorityValueMap } from "zsv_data_protection_shared/backup-management/backup-policy/mf-index";

import BasicConfig from "./components/BasicConfig";

import style from "./style.module.less";

const updateSchedulerJobGroup = gql`
  mutation updateSchedulerJobGroup($input: UpdateSchedulerJobGroupInput!) {
    updateSchedulerJobGroup(input: $input) {
      actionId
    }
  }
`;

const BACKUP_POLICY_VM_INSTANCE_SELECT_LIST = gql`
  query backupPolicyVmInstanceSelectList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $type: VmQueryType
    $extraConditions: [Condition!] = []
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    vmInstanceList(
      start: $start
      limit: $limit
      replyWithCount: true
      conditions: $conditions
      type: $type
      extraConditions: $extraConditions
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      total
      list {
        uuid
        name
        rootVolumeUuid
        state
        cpuNum
        memorySize
        architecture
        platform
        defaultL3NetworkUuid
        vmNics {
          uuid
          l3NetworkUuid
          usedIps {
            uuid
            ip
            ipVersion
          }
        }
        owner {
          uuid
          name
        }
        group {
          uuid
          groupName
        }
        host {
          uuid
          managementIp
        }
        cluster {
          uuid
          name
        }
        vmHa {
          haLevel
        }
        zoneUuid
        createDate
      }
    }
  }
`;

export default function EditBasicConfig({
  visible,
  setVisible,
  selectedList,
}: IActionWrapperProps<SchedulerJobGroup>) {
  const intl = useIntl();
  const [form] = Form.useForm();
  const doAction = useAction();
  const apolloClient = useApolloClient();

  const current = selectedList?.[0];

  const priority = useMemo(() => {
    const jobs = current?.jobs ?? [];
    const result: Record<string, string> = {};
    jobs.forEach((job) => {
      const rootVolumeUuid = job.targetResourceUuid;
      const jobRefs = job.schedulerJobGroupJobRefs ?? [];
      const value =
        jobRefs.find((ref) => ref.schedulerJobGroupUuid === current?.uuid)
          ?.priority ?? 0;
      result[rootVolumeUuid] = value < 0 ? "high" : "normal";
    });
    return result;
  }, [current]);

  const title = intl.formatMessage({
    id: "backup.policy.editBasicConfig.title",
    defaultMessage: "Modify Basic Settings",
  });

  const handleModalVisible = usePersistFn(() => {
    form.resetFields();
    form.setFieldsValue({
      schedulerJobGroupUuid: current.uuid,
      name: current.name,
      description: current.description,
      zoneUuid: current.zone?.uuid,
      zoneName: current.zone?.name,
      entityType:
        current.jobType === SchedulerJobGroupType.databaseBackup ? "db" : "vm",
      localBackupStorage: current.localBackupStorage,
      syncRemote: !!current.remoteBackupStorage,
      remoteBackupStorage: current.remoteBackupStorage,
      priority,
    });
    apolloClient
      .query({
        query: BACKUP_POLICY_VM_INSTANCE_SELECT_LIST,
        variables: {
          type: VmQueryType.GetVmBySchedulerJobGroup,
          extraConditions: [
            {
              key: "schedulerJobGroupUuids",
              op: Op.in,
              values: [current.uuid],
            },
          ],
        },
        errorPolicy: "ignore",
      })
      .catch(() => null)
      .then((result) => {
        const vm = result?.data?.vmInstanceList?.list ?? [];
        form.setFieldsValue({ vm, initialVmCount: vm.length });
      });
  });

  useEffect(() => {
    if (current && visible) {
      handleModalVisible();
    }
  }, [current, visible, handleModalVisible]);

  const handleSubmit = useCallback(
    (data) => {
      const payload = {
        uuid: current?.uuid ?? "",
        name: data.name,
        description: data.description,
        parameters: {
          backupStorageUuids: data.localBackupStorage
            .map((item: BackupStorage) => item.uuid)
            .join(","),
          remoteBackupStorageUuid: data.syncRemote
            ? (data.remoteBackupStorage?.uuid ?? "")
            : "",
        },
        priorities:
          data.priority &&
          Object.entries(data.priority).map(([rootVolumeUuid, value]) => ({
            rootVolumeUuid,
            priority: priorityValueMap[value as string],
          })),
        targetResourceUuids: data.vm?.map(
          (item: VmInstance) => item.rootVolumeUuid,
        ),
      };

      doAction({
        mutation: updateSchedulerJobGroup,
        payload: [payload],
        name: title,
        total: 1,
        type: "SchedulerJobGroup",
      });
    },
    [doAction, current, title],
  );

  return (
    <DialogForm
      widthClassName="w-200"
      form={form}
      visible={visible}
      setVisible={setVisible}
      onOk={handleSubmit as any}
      title={title}
      resourceName={current?.name}
    >
      <Form form={form}>
        <BasicConfig isEdit form={form} className={style.editConfig} />
      </Form>
    </DialogForm>
  );
}
