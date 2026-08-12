import { gql } from "@apollo/client";
import { Text } from "@zstack/design";
import { ModalSelect } from "@zstack/zsphere-components";
import { Form, Input, SortableList } from "@zstack/zsphere-components";
import type { FormCreateType } from "@zstack/zsphere-types";
import {
  L3NetworkQueryType,
  Op,
  SecurityGroupState,
} from "@zstack/zsphere-types";
import type {
  SecurityGroup as ISecurityGroup,
  VmNic as IVmNic,
} from "@zstack/zsphere-types/graphql";
import { isNil, compact, keys } from "lodash-es";
import React, { useContext, useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import L3NetworkList from "../../../../../../../l3-network/list-plain/l3-network-plain-list";
import { SecurityGroupPlainList } from "../../../../../../../security-group/mf-index";
import { ConfigContext } from "../../../../context";
import IpField from "./components/ip-field";
import { PortGroupModalSelect } from "./components/port-group";
import { VmNicDefaultNetflowStrategy } from "./components/VmNicNetflowStrategy";

import styles from "./style.module.less";

const queryL3NetworkListForCreateInstance = gql`
  query queryL3NetworkListForCreateInstance(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $type: L3NetworkQueryType
    $extraConditions: [Condition!]
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    l3NetworkList(
      conditions: $conditions
      start: $start
      limit: $limit
      type: $type
      extraConditions: $extraConditions
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      list {
        name
        portGroup {
          uuid
          vlanId
        }
        createDate
        enableIPAM
        dns
        ipCapacity {
          totalCapacity
          availableCapacity
          ipv4AvailableCapacity
          ipv6AvailableCapacity
          ipv4TotalCapacity
          ipv6TotalCapacity
          ipv4UsedIpAddressNumber
        }
        ipRanges {
          addressMode
          createDate
          endIp
          gateway
          shareType
          ipCapacity {
            totalCapacity
            availableCapacity
            ipv4AvailableCapacity
            ipv6AvailableCapacity
            ipv4TotalCapacity
            ipv6TotalCapacity
            ipv4UsedIpAddressNumber
          }
          ipRangeType
          ipVersion
          l3NetworkUuid
          name
          netmask
          networkCidr
          prefixLen
          startIp
          uuid
          linkResource {
            vm
            vrouter
          }
        }
        networkServices {
          networkServiceType
        }
        uuid
        shareType
      }
      total
    }
  }
`;

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
}

const { Item } = Form;

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

const NetCard: React.FC<IProps> = ({
  form,
  index,
  displayIndex,
  zoneUuid,
  source,
  origin,
}) => {
  const intl = useIntl();
  const disabledConfig = useContext(ConfigContext);

  // 计算 autoSelect 条件 - 使用 useMemo 来优化性能，与 port-group.tsx 保持一致
  const shouldAutoSelect = useMemo(() => {
    const l3NetworkUuids = form.getFieldValue(`l3NetworkUuids-${index}`) ?? [];
    const isL3Touched = form.isFieldTouched(`l3NetworkUuids-${index}`);

    return (
      source?.__typename !== "VmInstance" &&
      index === 0 &&
      l3NetworkUuids?.length === 0 &&
      !isL3Touched
    );
  }, [form, index, source]);

  const defaultExtraConditions: any[] = useMemo(() => {
    return [
      {
        key: "zoneUuid",
        op: Op.eq,
        value: zoneUuid,
      },
    ];
  }, [zoneUuid]);

  const updateExtraConditions = (
    source: any,
    runPath: any,
    extraConditions: any[],
  ) => {
    if (runPath && ["Cluster", "HostVO"].indexOf(source?.__typename) === -1) {
      let clusterUuid = "";
      if (runPath?.[0]?.__typename === "Cluster") {
        clusterUuid = runPath?.[0]?.uuid;
      } else if (runPath?.[0]?.__typename === "HostVO") {
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

    if (source) {
      switch (source.__typename) {
        case "Cluster":
          extraConditions.push({
            key: "clusterUuid",
            op: Op.eq,
            value: source.uuid,
          });
          break;
        case "HostVO":
          extraConditions.push({
            key: "clusterUuid",
            op: Op.eq,
            value: source.cluster.uuid,
          });
          extraConditions.push({
            key: "hostUuid",
            op: Op.eq,
            value: source.uuid,
          });
          break;
        case "VmInstance":
          extraConditions.push({
            key: "clusterUuid",
            op: Op.eq,
            value: source.clusterUuid,
          });
          if (source.hostUuid || source.lastHostUuid) {
            extraConditions.push({
              key: "hostUuid",
              op: Op.eq,
              value: source.hostUuid || source.lastHostUuid,
            });
          }
          break;
      }
    }

    return extraConditions;
  };

  return (
    <div className={styles.content}>
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
            l3networkKeys.some((key) => pre[key] !== cur[key]) ||
            pre[`nicType-${index}`] !== cur[`nicType-${index}`]
          );
        }}
      >
        {() => {
          const runPath = form.getFieldValue("runPath");
          const isRunPathTouched = form.isFieldTouched("runPath");
          const l3 = form.getFieldValue(`l3NetworkUuids-${index}`) ?? [];

          const l3NetworkUuidsDisabled = (source?.state !== "Stopped" &&
            form.getFieldValue(`nicType-${index}`) === "SR-IOV" &&
            origin) as boolean;

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
              l3?.[0]?.l2Network?.attachedClusterUuids?.indexOf(clusterUuid) ===
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

          const values = form.getFieldsValue(true);

          const l3NetworkUuids = keys(values)
            .filter(
              (key) =>
                key.indexOf("l3NetworkUuids-") > -1 && values?.[key]?.length,
            )
            .map((key) => values?.[key]?.[0]?.uuid);

          const baseConditions = [
            { key: "l2Network.cluster.type", value: "zstack", op: Op.eq },
            { key: "defaultFilter", value: "NOT_DEFAULT" },
          ];

          //判断是否已存在网卡
          const isExitedNic = !!origin?.uuid;
          let defaultQuery = {};

          if (isExitedNic) {
            //编辑虚拟机且已经存在
            defaultQuery = {
              type: L3NetworkQueryType.SetIPAddress,
              conditions: baseConditions,
              extraConditions: [
                {
                  key: "l3NetworkUuids",
                  values: l3NetworkUuids,
                  op: Op.in,
                },
                {
                  key: "vmNicUuids",
                  values: source.vmNics.map((it: any) => it.uuid),
                  op: Op.in,
                },
              ],
            };
          } else {
            const extraConditions = updateExtraConditions(source, runPath, [
              ...defaultExtraConditions,
            ]);
            defaultQuery = {
              type: L3NetworkQueryType.CreateInstance,
              conditions: [...baseConditions, ...extraConditions],
            };
          }

          return isExitedNic ? (
            <Item
              label={intl.formatMessage({
                id: "virtualization.create.instance.hardware.network.card.port.group",
                defaultMessage: "Port Group",
              })}
              name={`l3NetworkUuids-${index}`}
              tooltip={
                form.getFieldValue(`nicType-${index}`) === "SR-IOV" && origin
                  ? disabledConfig.tooltip
                  : undefined
              }
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
              {origin?.l3Network?.uuid ? (
                <PortGroupModalSelect
                  index={index}
                  title={intl.formatMessage({
                    id: "virtualization.create.instance.hardware.network.card.select.port.group",
                    defaultMessage: "Select Distributed Port Group",
                  })}
                  className={styles["width-200"]}
                  autoSelect={shouldAutoSelect}
                  autoSelectGql={queryL3NetworkListForCreateInstance}
                  modalWidth={800}
                  disabledItem={l3NetworkUuidsDisabled}
                  onChange={() => {
                    console.log("-->>>11");
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
                    gql={queryL3NetworkListForCreateInstance}
                  />
                </PortGroupModalSelect>
              ) : (
                <div style={{ width: 200 }}>
                  {origin?.l3NetworkUuid ?? "No Auth"}
                </div>
              )}
            </Item>
          ) : (
            <Item
              label={intl.formatMessage({
                id: "virtualization.create.instance.hardware.network.card.port.group",
                defaultMessage: "Port Group",
              })}
              name={`l3NetworkUuids-${index}`}
              initialValue={[]}
              tooltip={
                form.getFieldValue(`nicType-${index}`) === "SR-IOV" && origin
                  ? disabledConfig.tooltip
                  : undefined
              }
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
                disabledItem={l3NetworkUuidsDisabled}
                className={styles["width-200"]}
                autoSelect={shouldAutoSelect}
                autoSelectGql={queryL3NetworkListForCreateInstance}
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
                  gql={queryL3NetworkListForCreateInstance}
                />
              </PortGroupModalSelect>
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
                tooltip={origin && disabledConfig.tooltip}
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
                  disabled={origin && disabledConfig.disabled}
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
                guest={guest}
                selectedPortGroup={selectedPortGroup}
                source={source}
              />
            </>
          );
        }}
      </Item>
      <Item
        noStyle
        shouldUpdate={(pre, cur) =>
          pre[`nicType-${index}`] !== cur[`nicType-${index}`]
        }
      >
        {() => {
          return form.getFieldValue(`nicType-${index}`) !== "SR-IOV" ? (
            <>
              <Item
                noStyle
                shouldUpdate={(pre, cur) =>
                  pre[`securityGroup-${index}`] !==
                  cur[`securityGroup-${index}`]
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
                              dataSource={compact(selectedSgList).map(
                                (it, i) => ({
                                  ...it,
                                  key: it.uuid,
                                  index: i + 1,
                                  content: (
                                    <div>
                                      <Text>{it.name}</Text>
                                    </div>
                                  ),
                                }),
                              )}
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
                        <SecurityGroupPlainList
                          view="select"
                          defaultQuery={{
                            conditions: [
                              {
                                key: "state",
                                op: Op.notIn,
                                values: [SecurityGroupState.Disabled],
                              },
                            ],
                          }}
                        />
                      </ModalSelect>
                    </Item>
                  );
                }}
              </Item>
              <Item
                noStyle
                shouldUpdate={(pre, cur) =>
                  pre[`securityGroup-${index}`] !==
                  cur[`securityGroup-${index}`]
                }
              >
                {({ getFieldValue }) => {
                  const isExitedNic = !!origin?.uuid;

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
            </>
          ) : null;
        }}
      </Item>
    </div>
  );
};

export default React.memo(NetCard);
