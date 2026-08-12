import { gql } from "@apollo/client";
import { Text } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { ModalSelect, Form, Select } from "@zstack/zsphere-components";
import { useValidator, IIsRequiredType } from "@zstack/zsphere-hooks";
import { Op, VmQueryType } from "@zstack/zsphere-types";
import { useMemo } from "react";
import { useIntl } from "react-intl";
import { VmPlainList } from "zsv_resource_shared/vm/mf-index";

import style from "./style.module.less";

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

export interface ISelectVmProps {
  zoneUuid?: string;
  initialVmCount?: number;
  required?: boolean;
  schedulerJobGroupUuid?: string;
}

export default function SelectVm({
  zoneUuid,
  required = true,
  schedulerJobGroupUuid,
}: ISelectVmProps) {
  const intl = useIntl();
  const { isRequired } = useValidator(intl);
  const form = Form.useFormInstance();

  const defaultQuery = useMemo(
    () => ({
      type: VmQueryType.GetBackupJobAttachableVM,
      conditions: [
        {
          key: "state",
          op: Op.in,
          values: ["Running", "Paused"],
        },
        {
          key: "zoneUuid",
          op: Op.eq,
          value: zoneUuid,
        },
      ],
      extraConditions: schedulerJobGroupUuid
        ? [
            {
              key: "__currentSchedulerJobGroupUuids__",
              op: Op.in,
              values: [schedulerJobGroupUuid],
            },
          ]
        : [],
    }),
    [zoneUuid, schedulerJobGroupUuid],
  );

  const handleDelete = (current: any) => {
    if (form) {
      form.resetFields([["priority", current.rootVolumeUuid]]);
      form.setFieldsValue({
        vm: (form.getFieldValue("vm") ?? []).filter(
          (item: any) => item.rootVolumeUuid !== current.rootVolumeUuid,
        ),
      });
    }
  };

  return (
    <Form.Item
      required={required}
      name="vm"
      label={intl.formatMessage({
        id: "vm",
        defaultMessage: "Virtual Machine",
      })}
      rules={required ? [isRequired(IIsRequiredType.select)] : undefined}
    >
      <ModalSelect
        className={style.modalSelect}
        selectType="checkbox"
        hideSelectedCountRatio
        label={intl.formatMessage({
          id: "add.vm",
          defaultMessage: "Add Virtual Machine",
        })}
        title={intl.formatMessage({
          id: "select.vm",
          defaultMessage: "Select Virtual Machine",
        })}
        columnConfig={[
          {
            key: "name",
            width: 160,
            title: intl.formatMessage({ id: "name", defaultMessage: "Name" }),
            render: (current) => <Text>{current.name}</Text>,
          },
          {
            key: "priority",
            title: intl.formatMessage({
              id: "backup.priority",
              defaultMessage: "Backup Priority",
            }),
            render: (current) => (
              <Form.Item
                noStyle
                name={["priority", current.rootVolumeUuid]}
                initialValue="normal"
              >
                <Select
                  options={[
                    {
                      label: intl.formatMessage({
                        id: "normal",
                        defaultMessage: "Normal",
                      }),
                      value: "normal",
                    },
                    {
                      label: intl.formatMessage({
                        id: "high",
                        defaultMessage: "High",
                      }),
                      value: "high",
                    },
                  ]}
                />
              </Form.Item>
            ),
          },
          {
            key: "action",
            title: (
              <div className={style.actionTitle}>
                {intl.formatMessage({ id: "action", defaultMessage: "Actions" })}
              </div>
            ),
            width: 66,
            render: (current) => (
              <div
                onClick={() => {
                  handleDelete(current);
                }}
                className={style.trashIcon}
              >
                <Icon type="trash" />
              </div>
            ),
          },
        ]}
        destroyOnClose={false}
        modalForceRender
      >
        <VmPlainList
          view="select"
          gql={BACKUP_POLICY_VM_INSTANCE_SELECT_LIST}
          defaultQuery={defaultQuery}
        />
      </ModalSelect>
    </Form.Item>
  );
}
