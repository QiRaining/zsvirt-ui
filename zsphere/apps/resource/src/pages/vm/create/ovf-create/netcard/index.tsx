import { Text } from "@zstack/design";
import L3NetworkList from "@zstack/virtualization-resource/src/pages/l3-network/list";
import { VmNicDefaultNetflowStrategy } from "@zstack/virtualization-resource/src/pages/security-group/components/VmNicNetflowStrategy";
import SecurityGroupList from "@zstack/virtualization-resource/src/pages/security-group/list";
import IpField from "@zstack/virtualization-resource/src/pages/vm/create/hardware-and-config/hardware/netcard/components/ip-field";
import { PortGroupModalSelect } from "@zstack/virtualization-resource/src/pages/vm/create/hardware-and-config/hardware/netcard/components/port-group";
import {
  Form,
  Input,
  InputUnit,
  ModalSelect,
  Select,
  SortableList,
  Switch,
  ZSVForm,
} from "@zstack/zsphere-components";
import type { FormCreateType } from "@zstack/zsphere-types";
import { L3NetworkQueryType, Op } from "@zstack/zsphere-types";
import type { SecurityGroup as ISecurityGroup } from "@zstack/zsphere-types/graphql";
import { isNil, keys, compact } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import styles from "./style.module.less";

interface IProps {
  hideTag?: boolean;
  hideDescription?: boolean;
  hideQuantity?: boolean;
  setFields?: Function;
  formCreateType?: FormCreateType;
  form: any;
  index: number;
  zoneUuid: string;
  source: any;
  isEdit?: boolean;
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

const NetCard: React.FC<IProps> = ({
  form,
  index,
  zoneUuid,
  source,
  isEdit = false,
}) => {
  const intl = useIntl();

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
        <Switch />
      </Item>
      <Item
        label={intl.formatMessage({
          id: "virtualization.create.instance.hardware.network.card.netcard.type",
          defaultMessage: "NIC Model",
        })}
        name={`nicType-${index}`}
        //tooltip={disabledConfig.tooltip}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "vm.create.field.nicType.tooltip",
              defaultMessage:
                "### NIC Model\n\nSpecifies the NIC model for the VM, with Linux defaulting to virtio and Windows to e1000.\n\n\n* e1000: Emulates an Intel NIC to provide standard virtual networking suitable for basic connectivity needs.\n\n* rtl8139: Emulates a Realtek NIC for scenarios that require compatibility with older operating systems or virtual machines, but not for high-performance or latency-sensitive application scenarios.\n\n* virtio: A para-virtualized network driver with low CPU usage and high network throughput for high-performance network scenarios.\n\n* SR-IOV: Virtualizes the physical NICs and cuts them into VF NICs and assigns them directly to VMs. This can achieve I/O performance close to that of physical devices and reduce the host CPU consumption.\n\n* pcnet: Emulates an AMD PCnet NIC with excellent compatibility. Designed primarily for older guest operating systems such as Windows 2000/XP/NT 4.0 and legacy Linux distributions. Suitable for traditional system environments with low network demands.",
            })}
          </ReactMarkdown>
        }
      >
        <Select className={styles["width-200"]} width={120}>
          {netCardType.map((t) => (
            <Option value={t.value} key={t.value}>{`${t.label}`}</Option>
          ))}
        </Select>
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
            pre.backupStorage !== cur.backupStorage ||
            pre.runPath !== cur.runPath ||
            l3networkKeys.some((key) => pre[key] !== cur[key])
          );
        }}
      >
        {() => {
          const runPath = form.getFieldValue("runPath");

          const backupStorage = form.getFieldValue("backupStorage");

          const isRunPathTouched = form.isFieldTouched("runPath");
          const l3 = form.getFieldValue(`l3NetworkUuids-${index}`) ?? [];
          //如果改变runpath，且换了cluster，那么清空端口组
          if (isRunPathTouched && l3.length !== 0) {
            let clusterUuid = "";
            if (runPath?.[0]?.__typename === "Cluster") {
              clusterUuid = runPath?.[0]?.uuid;
            }
            if (runPath?.[0]?.__typename === "HostVO") {
              clusterUuid = runPath?.[0]?.cluster?.uuid;
            }

            if (
              l3?.[0]?.l2Network?.attachedClusterUuids.indexOf(clusterUuid) ===
              -1
            ) {
              form.setFields([
                {
                  name: `l3NetworkUuids-${index}`,
                  value: [],
                },
              ]);
            }
          }

          let defaultQuery = {};

          //创建
          let l3Querytype = L3NetworkQueryType.CreateInstance;
          let extraConditions: any[] = [];
          const condition: any[] = [
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
              condition.push({
                key: "clusterUuid",
                op: Op.eq,
                value: clusterUuid,
              });
            }
          }

          if (source?.__typename === "Cluster") {
            extraConditions = [
              { key: "clusterUuid", op: Op.eq, value: source?.uuid },
            ];
          }

          if (source?.__typename === "HostVO") {
            extraConditions = [
              { key: "clusterUuid", op: Op.eq, value: source?.cluster?.uuid },
              { key: "hostUuid", op: Op.eq, value: source?.uuid },
            ];
          }

          if (backupStorage && backupStorage?.length !== 0) {
            l3Querytype = L3NetworkQueryType.CREATE_OVF;
            extraConditions = [
              {
                key: "backupStorageUuid",
                op: Op.eq,
                value: backupStorage?.[0]?.uuid,
              },
              { key: "zoneUuid", op: Op.eq, value: zoneUuid },
            ];
          }

          defaultQuery = {
            type: l3Querytype,
            conditions: [
              { key: "l2Network.cluster.type", value: "zstack", op: Op.eq },
              { key: "defaultFilter", value: "NOT_DEFAULT" },
              ...condition,
            ],
            extraConditions,
          };

          return (
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
                //导入型不需要自动选择
                autoSelect={false}
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
              //  tooltip={origin && disabledConfig.tooltip}
            >
              <Input
                //disabled={origin && disabledConfig.disabled}
                className={styles["width-200"]}
              />
            </Item>
          );
        }}
      </Item>
      <Item
        noStyle
        shouldUpdate={(pre, cur) =>
          pre.guest !== cur.guest ||
          pre[`l3NetworkUuids-${index}`] !== cur[`l3NetworkUuids-${index}`]
        }
      >
        {({ getFieldValue }) => {
          const selectedPortGroup = getFieldValue(
            `l3NetworkUuids-${index}`,
          )?.[0];
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
                //tooltip={origin && disabledConfig.tooltip}
                icon="info"
                iconTooltip={
                  <ReactMarkdown>
                    {intl.formatMessage({
                      id: "vm.create.field.macaddress.tooltip",
                      defaultMessage:
                        "### MAC Address\n\nBy default, the system automatically assigns the MAC address. You can also specify a MAC address for your VM.\n\nNote: If VMs are created in bulk, the assigned MAC address will default to be the start MAC address, and the rest available MAC addresses will be continuously assigned. When a MAC address has been occupied within the range, the corresponding VM cannot be created.",
                    })}
                  </ReactMarkdown>
                }
              >
                <Input
                  //disabled={origin && disabledConfig.disabled}
                  className={styles["width-200"]}
                  placeholder={intl.formatMessage({
                    id: "auto.generate",
                    defaultMessage: "Auto Generated",
                  })}
                />
              </Item>
              <IpField
                index={index}
                selectedPortGroup={selectedPortGroup}
                guest={guest}
                hideDns
                source={source}
              />
            </>
          );
        }}
      </Item>
      <Item
        noStyle
        shouldUpdate={(pre, cur) =>
          pre[`securityGroup-${index}`] !== cur[`securityGroup-${index}`]
        }
      >
        {({ getFieldValue, setFields }) => {
          const selectedSgList: ISecurityGroup[] = compact(
            getFieldValue(`securityGroup-${index}`),
          );

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
          const selectedSgList: ISecurityGroup[] = compact(
            getFieldValue(`securityGroup-${index}`),
          );

          return selectedSgList.length > 0 ? (
            <VmNicDefaultNetflowStrategy
              width="s"
              ingressPolicyName={`ingressPolicy-${index}`}
              egressPolicyName={`egressPolicy-${index}`}
            />
          ) : null;
        }}
      </Item>
      <Item
        label={intl.formatMessage({
          id: "nic.qos",
          defaultMessage: "NIC QoS",
        })}
        name={`netCardQosEnabled-${index}`}
        valuePropName="checked"
      >
        <Switch />
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
          const inboundBandwidth = getFieldValue(`inboundBandwidth-${index}`);
          const outboundBandwidth = getFieldValue(`outboundBandwidth-${index}`);
          if (
            enableFlag &&
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
