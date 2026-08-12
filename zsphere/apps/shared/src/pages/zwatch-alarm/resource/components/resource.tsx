import { gql } from "@apollo/client";
import {
  ModalSelect,
  Form,
  ListCollect,
  useMetricNameConfig,
} from "@zstack/zsphere-components";
import { IIsRequiredType, useValidator } from "@zstack/zsphere-hooks";
import { Op } from "@zstack/zsphere-types";
import type { FormInstance } from "antd/es/form";
import {
  compact as _compact,
  difference as _difference,
  isNil as _isNil,
} from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";

import CephPrimaryStoragePoolSelector from "./ceph-primary-storage-pool-selector";
import FormListWithRequired from "./form-list-with-required";
import PrimaryStorageSelector from "./primary-storage-selector";

import style from "./style.module.less";

const vmInstanceList = gql`
  query vmInstanceList(
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
        state
        cpuNum
        memorySize
        platform
        architecture
        createDate
        defaultL3NetworkUuid
        zmigrateType
        defaultL3Network {
          name
          uuid
          ipVersion
          networkType
        }
        host {
          uuid
          name
          state
          status
          managementIp
          cpuNum
          clusterUuid
        }
        lastHost {
          uuid
          name
          state
          managementIp
          clusterUuid
        }
        cluster {
          name
          state
          uuid
        }
        vmNics {
          type
          uuid
          mac
          ip
          deviceId
          usedIps {
            uuid
            ip
            ipVersion
            l3NetworkUuid
          }
          l3NetworkUuid
          l3Network {
            ... on L3Network {
              name
              uuid
              l2NetworkUuid
              l2Network {
                uuid
                vSwitchType
              }
              networkServices {
                networkServiceType
              }
            }
          }
        }
        systemTag {
          cpuCores
          cpuSockets
          haStickStragedy
          sshkey
          bootOrder
          bootOrderOnce
          consolePassword
          vmConsoleMode
          vmPriority
          GuestTools
          bootMode
          RDPEnable
          usbRedirect
          qemuga
          antiSpoofing
          VDIMonitorNumber
          userdata
          clockTrack
          timeTrack
          isoList {
            uuid
            index
          }
          vmCpuPinningList {
            vCPU
            pCPU
          }
          staticIp {
            l3NetworkUuid
            ip
          }
          vmDriver
          hostname
          qxlMemory {
            ram
            vram
            vgamem
          }
          vmMachineType
        }
        vmHa {
          haLevel
        }
        group {
          groupName
          uuid
        }
        owner {
          uuid
          name
          type
          linkedAccountUuid
        }
      }
    }
  }
`;

const vmListGql = vmInstanceList;

export enum ResourceOriginEnum {
  tableSelect = "tableSelect",
  formList = "formList",
}

interface IPoolSelectorProps {
  value?: any;
  onChange?: (val: any) => void;
  sourceUuid: string;
}

function PoolSelector({ value, onChange, sourceUuid }: IPoolSelectorProps) {
  return (
    <CephPrimaryStoragePoolSelector
      value={value?.[0]?.poolUuid}
      onChange={(poolUuid) => {
        if (!onChange) {
          return;
        }
        if (poolUuid?.length) {
          onChange([{ sourceUuid, poolUuid }]);
        } else {
          onChange([]);
        }
      }}
      defaultQuery={{
        conditions: [
          {
            key: "primaryStorageUuid",
            op: Op.in,
            values: [sourceUuid],
          },
        ],
      }}
    />
  );
}

const ResourceFromFormList: React.FC<IProps> = ({
  form,
  name,
  resourceUuid,
}) => {
  const intl = useIntl();
  const { isRequired } = useValidator(intl);
  const formData: { data: any } = { data: {} };
  formData.data = form.getFieldsValue();

  return (
    <Form.Item
      label={intl.formatMessage({
        id: "ceph.pool",
        defaultMessage: " Distributed Storage  Pool",
      })}
      required
      hideRequiredMessage
    >
      {resourceUuid ? (
        <Form.Item name={name} rules={[isRequired(IIsRequiredType.select)]}>
          <PoolSelector sourceUuid={resourceUuid} />
        </Form.Item>
      ) : (
        <FormListWithRequired
          name={name}
          form={form}
          required
          message={intl.formatMessage({
            id: "please.add.ceph.pool",
            defaultMessage: "Add Ceph Pool",
          })}
        >
          {(fields, { add, remove }) => (
            <ListCollect
              dataSource={fields}
              add={add}
              remove={remove}
              layout="new"
              label={intl.formatMessage({
                id: "add.ceph.pool",
                defaultMessage: "Add  Distributed Storage  Pool",
              })}
            >
              {(field) => {
                return (
                  <>
                    <div
                      className="flex flex-nowrap gap-2"
                      style={{ marginBottom: 12 }}
                    >
                      <div>
                        <Form.Item
                          name={[field.name, "sourceUuid"]}
                          rules={[isRequired(IIsRequiredType.select)]}
                        >
                          <PrimaryStorageSelector
                            defaultQuery={{
                              conditions: [
                                { key: "type", op: Op.eq, value: "Ceph" },
                                {
                                  key: "uuid",
                                  op: Op.notIn,
                                  values: _difference(
                                    _compact(formData?.data?.[name]).map(
                                      (it: any) => it?.sourceUuid,
                                    ),
                                    [
                                      (
                                        _compact(formData?.data?.[name])?.[
                                          field.name
                                        ] as any
                                      )?.sourceUuid,
                                    ],
                                  ),
                                },
                              ],
                            }}
                            onChange={() => {
                              form.resetFields([
                                [name, field.name, "poolUuid"],
                              ]);
                            }}
                          />
                        </Form.Item>
                      </div>
                      <div>
                        <Form.Item>-</Form.Item>
                      </div>
                      <div>
                        <Form.Item
                          noStyle
                          dependencies={[[name, field.name, "sourceUuid"]]}
                        >
                          {({ getFieldValue }) => {
                            const sourceUuid = getFieldValue([
                              name,
                              field.name,
                              "sourceUuid",
                            ]);

                            return (
                              <Form.Item
                                name={[field.name, "poolUuid"]}
                                rules={[isRequired(IIsRequiredType.select)]}
                              >
                                <CephPrimaryStoragePoolSelector
                                  disabled={_isNil(sourceUuid)}
                                  defaultQuery={{
                                    conditions: [
                                      {
                                        key: "primaryStorageUuid",
                                        op: Op.in,
                                        values: _compact([sourceUuid]),
                                      },
                                    ],
                                  }}
                                />
                              </Form.Item>
                            );
                          }}
                        </Form.Item>
                      </div>
                    </div>
                  </>
                );
              }}
            </ListCollect>
          )}
        </FormListWithRequired>
      )}
    </Form.Item>
  );
};

interface IResourceFromTableSelect extends Pick<
  IProps,
  "name" | "namespace" | "resourceUuid"
> {
  componentMap?: any;
}

const ResourceFromTableSelect: React.FC<IResourceFromTableSelect> = ({
  name,
  namespace,
  resourceUuid,
  componentMap,
}) => {
  const intl = useIntl();
  const { isRequired } = useValidator(intl);
  const { translateResourceType } = useMetricNameConfig();

  const resourceListCom = React.useMemo(() => {
    const List = componentMap?.[namespace]?.getList();
    if (!List) {
      return <></>;
    }
    switch (namespace) {
      case "ZStack/VM": {
        const conditions = [
          { key: "type", op: Op.eq, value: "UserVm" },
          { key: "hypervisorType", op: Op.ne, value: "ESX" },
          { key: "state", op: Op.ne, value: "Destroyed" },
          { key: "__excludeGatewayVm__", op: Op.eq, value: "true" },
        ];
        return (
          <List gql={vmListGql} view="select" defaultQuery={{ conditions }} />
        );
      }
      case "ZStack/BaremetalVM":
        return (
          <List
            view="select"
            defaultQuery={{
              conditions: [{ key: "status", op: Op.eq, value: "Provisioned" }],
            }}
          />
        );

      case "ZStack/BackupStorage":
        return (
          <List
            view="select"
            defaultQuery={{
              conditions: [
                {
                  key: "__systemTag__",
                  op: Op.notIn,
                  values: ["remote", "onlybackup", "aliyun", "remotebackup"],
                },
              ],
            }}
          />
        );
      case "ZStack/DisasterRecoveryStorage":
        return (
          <List
            view="select"
            defaultQuery={{
              conditions: [
                {
                  key: "type",
                  op: Op.eq,
                  value: "ImageStoreBackupStorage",
                },
                {
                  key: "__systemTag__",
                  op: Op.in,
                  values: ["allowbackup", "onlybackup", "remotebackup"],
                },
              ],
            }}
          />
        );
      case "ZStack/Host":
        return (
          <List
            view="select"
            defaultQuery={{
              conditions: [{ key: "hypervisorType", op: Op.ne, value: "ESX" }],
            }}
          />
        );
      case "ZStack/L3Network":
        return (
          <List
            view="select"
            defaultQuery={{
              conditions: [
                { key: "l2Network.cluster.type", op: Op.eq, value: "zstack" },
              ],
            }}
          />
        );
      case "ZStack/PrimaryStorage":
        return (
          <List
            view="select"
            defaultQuery={{
              conditions: [],
            }}
          />
        );
      default:
        return <></>;
    }
  }, [namespace]);

  const alertProps = React.useMemo(() => {
    let result = {};
    if (namespace === "ZStack/Baremetal2VM") {
      result = {
        alertType: "info",
        alertMessage: intl.formatMessage({
          id: "baremetal2Instance.zwatch.select.alert.info",
          defaultMessage:
            "To create alarms for elastic baremetal instances, make sure that these elastic baremetal instances are installed with an agent and are connected.",
        }),
      };
    }
    return result;
  }, [namespace]);

  return _isNil(resourceUuid) ? (
    <Form.Item
      name={name}
      label={translateResourceType(namespace)}
      rules={[isRequired()]}
    >
      <ModalSelect
        style={{ width: "400px" }}
        listClassName={style.modalSelectList}
        title={`${intl.formatMessage({
          id: "select",
          defaultMessage: "Select ",
        })}${translateResourceType(namespace)}`}
        selectType="checkbox"
        needRemoveSelected={false}
        {...alertProps}
      >
        {resourceListCom}
      </ModalSelect>
    </Form.Item>
  ) : null;
};

interface IProps {
  name: string;
  namespace: string;
  metricName: string;
  form: FormInstance;
  resourceUuid?: string;
  componentMap?: any;
}

const ResourceCom: React.FC<IProps> = ({
  form,
  name,
  namespace,
  metricName,
  resourceUuid,
  componentMap,
}) => {
  const type = React.useMemo(() => {
    if (
      namespace === "ZStack/PrimaryStorage" &&
      [
        "PoolAvailableCapacityInPercent",
        "PoolUsedCapacityInPercent",
        "PoolVirtualAvailableCapacityInPercent",
      ].includes(metricName)
    ) {
      return ResourceOriginEnum.formList;
    }
    return ResourceOriginEnum.tableSelect;
  }, [namespace, metricName]);

  return React.useMemo(() => {
    if (type === ResourceOriginEnum.tableSelect) {
      return (
        <ResourceFromTableSelect
          name={name}
          namespace={namespace}
          resourceUuid={resourceUuid}
          componentMap={componentMap}
        />
      );
    }

    if (type === ResourceOriginEnum.formList) {
      return (
        <ResourceFromFormList
          form={form}
          name={name}
          namespace={namespace}
          metricName={metricName}
          resourceUuid={resourceUuid}
        />
      );
    }

    return <></>;
  }, [type, name, namespace, form, metricName, resourceUuid]);
};

export default ResourceCom;
