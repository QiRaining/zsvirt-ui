import { useMutation } from "@apollo/client";
import { useValidator } from "@zstack/hooks";
import {
  Form,
  Input,
  InputNumber,
  InputUnit,
  Select,
  ModalSelect,
  ReactMarkdown,
} from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import {
  Op,
  PrimaryStorageState,
  PrimaryStorageStatus,
} from "@zstack/zsphere-types";
import {
  ipToInt,
  formatConditions,
  isValidNetMask,
} from "@zstack/zsphere-utils";
import { compact, isEmpty } from "lodash-es";
import React, { useCallback } from "react";
import { useIntl } from "react-intl";
import CephPoolList from "zsv_resource/ceph-primary-storage-pool/list";
import L3NetworkList from "zsv_resource/l3-network/list";
import PrimaryStorageList from "zsv_resource/primary-storage/list";

import ModalTreeSelect from "../../components/modal-tree-select";
import { MigrationPackageData } from "../../types";
import { buildMigrationServiceConfig } from "../../utils";
import { buildInstallMigrationServicePayload } from "./action-payload";
import IpInput from "./ip-input";
import { INSTALL_MIGRATION_SERVICE, CHECK_IP_AVAILABILITY } from "./queries";
import { submitInstallAction } from "./submission";
import { useZoneClusterHost } from "./use-zone-cluster-host";

interface InstallModalProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  packageData?: MigrationPackageData;
  onActionStartPolling?: () => void;
}

const DEFAULT_CPU = 8;
const DEFAULT_MEMORY = { number: 8, unit: "GB" };
const DEFAULT_DISK = { number: 100, unit: "GB" };

export const unitList = ["MB", "GB", "TB"];

const InstallModal: React.FC<InstallModalProps> = ({
  visible,
  setVisible,
  packageData,
  onActionStartPolling,
}) => {
  const [form] = Form.useForm();
  const intl = useIntl();
  const doAction = useAction();
  const { isRequired, ipValidator } = useValidator(intl);

  const { zoneList, runPathTreeData, loading, handleDataCenterChange } =
    useZoneClusterHost(form, visible);

  const [remoteValidateIp] = useMutation(CHECK_IP_AVAILABILITY);

  const submitHandle = useCallback(
    async (_data: Record<string, unknown>) => {
      const payload = buildInstallMigrationServicePayload(
        packageData?.uuid || "",
        buildMigrationServiceConfig(_data, packageData),
      );
      return submitInstallAction({
        onActionStart: onActionStartPolling,
        submitAction: () =>
          doAction({
            mutation: INSTALL_MIGRATION_SERVICE,
            payload,
            name: intl.formatMessage({
              id: "migration.install.service",
              defaultMessage: "Deploy Migration Service",
            }),
            forceRunCallback: true,
            total: 1,
            type: "MigrationService",
          }),
      });
    },
    [packageData, doAction, intl, onActionStartPolling],
  );

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "migration.install.service",
        defaultMessage: "Deploy Migration Service",
      })}
      visible={visible}
      setVisible={setVisible}
      form={form}
      onOk={submitHandle}
    >
      <Form
        form={form}
        initialValues={{
          cpu: DEFAULT_CPU,
          memory: DEFAULT_MEMORY,
          disk1Size: DEFAULT_DISK,
        }}
      >
        <Form.Item
          label={intl.formatMessage({
            id: "migration.install.version",
            defaultMessage: "Migration Service Version",
          })}
        >
          {packageData?.version || "-"}
        </Form.Item>

        <Form.Item
          name="zoneUuid"
          label={intl.formatMessage({
            id: "migration.install.datacenter",
            defaultMessage: " Data Center",
          })}
          required
          rules={[isRequired()]}
        >
          <Select className="width-320" onChange={handleDataCenterChange}>
            {zoneList.map((item: { uuid: string; name: string }) => (
              <Select.Option key={item.uuid} value={item.uuid}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="runPath"
          label={intl.formatMessage({
            id: "migration.install.cluster",
            defaultMessage: "Location",
          })}
          required
          rules={[isRequired()]}
        >
          <ModalTreeSelect
            treeData={runPathTreeData}
            loading={loading}
            title={intl.formatMessage({
              id: "virtualization.migration.service.install.run.path.select.modal.title",
              defaultMessage: "Select Location",
            })}
            modalWidth={600}
          />
        </Form.Item>

        <Form.Item
          name="cpu"
          label={intl.formatMessage({
            id: "migration.install.cpu",
            defaultMessage: "CPU",
          })}
          required
          rules={[isRequired()]}
        >
          <InputNumber max={2000} style={{ width: 160 }} />
        </Form.Item>

        <Form.Item
          name="memory"
          label={intl.formatMessage({
            id: "migration.install.memory",
            defaultMessage: "Memory",
          })}
          required
          rules={[isRequired()]}
        >
          <InputUnit unitList={unitList} min={1} />
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prev, cur) =>
            prev[`runPath`] !== cur[`runPath`] ||
            prev["zoneUuid"] !== cur["zoneUuid"]
          }
        >
          {({ getFieldValue }) => {
            const zoneUuid = getFieldValue([`zoneUuid`]);
            const runPath = getFieldValue([`runPath`])?.[0];
            const clusterUuid =
              runPath?.__typename === "Cluster"
                ? runPath?.uuid
                : runPath?.cluster?.uuid;

            return (
              <Form.Item
                name="storePath"
                label={intl.formatMessage({
                  id: "migration.install.storage.location",
                  defaultMessage: "Storage Location",
                })}
                required
                rules={[isRequired()]}
                dependencies={[`runPath`]}
              >
                <ModalSelect
                  title={intl.formatMessage({
                    id: "migration.install.storage.location.select.modal.title",
                    defaultMessage: "Select Storage Location",
                  })}
                  modalWidth={600}
                  style={{ width: 320 }}
                >
                  <PrimaryStorageList
                    view="select"
                    defaultQuery={{
                      conditions: compact([
                        {
                          key: "state",
                          op: Op.eq,
                          value: PrimaryStorageState.Enabled,
                        },
                        {
                          key: "status",
                          op: Op.eq,
                          value: PrimaryStorageStatus.Connected,
                        },
                        clusterUuid
                          ? {
                              key: "cluster.uuid",
                              op: Op.eq,
                              value: clusterUuid,
                            }
                          : null,
                        {
                          key: "zoneUuid",
                          op: Op.eq,
                          value: zoneUuid,
                        },
                      ]),
                    }}
                  />
                </ModalSelect>
              </Form.Item>
            );
          }}
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prev, cur) => prev[`storePath`] !== cur[`storePath`]}
        >
          {({ getFieldValue }) => {
            const storePath = getFieldValue([`storePath`])?.[0];
            return storePath?.type === "Ceph" ? (
              <Form.Item
                name={`volumeStoragePool`}
                label={intl.formatMessage({
                  id: "virtualization.storage.pool",
                  defaultMessage: "Storage Pool",
                })}
                required
                rules={[isRequired()]}
                dependencies={[`storePath`]}
              >
                <ModalSelect
                  transformKey="poolName"
                  title={intl.formatMessage({
                    id: "virtualization.select.storage.ceph.pool",
                    defaultMessage: "Select a storage pool.",
                  })}
                  modalWidth={600}
                  style={{ width: 320 }}
                >
                  <CephPoolList
                    view="select"
                    defaultQuery={{
                      conditions: formatConditions({
                        primaryStorageUuid: storePath?.uuid,
                        type: "Data",
                      }),
                    }}
                  />
                </ModalSelect>
              </Form.Item>
            ) : null;
          }}
        </Form.Item>

        <Form.Item
          name="disk1Size"
          label={intl.formatMessage({
            id: "migration.install.disk",
            defaultMessage: "Disk 1",
          })}
          required
          rules={[isRequired()]}
        >
          <InputUnit unitList={unitList} min={1} />
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prev, cur) => prev.zoneUuid !== cur.zoneUuid}
        >
          {({ getFieldValue }) => {
            const zoneUuid = getFieldValue("zoneUuid");

            return (
              <Form.Item
                name="migrationNetwork"
                label={intl.formatMessage({
                  id: "migration.install.network",
                  defaultMessage: "Migration Network",
                })}
                icon="info"
                iconTooltip={
                  <ReactMarkdown>
                    {intl.formatMessage({
                      id: "migration.install.network.tooltip",
                      defaultMessage:
                        "### Migration Network\n\nThe selected distributed port group must maintain network connectivity with both the source and target platforms to ensure proper data transmission.",
                    })}
                  </ReactMarkdown>
                }
                required
                rules={[isRequired()]}
                dependencies={["zoneUuid"]}
              >
                <ModalSelect
                  title={intl.formatMessage({
                    id: "virtualization.select.migration.network.title",
                    defaultMessage: "Select Migration Network",
                  })}
                  modalWidth={600}
                  style={{ width: 320 }}
                >
                  <L3NetworkList
                    view="select"
                    defaultQuery={{
                      conditions: compact([
                        zoneUuid
                          ? {
                              key: "zoneUuid",
                              op: Op.eq,
                              value: zoneUuid,
                            }
                          : null,
                        { key: "defaultFilter", value: "NOT_DEFAULT" },
                      ]),
                    }}
                  />
                </ModalSelect>
              </Form.Item>
            );
          }}
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prev, cur) =>
            prev.migrationNetwork !== cur.migrationNetwork
          }
        >
          {({ getFieldValue }) => {
            const _l3Network = getFieldValue("migrationNetwork")?.[0] ?? {};
            const ipRanges = compact(
              _l3Network?.ipRanges?.filter(
                (ip: any) => ip.ipVersion === 4 && ip.ipRangeType === "Normal",
              ),
            );
            // 端口组未启用 DHCP 时，需要用户手动补充 IP / 子网掩码 / 默认网关，
            // 否则部署后迁移网关无法获取网络配置。参考新建虚拟机的端口组判断逻辑。
            const dhcpEnabled = !!_l3Network?.networkServices?.find(
              (item: any) => item.networkServiceType === "DHCP",
            );
            const requireManualIp = !!_l3Network?.uuid && !dhcpEnabled;

            return (
              <>
                <Form.Item
                  name="ipv4Address"
                  label={intl.formatMessage({
                    id: "migration.install.ipv4",
                    defaultMessage: "IPv4 Address",
                  })}
                  icon="info"
                  iconTooltip={
                    <ReactMarkdown>
                      {intl.formatMessage({
                        id: "migration.install.ipv4.tooltip",
                        defaultMessage: `IPv4 Address

IP address assignment depends on the migration network configuration:

- When DHCP is enabled on the migration network, the system automatically assigns an IP address.
- When DHCP is disabled on the migration network, you need to specify an IP address.
- When IPAM is enabled on the migration network, manually specified IP address must be within the selected network segment.`,
                      })}
                    </ReactMarkdown>
                  }
                  required={requireManualIp}
                  rules={[
                    ...(requireManualIp ? [isRequired()] : []),
                    ipValidator(),
                    () => ({
                      validator: async (_rule: any, value: string) => {
                        if (!value) return;

                        const isInIpRanges = !isEmpty(ipRanges)
                          ? ipRanges.some(({ startIp, endIp }: any) => {
                              const valueInt = ipToInt(value);
                              const startIpInt = ipToInt(startIp!);
                              const endInt = ipToInt(endIp!);
                              return (
                                valueInt >= startIpInt && valueInt <= endInt
                              );
                            })
                          : true;
                        if (!isInIpRanges) {
                          throw new Error(
                            intl.formatMessage({
                              id: "migration.install.ipv4.validator.range",
                              defaultMessage: "The IP address is not in the network range.",
                            }),
                          );
                        }

                        if (_l3Network?.uuid) {
                          const { data } = await remoteValidateIp({
                            variables: {
                              input: {
                                l3NetworkUuid: _l3Network.uuid,
                                ip: value,
                              },
                            },
                          });
                          const available =
                            data?.checkIpAvailability?.available ?? true;
                          if (!available) {
                            throw new Error(
                              intl.formatMessage({
                                id: "migration.install.ipv4.validator.occupied",
                                defaultMessage: "The IP address is already in use.",
                              }),
                            );
                          }
                        }
                      },
                    }),
                  ]}
                >
                  {_l3Network.enableIPAM ? (
                    <IpInput
                      key={_l3Network.uuid}
                      l3NetworkUuid={_l3Network.uuid}
                      ipVersion={4}
                      className="width-320"
                    />
                  ) : (
                    <Input
                      className="width-320"
                      placeholder={intl.formatMessage({
                        id: "migration.install.ipv4.placeholder",
                        defaultMessage: "Enter an IPv4 address.",
                      })}
                    />
                  )}
                </Form.Item>

                {requireManualIp && (
                  <>
                    <Form.Item
                      name="ipv4Netmask"
                      label={intl.formatMessage({
                        id: "migration.install.ipv4.netmask",
                        defaultMessage: "Netmask",
                      })}
                      required
                      rules={[
                        isRequired(),
                        {
                          validator: (_: any, value?: string) =>
                            !value || isValidNetMask(value)
                              ? Promise.resolve()
                              : Promise.reject(
                                  new Error(
                                    intl.formatMessage({
                                      id: "migration.install.ipv4.netmask.validator.format",
                                      defaultMessage: "Invalid netmask.",
                                    }),
                                  ),
                                ),
                        },
                      ]}
                    >
                      <Input
                        className="width-320"
                        placeholder={intl.formatMessage({
                          id: "migration.install.ipv4.netmask.placeholder",
                          defaultMessage: "Enter a netmask",
                        })}
                      />
                    </Form.Item>

                    <Form.Item
                      name="ipv4Gateway"
                      label={intl.formatMessage({
                        id: "migration.install.ipv4.gateway",
                        defaultMessage: "IPv4 Gateway",
                      })}
                      required
                      rules={[isRequired(), ipValidator()]}
                    >
                      <Input
                        className="width-320"
                        placeholder={intl.formatMessage({
                          id: "migration.install.ipv4.gateway.placeholder",
                          defaultMessage: "Enter an IPv4 gateway",
                        })}
                      />
                    </Form.Item>
                  </>
                )}
              </>
            );
          }}
        </Form.Item>
      </Form>
    </DialogForm>
  );
};

export default InstallModal;
