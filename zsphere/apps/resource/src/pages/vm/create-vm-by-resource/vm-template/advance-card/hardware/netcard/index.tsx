import { Checkbox, Text, Tooltip } from "@zstack/design";
import { queryL3NetworkList } from "@zstack/virtualization-resource/src/gql/l3-network.gql";
import L3NetworkList from "@zstack/virtualization-resource/src/pages/l3-network/list";
import PhysicalNicList from "@zstack/virtualization-resource/src/pages/physical-nic/list";
import { VmNicDefaultNetflowStrategy } from "@zstack/virtualization-resource/src/pages/security-group/components/VmNicNetflowStrategy";
import SecurityGroupList from "@zstack/virtualization-resource/src/pages/security-group/list";
import { ConfigContext } from "@zstack/virtualization-resource/src/pages/vm/action/edit-config/config-context";
import IpField from "@zstack/virtualization-resource/src/pages/vm/create/hardware-and-config/hardware/netcard/components/ip-field";
import { PortGroupModalSelect } from "@zstack/virtualization-resource/src/pages/vm/create/hardware-and-config/hardware/netcard/components/port-group";
import { ModalSelect, ZSVForm, Switch } from "@zstack/zsphere-components";
import {
  Form,
  Input,
  InputUnit,
  Select,
  SortableList,
  useAuth,
} from "@zstack/zsphere-components";
import type { FormCreateType } from "@zstack/zsphere-types";
import {
  L3NetworkQueryType,
  Op,
  PhysicalNicQueryType,
} from "@zstack/zsphere-types";
import type {
  SecurityGroup as ISecurityGroup,
  VmNic as IVmNic,
  PhysicalNic,
} from "@zstack/zsphere-types/graphql";
import { isNil, keys, compact } from "lodash-es";
import React, { useContext, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import styles from "./style.module.less";

const FormCheckbox = React.forwardRef<
  HTMLButtonElement,
  {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    label?: React.ReactNode;
    disabled?: boolean;
    className?: string;
  }
>(({ checked, onChange, label, ...rest }, ref) => {
  const id = React.useId();
  return (
    <div className="flex items-center">
      <Checkbox
        ref={ref}
        id={id}
        checked={checked}
        onCheckedChange={(val) => onChange?.(val === true)}
        {...rest}
      />
      {label && (
        <label
          htmlFor={id}
          className="cursor-pointer pl-2 text-sm !text-neutral-700"
        >
          {label}
        </label>
      )}
    </div>
  );
});

interface IProps {
  hideTag?: boolean;
  hideDescription?: boolean;
  hideQuantity?: boolean;
  setFields?: Function;
  formCreateType?: FormCreateType;
  form: any;
  index: number;
  displayIndex?: number;
  zoneUuid: string;
  source: any;
  isEdit?: boolean;
  origin?: IVmNic;
  newCreate?: boolean;
  vmTemplate?: any;
}

const { Item } = Form;
const { Option } = Select;

export const nicBandWidthList = ["Kbps", "Mbps", "Gbps"];

export const getValue = (networkOutboundBandwidth: any) =>
  (networkOutboundBandwidth?.number ?? 0) *
  1024 **
    (nicBandWidthList.findIndex(
      (unit) => unit === networkOutboundBandwidth?.unit,
    ) +
      1);
const isEmpty = (val: string | number) => val === 0 || val === "" || isNil(val);

export const validateBandwidth = (val: any, message: string) => {
  const min = getValue({ number: 8, unit: "Kbps" });
  const max = getValue({ number: 30, unit: "Gbps" });
  const value = getValue(val);
  const isOverSize = value < min || value > max;
  return !isOverSize || isEmpty(val.number)
    ? Promise.resolve()
    : Promise.reject(message);
};

const netCardType = [
  {
    label: "e1000",
    value: "e1000",
  },
  // {
  //   label: 'SR-IOV',
  //   value: 'SR-IOV'
  // },
  {
    label: "rtl8139",
    value: "rtl8139",
  },
  {
    label: "virtio",
    value: "virtio",
  },
  {
    label: "pcnet",
    value: "pcnet",
  },
];

const allCanDisableItems = [
  "netCardState",
  "securityGroup",
  "netCardQosEnabled",
  "outboundBandwidth",
  "inboundBandwidth",
];

const disabledItemsForNewCreate = ["netCardState"];

const NetCard: React.FC<IProps> = ({
  form,
  index,
  displayIndex,
  zoneUuid,
  source,
  vmTemplate,
  isEdit = false,
  origin,
  newCreate = false,
}) => {
  const intl = useIntl();
  const disabledConfig = useContext(ConfigContext);
  const { hasAuth } = useAuth();

  const disableItems = newCreate
    ? disabledItemsForNewCreate
    : allCanDisableItems;

  // 监听相关字段变化，设置表单值
  const runPath = Form.useWatch("runPath", form);
  const nicType = Form.useWatch(`nicType-${index}`, form);
  const netCardQosEnabled = Form.useWatch(`netCardQosEnabled-${index}`, form);

  // 监听 runPath 变化，清空端口组
  useEffect(() => {
    const isRunPathTouched = form.isFieldTouched("runPath");
    const l3 = form.getFieldValue(`l3NetworkUuids-${index}`) ?? [];

    if (isRunPathTouched && l3.length !== 0) {
      let clusterUuid = "";

      if (runPath?.[0]?.__typename === "Cluster") {
        clusterUuid = runPath?.[0]?.uuid;
      }

      if (
        runPath?.[0]?.__typename === "HostVO" ||
        runPath?.[0]?.__typename === "Host"
      ) {
        clusterUuid = runPath[0].cluster?.uuid || runPath[0].clusterUuid;
      }

      if (
        l3?.[0]?.l2Network?.attachedClusterUuids?.indexOf(clusterUuid) === -1
      ) {
        form.setFields([
          {
            name: `l3NetworkUuids-${index}`,
            value: [],
          },
        ]);
      }
    }
  }, [runPath, form, index]);

  // 监听 nicType 变化，清空 nicDevice
  useEffect(() => {
    if (nicType !== "SR-IOV") {
      form.setFields([{ name: `nicDevice-${index}`, value: undefined }]);
    }
  }, [nicType, form, index]);

  // 监听 netCardQosEnabled 变化，设置 QoS 默认值
  useEffect(() => {
    const inboundBandwidth = form.getFieldValue(`inboundBandwidth-${index}`);
    const outboundBandwidth = form.getFieldValue(`outboundBandwidth-${index}`);

    if (
      netCardQosEnabled &&
      !isEdit &&
      !(inboundBandwidth || outboundBandwidth)
    ) {
      const fields = {
        [`inboundBandwidth-${index}`]: {
          number: undefined,
          unit: nicBandWidthList[0],
        },
        [`outboundBandwidth-${index}`]: {
          number: undefined,
          unit: nicBandWidthList[0],
        },
      };
      form.setFieldsValue(fields);
    }
  }, [netCardQosEnabled, form, index, isEdit]);

  return (
    <div className={styles.content}>
      <Item
        label={intl.formatMessage({
          id: "enable.state",
          defaultMessage: "State",
        })}
        name={`netCardState-${index}`}
        valuePropName="checked"
      >
        {isEdit ? (
          <Switch disabled={disableItems.includes("netCardState")} />
        ) : (
          <FormCheckbox
            disabled={disableItems.includes("netCardState")}
            label={intl.formatMessage({
              id: "virtualization.start.width.endabled",
              defaultMessage: "Enable at Power On",
            })}
          />
        )}
      </Item>
      <Item noStyle shouldUpdate={(pre, cur) => pre.runPath !== cur.runPath}>
        {({ getFieldValue }) => {
          const runPath = getFieldValue("runPath");
          const isHost = ["HostVO", "Host"].includes(runPath?.[0]?.__typename);
          return (
            <Item
              label={intl.formatMessage({
                id: "virtualization.create.instance.hardware.network.card.netcard.type",
                defaultMessage: "NIC Model",
              })}
              name={`nicType-${index}`}
              tooltip={disabledConfig.tooltip}
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "vm.create.field.nicType.tooltip",
                    defaultMessage: `### NIC Model

Specifies the NIC model for the VM, with Linux defaulting to virtio and Windows to e1000.


* e1000: Emulates an Intel NIC to provide standard virtual networking suitable for basic connectivity needs.

* rtl8139: Emulates a Realtek NIC for scenarios that require compatibility with older operating systems or virtual machines, but not for high-performance or latency-sensitive application scenarios.

* virtio: A para-virtualized network driver with low CPU usage and high network throughput for high-performance network scenarios.

* SR-IOV: Virtualizes the physical NICs and cuts them into VF NICs and assigns them directly to VMs. This can achieve I/O performance close to that of physical devices and reduce the host CPU consumption.

* pcnet: Emulates an AMD PCnet NIC with excellent compatibility. Designed primarily for older guest operating systems such as Windows 2000/XP/NT 4.0 and legacy Linux distributions. Suitable for traditional system environments with low network demands.`,
                  })}
                </ReactMarkdown>
              }
            >
              <Select
                disabled={
                  (origin && disabledConfig.disabled) ||
                  disableItems.includes("nicType")
                }
                className={styles["width-200"]}
                width={120}
              >
                {[
                  ...netCardType,
                  ...(hasAuth({
                    type: "block",
                    resource: "vm",
                    authKey: "sriov",
                  })
                    ? [
                        {
                          label: "SR-IOV",
                          value: "SR-IOV",
                          disabled: !isHost,
                          disabledTooltip: intl.formatMessage({
                            id: "virtualization.create.vm.run.path.not.host.tooltip",
                            defaultMessage: "Host must be specified before binding...",
                          }),
                        },
                      ]
                    : []),
                ].map((item: any) => (
                  <Option
                    value={item.value}
                    key={item.value}
                    disabled={item.disabled}
                  >
                    {item.disabled && item.disabledTooltip ? (
                      <Tooltip title={item.disabledTooltip}>
                        {item.label}
                      </Tooltip>
                    ) : (
                      item.label
                    )}
                  </Option>
                ))}
              </Select>
            </Item>
          );
        }}
      </Item>
      <Item
        noStyle
        shouldUpdate={(pre, cur) => {
          const l3networkKeys = keys(pre).filter(
            (key) =>
              key.indexOf("l3NetworkUuids-") > -1 &&
              key !== `l3NetworkUuids-${index}`,
          );
          return (
            pre.runPath !== cur.runPath ||
            l3networkKeys.some((key) => pre[key] !== cur[key])
          );
        }}
      >
        {() => {
          const runPath = form.getFieldValue("runPath");

          const isL3Touched = form.isFieldTouched(`l3NetworkUuids-${index}`);
          const l3 = form.getFieldValue(`l3NetworkUuids-${index}`) ?? [];

          const values = form.getFieldsValue(true);

          const _l3NetworkUuids = keys(values)
            .filter(
              (key) =>
                key.indexOf("l3NetworkUuids-") > -1 && values?.[key]?.length,
            )
            .map((key) => values?.[key]?.[0]?.uuid);

          let defaultQuery = {};

          {
            //创建
            let extraConditions: any[] = [
              // {
              //   key: 'uuid',
              //   op: Op.notIn,
              //   values: l3NetworkUuids.filter(
              //     uuid => uuid !== values?.[`l3NetworkUuids-${index}`]?.[0]?.uuid
              //   )
              // },
              {
                key: "zoneUuid",
                op: Op.eq,
                value: zoneUuid,
              },
            ];

            //有运行位置，而且source不是cluster、host
            if (
              runPath &&
              ["Cluster", "HostVO"].indexOf(source?.__typename) === -1
            ) {
              let clusterUuid = "";
              if (runPath?.[0]?.__typename === "Cluster") {
                clusterUuid = runPath?.[0]?.uuid;
              }
              if (runPath?.[0]?.__typename === "HostVO") {
                clusterUuid = runPath?.[0]?.cluster?.uuid;
              }

              if (clusterUuid) {
                extraConditions.push({
                  key: "clusterUuid",
                  op: Op.eq,
                  value: clusterUuid,
                });
              }
            }

            if (source?.__typename === "Cluster") {
              extraConditions = extraConditions.concat([
                { key: "clusterUuid", op: Op.eq, value: source?.uuid },
              ]);
            }

            if (source?.__typename === "HostVO") {
              extraConditions = extraConditions.concat([
                { key: "clusterUuid", op: Op.eq, value: source?.cluster?.uuid },
                { key: "hostUuid", op: Op.eq, value: source?.uuid },
              ]);
            }

            if (source?.__typename === "VmInstance") {
              //修改vm配置
              extraConditions = extraConditions.concat([
                { key: "clusterUuid", op: Op.eq, value: source?.clusterUuid },
              ]);
            }

            defaultQuery = {
              type: L3NetworkQueryType.CreateInstance,
              conditions: [
                { key: "l2Network.cluster.type", value: "zstack", op: Op.eq },
                { key: "defaultFilter", value: "NOT_DEFAULT" },
                ...extraConditions,
              ],
            };
          }

          const noPortGroupPermission =
            !!origin && !!origin.l3NetworkUuid && !origin.l3Network?.uuid;

          return noPortGroupPermission ? (
            <Item
              label={intl.formatMessage({
                id: "virtualization.create.instance.hardware.network.card.port.group",
                defaultMessage: "Port Group",
              })}
            >
              <>
                <Tooltip
                  title={
                    intl.formatMessage(
                      {
                        id: "hardware.item.nic.name.show",
                        defaultMessage: `{l3Uuid}`,
                      },
                      {
                        l3Uuid: origin?.l3NetworkUuid,
                      },
                    ) ?? "No Auth"
                  }
                >
                  <div className={styles["l3-name"]}>
                    {intl.formatMessage(
                      {
                        id: "hardware.item.nic.name.show",
                        defaultMessage: `{l3Uuid}`,
                      },
                      {
                        l3Uuid: origin?.l3NetworkUuid,
                      },
                    ) ?? "No Auth"}
                  </div>
                </Tooltip>
              </>
            </Item>
          ) : (
            <Item
              label={intl.formatMessage({
                id: "virtualization.create.instance.hardware.network.card.port.group",
                defaultMessage: "Port Group",
              })}
              name={`l3NetworkUuids-${index}`}
              initialValue={[]}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({
                    id: "instance.field.l3NetworkUuids.validator.required",
                    defaultMessage: "Select Distributed Port Group",
                  }),
                },
              ]}
            >
              <PortGroupModalSelect
                index={index}
                title={intl.formatMessage({
                  id: "virtualization.create.instance.hardware.network.card.select.port.group",
                  defaultMessage: "Select Distributed Port Group",
                })}
                className={styles["width-200"]}
                autoSelect={
                  source?.__typename !== "VmInstance" &&
                  index === 0 &&
                  l3?.length === 0 &&
                  !isL3Touched
                }
                autoSelectGql={queryL3NetworkList}
                modalWidth={800}
                onChange={() => {
                  form.setFields([
                    {
                      name: `appointIpv4-${index}`,
                      value: false,
                    },
                    {
                      name: `appointIpv6-${index}`,
                      value: false,
                    },
                    {
                      name: `ipv4-${index}`,
                      value: undefined,
                    },
                    {
                      name: `ipv6-${index}`,
                      value: undefined,
                    },
                    {
                      name: `netmask-${index}`,
                      value: undefined,
                    },
                    {
                      name: `prefixLen-${index}`,
                      value: undefined,
                    },
                    {
                      name: `gateway4-${index}`,
                      value: undefined,
                    },
                    {
                      name: `gateway6-${index}`,
                      value: undefined,
                    },
                  ]);
                }}
                disabledItem={disableItems.includes("l3NetworkUuids")}
              >
                <L3NetworkList
                  view="select.virtualization"
                  defaultQuery={defaultQuery}
                  className={styles.l3network}
                />
              </PortGroupModalSelect>
            </Item>
          );
        }}
      </Item>
      <Item
        noStyle
        shouldUpdate={(pre, cur) =>
          pre[`nicType-${index}`] !== cur[`nicType-${index}`] ||
          pre[`l3NetworkUuids-${index}`] !== cur[`l3NetworkUuids-${index}`] ||
          pre.runPath !== cur.runPath
        }
      >
        {({ getFieldValue }) => {
          const runPath = getFieldValue("runPath");
          const l3NetworkUuid =
            form.getFieldValue(`l3NetworkUuids-${index}`)?.[0]?.uuid ?? "";
          const nicType = getFieldValue(`nicType-${index}`);

          const hostUuid = ["HostVO", "Host"].includes(runPath?.[0]?.__typename)
            ? runPath[0].uuid
            : "";

          const defaultQuery = {
            type: PhysicalNicQueryType.getCandidatesPhysicalNicForCreateByInVM,
            conditions: [
              { key: "hostUuid", op: Op.eq, value: hostUuid },
              {
                key: "virtStatus",
                op: Op.eq,
                value: "SRIOV_VIRTUALIZED",
              },
              {
                key: "carrierActive",
                op: Op.eq,
                value: true,
              },
              {
                key: "l3NetworkUuid",
                op: Op.eq,
                value: l3NetworkUuid,
              },
            ],
          };

          return nicType === "SR-IOV" ? (
            <Item
              label={intl.formatMessage({
                id: "virtualization.create.instance.hardware.network.card.nic.device",
                defaultMessage: "NIC Device",
              })}
              name={`nicDevice-${index}`}
              required
            >
              <ModalSelect
                title={intl.formatMessage({
                  id: "virtualization.create.instance.hardware.network.card.select.nic.device",
                  defaultMessage: "Select NIC Device",
                })}
                transformKey="interfaceName"
                className={styles["width-200"]}
                modalWidth={800}
                autoDispatch
              >
                <PhysicalNicList
                  view="select.sriov.physicalNic"
                  defaultQuery={defaultQuery}
                  rowSelection={{
                    getCheckboxProps: (record: PhysicalNic) => ({
                      disabled:
                        !record.pciDevice?.vfAvailableNum?.vfAvailableNum,
                    }),
                  }}
                />
              </ModalSelect>
            </Item>
          ) : null;
        }}
      </Item>
      <Item
        noStyle
        shouldUpdate={(pre, cur) =>
          pre.totalCoreNum !== cur.totalCoreNum || pre.runPath !== cur.runPath
        }
      >
        {() => {
          //同步修改在changeCpuNum中处理
          return (
            <Item
              label={intl.formatMessage({
                id: "virtualization.create.instance.hardware.network.card.nicMultiQueueNum",
                defaultMessage: "NIC Queue Number",
              })}
              validateTrigger="onChange"
              rules={[
                {
                  validator(_rule, val) {
                    if (!val) {
                      return Promise.resolve();
                    }

                    if (!Number.isInteger(Number(val))) {
                      return Promise.reject(
                        intl.formatMessage({
                          id: "global.field.validator.numberRange.isInteger",
                          defaultMessage: "Please enter an integer.",
                        }),
                      );
                    }

                    return Number(val) <= 256 && Number(val) > 0
                      ? Promise.resolve()
                      : Promise.reject(
                          intl.formatMessage(
                            {
                              id: "global.field.validator.numberRange",
                              defaultMessage: "Allowed range: {min}–{max}.",
                            },
                            {
                              min: 1,
                              max: 256,
                            },
                          ),
                        );
                  },
                },
              ]}
              name={`nicMultiQueueNum-${index}`}
              tooltip={origin && disabledConfig.tooltip}
            >
              <Input
                disabled={
                  (origin && disabledConfig.disabled) ||
                  disableItems.includes("nicMultiQueueNum")
                }
                className={styles["width-200"]}
              />
            </Item>
          );
        }}
      </Item>
      <Item
        noStyle
        shouldUpdate={(pre, cur) =>
          pre.count > 1 !== cur.count > 1 ||
          pre.guest !== cur.guest ||
          pre[`l3NetworkUuids-${index}`] !== cur[`l3NetworkUuids-${index}`]
        }
      >
        {({ getFieldValue }) => {
          const selectedPortGroup = getFieldValue(
            `l3NetworkUuids-${index}`,
          )?.[0];
          const isBatchCreate = getFieldValue("count") > 1;
          const guest = getFieldValue("guest");

          if (!selectedPortGroup) {
            return null;
          }

          return (
            <>
              <Item
                label={intl.formatMessage({
                  id: "virtualization.create.instance.hardware.network.card.mac",
                  defaultMessage: "MAC Address",
                })}
                name={`customMac-${index}`}
                rules={[
                  {
                    validator(_rule, val) {
                      if (!val) {
                        return Promise.resolve();
                      }
                      const reg = /^([A-Fa-f0-9]{2}:){5}[A-Fa-f0-9]{2}$/;
                      const result = reg.test(val);

                      const firstByte = parseInt(val.substring(0, 2), 16);

                      if ((firstByte & 1) === 1) {
                        return Promise.reject(
                          intl.formatMessage({
                            id: "virtualization.field.MAC.validator.multicastMac",
                            defaultMessage: "Enter an unicast MAC address.",
                          }),
                        );
                      }

                      return result
                        ? Promise.resolve()
                        : Promise.reject(
                            intl.formatMessage({
                              id: "virtualization.field.MAC.validator.format",
                              defaultMessage: "Invalid MAC address.",
                            }),
                          );
                    },
                  },
                ]}
                tooltip={origin && disabledConfig.tooltip}
                icon="info"
                iconTooltip={
                  <ReactMarkdown>
                    {intl.formatMessage({
                      id: "vm.template.create.field.mac.address.tooltip",
                      defaultMessage:
                        "vm.template.create.field.mac.address.tooltip",
                    })}
                  </ReactMarkdown>
                }
              >
                <Input
                  disabled={
                    (origin && disabledConfig.disabled) ||
                    disableItems.includes("customMac") ||
                    isBatchCreate
                  }
                  className={styles["width-200"]}
                  placeholder={intl.formatMessage({
                    id: "auto.generate",
                    defaultMessage: "Auto Generated",
                  })}
                />
              </Item>
              <IpField
                index={index}
                displayIndex={displayIndex}
                selectedPortGroup={selectedPortGroup}
                guest={guest}
                originalValue={origin}
                source={vmTemplate}
                disabled={isBatchCreate}
              />
            </>
          );
        }}
      </Item>
      <Item
        noStyle
        auth={{
          type: "block",
          authKey: "view",
          resource: "security.group",
        }}
        shouldUpdate={(pre, cur) =>
          pre[`securityGroup-${index}`] !== cur[`securityGroup-${index}`] ||
          pre[`nicType-${index}`] !== cur[`nicType-${index}`]
        }
      >
        {({ getFieldValue, setFields }) => {
          const selectedSgList: ISecurityGroup[] = compact(
            getFieldValue(`securityGroup-${index}`),
          );

          if (getFieldValue(`nicType-${index}`) === "SR-IOV") {
            return null;
          }

          return (
            <Item
              label={intl.formatMessage({
                id: "virtualization.create.instance.hardware.network.card.securityGroup",
                defaultMessage: "Security Group",
              })}
              name={`securityGroup-${index}`}
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "virtualization.create.instance.hardware.network.card.securityGroup.iconTooltip",
                    defaultMessage: `### Security Group

The security group rules are ordered by priority. A smaller number indicates a higher priority. Configure carefully to prevent rule conflicts between security groups.`,
                  })}
                </ReactMarkdown>
              }
            >
              <ModalSelect
                title={intl.formatMessage({
                  id: "virtualization.create.instance.hardware.network.card.select.securityGroup",
                  defaultMessage: "Select Security Group",
                })}
                selectType="checkbox"
                className={styles["width-200"]}
                modalWidth={800}
                label={intl.formatMessage({
                  id: "add.sg",
                  defaultMessage: "Add Security Group",
                })}
                disabledItem={disableItems.includes("securityGroup")}
                disabledBtn={disableItems.includes("securityGroup")}
                renderSelectedList={() => {
                  return (
                    <SortableList
                      className={styles.sortableList}
                      dataSource={compact(selectedSgList).map((it, i) => ({
                        ...it,
                        key: it.uuid,
                        index: i + 1,
                        content: (
                          <div>
                            <Text>{it.name}</Text>
                          </div>
                        ),
                      }))}
                      // @ts-expect-error
                      onSortEnd={(dataSource: ISecurityGroup[]) => {
                        setFields([
                          {
                            name: `securityGroup-${index}`,
                            value: dataSource,
                          },
                        ]);
                      }}
                      // @ts-expect-error
                      onTrash={(item: ISecurityGroup) => {
                        setFields([
                          {
                            name: `securityGroup-${index}`,
                            value: selectedSgList.filter(
                              (it) => it.uuid !== item.uuid,
                            ),
                          },
                        ]);
                      }}
                    />
                  );
                }}
              >
                <SecurityGroupList view="select" />
              </ModalSelect>
            </Item>
          );
        }}
      </Item>
      <Item
        noStyle
        shouldUpdate={(pre, cur) =>
          pre[`securityGroup-${index}`] !== cur[`securityGroup-${index}`]
        }
      >
        {({ getFieldValue }) => {
          const isExitedNic = false;

          const selectedSgList: ISecurityGroup[] = compact(
            getFieldValue(`securityGroup-${index}`),
          );

          return isExitedNic && selectedSgList.length > 0 ? (
            <VmNicDefaultNetflowStrategy
              width="s"
              ingressPolicyName={`ingressPolicy-${index}`}
              egressPolicyName={`egressPolicy-${index}`}
            />
          ) : null;
        }}
      </Item>
      <Item
        noStyle
        shouldUpdate={(pre, cur) =>
          pre[`nicType-${index}`] !== cur[`nicType-${index}`]
        }
      >
        {({ getFieldValue }) => {
          const nicType = getFieldValue(`nicType-${index}`);
          if (nicType === "SR-IOV") {
            return null;
          }
          return (
            <Item
              label={intl.formatMessage({
                id: "nic.qos",
                defaultMessage: "NIC QoS",
              })}
              name={`netCardQosEnabled-${index}`}
              valuePropName="checked"
            >
              <Switch disabled={disableItems.includes("netCardQosEnabled")} />
            </Item>
          );
        }}
      </Item>
      <Item
        noStyle
        shouldUpdate={(curr, prev) =>
          curr[`netCardQosEnabled-${index}`] !==
          prev[`netCardQosEnabled-${index}`]
        }
      >
        {({ getFieldValue }) => {
          const enableFlag = getFieldValue(`netCardQosEnabled-${index}`);
          return enableFlag ? (
            <>
              <ZSVForm.Card showLine className={styles.card}>
                <Item
                  name={`outboundBandwidth-${index}`}
                  label={intl.formatMessage({
                    id: "sed.boundBandwidth",
                    defaultMessage: "Transmit Bandwidth",
                  })}
                  validateFirst
                  dependencies={[`inboundBandwidth-${index}`]}
                  rules={[
                    {
                      validator: (_rule, val) =>
                        validateBandwidth(
                          val,
                          intl.formatMessage({
                            id: "vm.field.outbound.validator.invalid",
                            defaultMessage: "Invalid upstream bandwidth",
                          }),
                        ),
                    },
                  ]}
                >
                  <InputUnit
                    unitList={nicBandWidthList}
                    disabled={disableItems.includes("outboundBandwidth")}
                    tooltip={intl.formatMessage({
                      id: "vm.field.bandwidth.tooltip",
                      defaultMessage: "Bandwidth range: 8 Kpbs – 30 Gbps",
                    })}
                  />
                </Item>
                <Item
                  name={`inboundBandwidth-${index}`}
                  label={intl.formatMessage({
                    id: "receive.boundBandwidth",
                    defaultMessage: "Receive Bandwidth",
                  })}
                  validateFirst
                  dependencies={[`inboundBandwidth-${index}`]}
                  rules={[
                    {
                      validator: (_rule, val) =>
                        validateBandwidth(
                          val,
                          intl.formatMessage({
                            id: "vm.inbound.validator.invalid",
                            defaultMessage: "Invalid downstream bandwidth.",
                          }),
                        ),
                    },
                  ]}
                >
                  <InputUnit
                    unitList={nicBandWidthList}
                    tooltip={intl.formatMessage({
                      id: "vm.field.bandwidth.tooltip",
                      defaultMessage: "Bandwidth range: 8 Kpbs – 30 Gbps",
                    })}
                    disabled={disableItems.includes("inboundBandwidth")}
                  />
                </Item>
              </ZSVForm.Card>
            </>
          ) : null;
        }}
      </Item>
    </div>
  );
};

export default React.memo(NetCard);
