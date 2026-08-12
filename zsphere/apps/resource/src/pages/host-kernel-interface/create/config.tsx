import { useMutation, useLazyQuery } from "@apollo/client";
import { Text } from "@zstack/design";
import {
  checkIpAvailability,
  getFreeIpOfL3Network,
} from "@zstack/virtualization-resource/src/gql/l3-network.gql";
import { Form, Input } from "@zstack/zsphere-components";
import { ZSVForm, ModalSelect, FormTable } from "@zstack/zsphere-components";
import { DialogWeak, useDialogFormContext } from "@zstack/zsphere-design-biz";
import { useValidator, IIsRequiredType } from "@zstack/zsphere-hooks";
import type { IQuery } from "@zstack/zsphere-types";
import { Op, HostStatus, KernelTrafficTypes } from "@zstack/zsphere-types";
import type {
  L3Network as IL3Network,
  MutationcheckIpAvailabilityArgs as CheckIpAvailabilityArgs,
  CheckIpAvailabilityResult,
  Host,
} from "@zstack/zsphere-types/graphql";
import { ipToInt, isIP, getGQL } from "@zstack/zsphere-utils";
import type { FormInstance } from "antd/es/form";
import { compact, isEmpty } from "lodash-es";
import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";

import { hostList } from "../../../gql/host.gql";
import HostList from "../../host/list";
import L3NetworkList from "../../l3-network/list";
import { useKernelTrafficTypesMap } from "../hooks";
import IpInput from "./components/ip-input";
import type { ISelectedResource, ISource } from "./hooks";
import { useResource } from "./hooks";

import style from "./style.module.less";

export interface IProps {
  form: FormInstance;
  onHostsChange?: (hosts: any[]) => void;
}

interface CheckIpAvailabilityResp {
  checkIpAvailability?: CheckIpAvailabilityResult;
}

const getHostList = getGQL(hostList, [
  "state",
  "uuid",
  "name",
  "architecture",
  "createDate",
  "managementIp",
  "status",
]);

const Config: React.FC<IProps> = ({ form, onHostsChange }) => {
  const intl = useIntl();
  const [selectedHostList, setSelectedHostList] = useState<any[]>([]);
  const [availableIps, setAvailableIps] = useState<string[]>([]);
  const [usedIps, setUsedIps] = useState<Set<string>>(new Set());
  const [ipInsufficientVisible, setIpInsufficientVisible] = useState(false);

  const { isRequired, ipValidator, netmaskValidator } = useValidator(intl);
  const { kernelTrafficTypesMap } = useKernelTrafficTypesMap();

  const [remoteValidateIp] = useMutation<
    CheckIpAvailabilityResp,
    CheckIpAvailabilityArgs
  >(checkIpAvailability);
  const [getFreeIps] = useLazyQuery(getFreeIpOfL3Network, {
    fetchPolicy: "no-cache",
    onCompleted: (data) => {
      if (data?.getFreeIpOfL3Network?.ipv4List) {
        setAvailableIps(data.getFreeIpOfL3Network.ipv4List);
      }
    },
  });

  const { source, selectedList } = useDialogFormContext<
    ISource,
    ISelectedResource
  >();

  const { host, l3Network } = useResource(selectedList!, source);

  useEffect(() => {
    if (l3Network.uuid) {
      getFreeIps({
        variables: { l3NetworkUuid: l3Network.uuid, ipVersion: 4 },
      });
    }
  }, [l3Network.uuid]);

  const autoAssignIps = React.useCallback(
    (newHosts: any[]) => {
      if (!l3Network.enableIPAM || availableIps.length === 0) {
        return;
      }

      const currentUsedIps = new Set(usedIps);

      const neededIps = newHosts.filter(
        (hostItem) => !form.getFieldValue(["ipv4Address", hostItem.uuid]),
      ).length;

      const availableCount = availableIps.filter(
        (ip) => !currentUsedIps.has(ip),
      ).length;

      if (neededIps > availableCount) {
        setIpInsufficientVisible(true);
        return;
      }

      // IP数量足够，开始分配
      const newAssignments: { [key: string]: string } = {};
      let ipIndex = 0;

      // 检查每个新主机是否需要分配IP
      for (const hostItem of newHosts ?? []) {
        const currentIp = form.getFieldValue(["ipv4Address", hostItem.uuid]);
        if (!currentIp && ipIndex < availableIps.length) {
          // 找到下一个未使用的IP
          while (
            ipIndex < availableIps.length &&
            currentUsedIps.has(availableIps[ipIndex])
          ) {
            ipIndex++;
          }

          if (ipIndex < availableIps.length) {
            const assignedIp = availableIps[ipIndex];
            newAssignments[hostItem.uuid] = assignedIp;
            currentUsedIps.add(assignedIp);
            ipIndex++;
          }
        } else if (currentIp) {
          currentUsedIps.add(currentIp);
        }
      }

      if (Object.keys(newAssignments).length > 0) {
        const ipv4AddressField = form.getFieldValue("ipv4Address") || {};
        const netmaskField = form.getFieldValue("netmask") || {};

        Object.keys(newAssignments).forEach((hostUuid) => {
          ipv4AddressField[hostUuid] = newAssignments[hostUuid];
          if (l3Network.enableIPAM) {
            const netmask = l3Network.ipRanges?.find(
              (ip) => ip.ipVersion === 4 && ip.ipRangeType === "Normal",
            )?.netmask;
            if (netmask) {
              netmaskField[hostUuid] = netmask;
            }
          }
        });

        form.setFieldsValue({
          ipv4Address: ipv4AddressField,
          netmask: netmaskField,
        });
      }

      setUsedIps(currentUsedIps);
    },
    [l3Network.enableIPAM, l3Network.ipRanges, availableIps, form, usedIps],
  );

  const hostDefaultQuery = React.useMemo<IQuery>(() => {
    if (l3Network.uuid) {
      return {
        conditions: [
          {
            key: "l2NetworkUuid",
            op: Op.eq,
            value: l3Network.l2NetworkUuid,
          },
          {
            key: "status",
            op: Op.eq,
            value: HostStatus.Connected,
          },
        ],
      };
    }

    return {};
  }, [l3Network]);

  const l3NetworkDefaultQuery = React.useMemo<IQuery>(() => {
    if (host.uuid) {
      return {
        conditions: [
          { key: "defaultFilter", value: "NOT_DEFAULT" },
          {
            key: "hostUuid",
            op: Op.eq,
            value: host.uuid,
          },
          {
            key: "ipVersion",
            op: Op.eq,
            value: 4,
          },
        ],
      };
    }
    return {};
  }, [host]);

  // 修改列配置
  const hostNetworkConfigColumns = [
    {
      title: (
        <>
          {intl.formatMessage({
            id: "host",
            defaultMessage: "Host",
          })}
          <span className={`zstack-form-item-label-container-required`}>*</span>
        </>
      ),
      width: 120,
      render: (record: Host) => (
        <Form.Item name={["host", record.uuid]}>
          <Text>{record?.name}</Text>
        </Form.Item>
      ),
    },
    {
      title: (
        <>
          {intl.formatMessage({
            id: "ipv4Address",
            defaultMessage: "IPv4 Address",
          })}
          <span className={`zstack-form-item-label-container-required`}>*</span>
        </>
      ),
      width: 146,
      render: (record: Host) => (
        <Form.Item
          name={["ipv4Address", record.uuid]}
          rules={[
            isRequired(IIsRequiredType.input),
            ipValidator(),
            {
              validator: async (rule: any, value) => {
                if (!value) {
                  return;
                }

                const ipRanges = compact(
                  l3Network?.ipRanges?.filter(
                    (ip) => ip.ipVersion === 4 && ip.ipRangeType === "Normal",
                  ),
                );

                const isInIpRanges = !isEmpty(ipRanges)
                  ? ipRanges.some(({ startIp, endIp }) => {
                      const valueInt = ipToInt(value);
                      const startIpInt = ipToInt(startIp!);
                      const endInt = ipToInt(endIp!);
                      return valueInt >= startIpInt && valueInt <= endInt;
                    })
                  : true;
                if (!isInIpRanges) {
                  throw new Error(
                    intl.formatMessage({
                      id: "hostKernelInterface.field.requiredIp.validator.cidr.message",
                      defaultMessage: "The IP address must be within the IP range of a distributed port group. Please re-enter.",
                    }),
                  );
                }

                // 检查IP是否与其他主机冲突
                const currentIpv4Addresses =
                  form.getFieldValue("ipv4Address") || {};
                const conflictingHosts = Object.keys(
                  currentIpv4Addresses,
                ).filter(
                  (hostUuid) =>
                    hostUuid !== record.uuid &&
                    currentIpv4Addresses[hostUuid] === value,
                );

                if (conflictingHosts.length > 0) {
                  throw new Error(
                    intl.formatMessage({
                      id: "hostKernelInterface.field.ipv4Address.validator.conflict",
                      defaultMessage: "The IP address is already in use. Configure a different IP address.",
                    }),
                  );
                }

                if (l3Network?.uuid) {
                  const { data } = await remoteValidateIp({
                    variables: {
                      input: { l3NetworkUuid: l3Network.uuid, ip: value },
                    },
                  });

                  const available =
                    data?.checkIpAvailability?.available ?? true;
                  if (!available) {
                    throw new Error(
                      intl.formatMessage({
                        id: "hostKernelInterface.field.requiredIp.validator.occupied",
                        defaultMessage: "The IP address is already occupied. Please re-input.",
                      }),
                    );
                  }
                }
              },
            },
          ]}
        >
          {l3Network.enableIPAM ? (
            <IpInput
              l3NetworkUuid={l3Network.uuid}
              ipVersion={4}
              className={style["ip-input"]}
            />
          ) : (
            <Input />
          )}
        </Form.Item>
      ),
    },
    {
      title: (
        <>
          {intl.formatMessage({
            id: "netmask",
            defaultMessage: "Netmask",
          })}
          <span className={`zstack-form-item-label-container-required`}>*</span>
        </>
      ),
      width: 156,
      render: (record: Host) => (
        <Form.Item
          name={["netmask", record.uuid]}
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: "netmask.required",
                defaultMessage: "This field is required.",
              }),
            },
            {
              validator: async (_, value) => {
                if (!isIP(value)) {
                  throw new Error(
                    intl.formatMessage({
                      id: "netmask.format.error",
                      defaultMessage:
                        "Enter a valid netmask. Example: 255.255.255.0",
                    }),
                  );
                }
              },
            },
          ]}
        >
          {l3Network.enableIPAM ? (
            <Text>
              {l3Network?.ipRanges?.find(
                (ip: any) => ip.ipVersion === 4 && ip.ipRangeType === "Normal",
              )?.netmask || ""}
            </Text>
          ) : (
            <Input />
          )}
        </Form.Item>
      ),
    },
  ];

  return (
    <>
      <ZSVForm.Card
        title={intl.formatMessage({
          id: "basic.info",
          defaultMessage: "Basic Info",
        })}
      >
        <ZSVForm.NameAndDesc />
        <Form.Item
          label={intl.formatMessage({
            id: "hostKernelInterface.field.network.trafficTypes",
            defaultMessage: "Network Service",
          })}
        >
          <Text>{kernelTrafficTypesMap.get(KernelTrafficTypes.Storage)}</Text>
        </Form.Item>
      </ZSVForm.Card>

      <ZSVForm.Card
        title={intl.formatMessage({
          id: "hostKernelInterface.field.networkConfig",
          defaultMessage: "Host Network Configurations",
        })}
      >
        {/* 主机视角 */}
        {host.uuid ? (
          <>
            <Form.Item
              label={intl.formatMessage({
                id: "portGroup",
                defaultMessage: "Distributed Port Group",
              })}
              name="l3Network"
              rules={[isRequired(IIsRequiredType.select)]}
            >
              <ModalSelect
                title={intl.formatMessage({
                  id: "select.portGroup",
                  defaultMessage: "Select Distributed Port Group",
                })}
                selectType="radio"
                className="width-320"
              >
                <L3NetworkList
                  view="select.virtualization.hostKernelInterface"
                  defaultQuery={l3NetworkDefaultQuery}
                />
              </ModalSelect>
            </Form.Item>
            <Form.Item
              noStyle
              shouldUpdate={(prev, curr) => prev.l3Network !== curr.l3Network}
            >
              {({ getFieldValue }) => {
                const _l3Network: IL3Network =
                  getFieldValue("l3Network")?.[0] ?? {};

                const ipRanges = compact(
                  _l3Network?.ipRanges?.filter(
                    (ip) => ip.ipVersion === 4 && ip.ipRangeType === "Normal",
                  ),
                );
                const { netmask } =
                  _l3Network?.ipRanges?.find(
                    (ip) => ip.ipVersion === 4 && ip.ipRangeType === "Normal",
                  ) ?? {};

                // 场景1：选择了端口组后，自动填充掩码并清除必填校验错误
                // 场景2：清空端口组后，清空 IP 与掩码的值并清除错误
                if (!_l3Network?.uuid) {
                  // 先重置字段，确保表单值与校验状态都被清空
                  form.resetFields(["requiredIp", "netmask"]);
                  form.setFields([
                    { name: "requiredIp", value: undefined, errors: [] },
                    { name: "netmask", value: undefined, errors: [] },
                  ]);
                } else {
                  // 选择了端口组，清除之前触发的必填类错误
                  form.setFields([{ name: "requiredIp", errors: [] }]);
                  if (netmask) {
                    form.setFields([
                      { name: "netmask", value: netmask, errors: [] },
                    ]);
                  } else {
                    // 没有解析出掩码也清理错误，避免残留提示
                    form.setFields([{ name: "netmask", errors: [] }]);
                  }
                }

                return (
                  <>
                    <Form.Item
                      label={intl.formatMessage({
                        id: "ipv4Address",
                        defaultMessage: "IPv4 Address",
                      })}
                      name="requiredIp"
                      rules={[
                        isRequired(IIsRequiredType.input),
                        ipValidator(),
                        () => ({
                          validator: async (rule: any, value) => {
                            if (!value) {
                              return;
                            }

                            const isInIpRanges = !isEmpty(ipRanges)
                              ? ipRanges.some(({ startIp, endIp }) => {
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
                                  id: "hostKernelInterface.field.requiredIp.validator.cidr.message",
                                  defaultMessage: "The IP address must be within the IP range of a distributed port group. Please re-enter.",
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
                                    id: "hostKernelInterface.field.requiredIp.validator.occupied",
                                    defaultMessage: "The IP address is already occupied. Please re-input.",
                                  }),
                                );
                              }
                            }
                          },
                        }),
                      ]}
                    >
                      <IpInput
                        key={_l3Network.uuid}
                        l3NetworkUuid={_l3Network.uuid}
                        ipVersion={4}
                        className="width-320"
                      />
                    </Form.Item>
                    <Form.Item
                      noStyle
                      shouldUpdate={(prev, curr) =>
                        prev.l3Network !== curr.l3Network
                      }
                    >
                      {() => {
                        const enableIPAM =
                          getFieldValue("l3Network")?.[0]?.enableIPAM;
                        return enableIPAM ? (
                          <Form.Item
                            label={intl.formatMessage({
                              id: "netmask",
                              defaultMessage: "Netmask",
                            })}
                            name="netmask"
                            required
                          >
                            <Text>{netmask}</Text>
                          </Form.Item>
                        ) : (
                          <Form.Item
                            label={intl.formatMessage({
                              id: "netmask",
                              defaultMessage: "Netmask",
                            })}
                            name="netmask"
                            validateTrigger="onBlur"
                            rules={[
                              isRequired(IIsRequiredType.input),
                              netmaskValidator(),
                            ]}
                          >
                            <Input className="width-320" />
                          </Form.Item>
                        );
                      }}
                    </Form.Item>
                  </>
                );
              }}
            </Form.Item>
          </>
        ) : null}

        {/* 端口组视角 */}
        {l3Network.uuid ? (
          <Form.Item name="hosts">
            <FormTable
              title={intl.formatMessage({
                id: "storage.node.select",
                defaultMessage: "Select Node",
              })}
              emptyActionText={intl.formatMessage({
                id: "add.host",
                defaultMessage: "Add Host",
              })}
              columnConfig={hostNetworkConfigColumns}
              value={selectedHostList}
              onChange={(newValue: any[]) => {
                setSelectedHostList(newValue);
                onHostsChange?.(newValue);

                // 触发自动IP分配
                if (l3Network.enableIPAM && newValue.length > 0) {
                  autoAssignIps(newValue);
                }
              }}
            >
              <HostList
                view="select.virtualization.hostKernelInterface"
                defaultQuery={hostDefaultQuery}
                gql={getHostList}
              />
            </FormTable>
          </Form.Item>
        ) : null}
      </ZSVForm.Card>

      <DialogWeak
        visible={ipInsufficientVisible}
        setVisible={setIpInsufficientVisible}
        type="warning"
        title={String(
          intl.formatMessage({
            id: "hostKernelInterface.ip.insufficient.alert.title",
            defaultMessage: `Cannot Assign IP Address`,
          }),
        )}
        onConfirm={() => {
          setIpInsufficientVisible(false);
        }}
        description={intl.formatMessage({
          id: "hostKernelInterface.ip.insufficient.alert.content",
          defaultMessage: `No available IP addresses in this distributed port group. Change a different port group or add an IP range to the port group.`,
        })}
      />
    </>
  );
};

export default Config;
