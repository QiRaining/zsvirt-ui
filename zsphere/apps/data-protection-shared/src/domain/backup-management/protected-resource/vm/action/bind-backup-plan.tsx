import { gql } from "@apollo/client";
import { ModalSelect, Form, Select } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import {
  useAction,
  useValidator,
  IIsRequiredType,
} from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import {
  Op,
  SchedulerJobGroupQueryType,
  SchedulerJobGroupType,
} from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useIntl } from "react-intl";

import BackupPolicyList from "../../../backup-policy/list";
import { priorityValueMap } from "../../../backup-policy/utils";

const _addResourceToBackupJob = gql`
  mutation addResourceToBackupJob($input: AddResourceToBackupJobInput!) {
    addResourceToBackupJob(input: $input) {
      actionId
    }
  }
`;

const VmBindBackUpJob: React.FC<IActionWrapperProps<IVM>> = ({
  refetch,
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const { isRequired } = useValidator(intl);
  const doAction = useAction();
  const [form] = Form.useForm();
  const vmUuidList: string[] = useMemo(
    () => selectedList?.map((it) => it?.uuid ?? 0),
    [selectedList],
  );
  const rootVolumeUuids: string[] = useMemo(
    () => selectedList?.map((it) => it?.rootVolumeUuid ?? 0),
    [selectedList],
  );

  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const onOk = (values: any) => {
    const payload = {
      uuid: values.backupPolicy?.[0]?.uuid ?? "",
      resourceUuids: rootVolumeUuids,
      priorities: rootVolumeUuids.map((rootVolumeUuid) => ({
        rootVolumeUuid,
        priority: priorityValueMap[values.priority],
      })),
    };

    doAction({
      mutation: _addResourceToBackupJob,
      payload,
      name: intl.formatMessage({
        id: "bind.vm.action.bind.backup.policy",
        defaultMessage: "Associate Backup Plan",
      }),
      total: 1,
      type: "VmInstance",
      onFinish: () => {
        setSelectedList?.([]);
        refetch?.();
      },
    });
  };

  const zoneUuid = selectedList[0]?.zoneUuid ?? "";

  const defaultQuery = useMemo(() => {
    return {
      type: SchedulerJobGroupQueryType.GetVMAttachableBackupJob,
      extraConditions: [{ key: "vmUuidList", op: Op.in, values: vmUuidList }],
      conditions: [
        { key: "jobType", op: Op.eq, value: SchedulerJobGroupType.vmBackup },
        { key: "zoneUuid", op: Op.eq, value: zoneUuid },
      ],
    };
  }, [vmUuidList, zoneUuid]);

  return (
    <DialogForm
      form={form}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      title={intl.formatMessage({
        id: "bindtoBackUpPlan",
        defaultMessage: "Associate Backup Plan",
      })}
      resourceName={
        selectedList.length > 1
          ? intl.formatMessage(
              { id: "object.count", defaultMessage: "{num} objects" },
              { num: selectedList.length },
            )
          : selectedList[0]?.name
      }
    >
      <Form form={form}>
        <Form.Item
          required
          name="backupPolicy"
          label={intl.formatMessage({
            id: "backup.policy",
            defaultMessage: "Backup Plan",
          })}
          rules={[isRequired(IIsRequiredType.select)]}
        >
          <ModalSelect
            className="width-320"
            title={intl.formatMessage({
              id: "selectBackUpPlan",
              defaultMessage: "Select Backup Plan",
            })}
            selectType="radio"
          >
            <BackupPolicyList view="select" defaultQuery={defaultQuery} />
          </ModalSelect>
        </Form.Item>
        <Form.Item
          name="priority"
          label={intl.formatMessage({
            id: "backup.priority",
            defaultMessage: "Backup Priority",
          })}
          initialValue="normal"
        >
          <Select
            className="width-240"
            options={[
              {
                label: intl.formatMessage({
                  id: "normal",
                  defaultMessage: "Normal",
                }),
                value: "normal",
              },
              {
                label: intl.formatMessage({ id: "high", defaultMessage: "High" }),
                value: "high",
              },
            ]}
          />
        </Form.Item>
      </Form>
    </DialogForm>
  );
};

export default VmBindBackUpJob;
