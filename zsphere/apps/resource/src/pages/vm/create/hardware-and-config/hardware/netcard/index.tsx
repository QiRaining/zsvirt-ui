import { Tooltip } from "@zstack/design";
import PhysicalNicList from "@zstack/virtualization-resource/src/pages/physical-nic/list";
import { ConfigContext } from "@zstack/virtualization-resource/src/pages/vm/action/edit-config/config-context";
import {
  Form,
  Input,
  ModalSelect,
  Select,
  Switch,
  useAuth,
} from "@zstack/zsphere-components";
import type { FormCreateType } from "@zstack/zsphere-types";
import { Op, PhysicalNicQueryType } from "@zstack/zsphere-types";
import type {
  VmNic as IVmNic,
  PhysicalNic,
} from "@zstack/zsphere-types/graphql";
import React, { useContext, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { IpAndAppointIp, PortGroup, QoS, SecurityGroup } from "./components";
import { getNetCardType } from "./utils";

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
  origin?: IVmNic;
  displayIndex?: number;
}

const { Item } = Form;
const { Option } = Select;

const getNetCardTypeWithDisabledTips = (intl: any, reason: string) => {
  if (reason === "originDriverTypeIsNotSRIOV") {
    return intl.formatMessage({
      id: "virtualization.edit.network.card.type.not.support.sriov.tooltip",
      defaultMessage: "You cannot change the NIC to the SR-IOV type.",
    });
  }
  return intl.formatMessage({
    id: "virtualization.create.vm.run.path.not.host.tooltip",
    defaultMessage: "Host must be specified before binding...",
  });
};

const NetCard: React.FC<IProps> = ({
  form,
  index,
  zoneUuid,
  source,
  isEdit = false,
  origin,
  displayIndex,
}) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();

  const hasSriovAuth = hasAuth({
    type: "block",
    resource: "vm",
    authKey: "sriov",
  });

  const disabledConfig = useContext(ConfigContext);

  // 监听nicType变化，清除nicDevice字段
  useEffect(() => {
    const nicType = form.getFieldValue(`nicType-${index}`);
    if (nicType !== "SR-IOV") {
      form.setFields([{ name: `nicDevice-${index}`, value: undefined }]);
    }
  }, [form, index]);

  // 监听nicType变化，设置netCardState字段
  useEffect(() => {
    const nicType = form.getFieldValue(`nicType-${index}`);
    const isSriov = nicType === "SR-IOV";

    if (isSriov) {
      form.setFields([
        {
          name: `netCardState-${index}`,
          value: true,
        },
      ]);
    }
  }, [form, index]);

  return (
    <div className={styles.content}>
      <Item
        noStyle
        shouldUpdate={(pre: any, cur: any) =>
          pre[`nicType-${index}`] !== cur[`nicType-${index}`]
        }
      >
        {({ getFieldValue }: any) => {
          const isSriov = getFieldValue(`nicType-${index}`) === "SR-IOV";

          return (
            <Item
              label={intl.formatMessage({
                id: "enable.state",
                defaultMessage: "State",
              })}
              name={`netCardState-${index}`}
              valuePropName="checked"
            >
              <Switch disabled={isSriov} />
            </Item>
          );
        }}
      </Item>
      <Item
        noStyle
        shouldUpdate={(pre, cur) => {
          return pre.runPath !== cur.runPath;
        }}
      >
        {({ getFieldValue }) => {
          const runPath = getFieldValue("runPath");
          const isHost = ["HostVO", "Host"].includes(runPath?.[0]?.__typename);

          const originDriverTypeIsNotSRIOV =
            origin?.driverType && origin?.driverType !== "SR-IOV";

          // 获取带有禁用状态的网络卡类型
          const netCardTypeWithDisabled = getNetCardType(hasSriovAuth).map(
            (item) => ({
              ...item,
              disabledItem: isEdit
                ? {
                    disabled:
                      originDriverTypeIsNotSRIOV && item.label === "SR-IOV",
                    reason: "originDriverTypeIsNotSRIOV",
                  }
                : {
                    disabled: !isHost && item.label === "SR-IOV",
                    reason: "runPathIsNotHost",
                  },
            }),
          );

          return (
            <Item
              label={intl.formatMessage({
                id: "virtualization.create.instance.hardware.network.card.netcard.type",
                defaultMessage: "NIC Model",
              })}
              name={`nicType-${index}`}
              tooltip={
                origin?.driverType === "SR-IOV"
                  ? intl.formatMessage({
                      id: "driverType.is.sriov.tooltip",
                      defaultMessage: "You cannot change the SR-IOV NIC to another NIC model.",
                    })
                  : origin && disabledConfig.tooltip
              }
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
              <Select
                disabled={
                  origin?.driverType === "SR-IOV" ||
                  (origin && disabledConfig.disabled)
                }
                className={styles["width-200"]}
                width={120}
              >
                {netCardTypeWithDisabled.map((t) => (
                  <Option
                    value={t.value}
                    key={t.value}
                    disabled={t?.disabledItem?.disabled}
                  >
                    {t?.disabledItem?.disabled ? (
                      <Tooltip
                        title={getNetCardTypeWithDisabledTips(
                          intl,
                          t?.disabledItem?.reason,
                        )}
                      >{`${t.label}`}</Tooltip>
                    ) : (
                      `${t.label}`
                    )}
                  </Option>
                ))}
              </Select>
            </Item>
          );
        }}
      </Item>

      <PortGroup
        form={form}
        index={index}
        zoneUuid={zoneUuid}
        source={source}
        origin={origin}
      />

      <Item
        noStyle
        shouldUpdate={(pre: any, cur: any) =>
          pre[`nicType-${index}`] !== cur[`nicType-${index}`] ||
          pre[`l3NetworkUuids-${index}`] !== cur[`l3NetworkUuids-${index}`]
        }
      >
        {({ getFieldValue }: any) => {
          const runPath = getFieldValue("runPath");
          const l3NetworkUuid =
            form.getFieldValue(`l3NetworkUuids-${index}`)?.[0]?.uuid ?? [];

          const hostUuid = ["HostVO", "Host"].includes(runPath?.[0]?.__typename)
            ? runPath?.[0]?.uuid
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

          const nicDeviceDisabled: boolean = origin?.driverType === "SR-IOV";

          return getFieldValue(`nicType-${index}`) === "SR-IOV" ? (
            <Item
              label={intl.formatMessage({
                id: "virtualization.create.instance.hardware.network.card.nic.device",
                defaultMessage: "NIC Device",
              })}
              name={`nicDevice-${index}`}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({
                    id: "instance.field.nicDevice.validator.required",
                    defaultMessage: "Select an NIC.",
                  }),
                },
              ]}
              tooltip={
                nicDeviceDisabled
                  ? intl.formatMessage({
                      id: "driverType.is.sriov.nicDevice.tooltip",
                      defaultMessage:
                        "You cannot change the SR-IOV NIC to another NIC device.",
                    })
                  : undefined
              }
            >
              <ModalSelect
                title={intl.formatMessage({
                  id: "virtualization.create.instance.hardware.network.card.select.nic.device",
                  defaultMessage: "Select NIC Device",
                })}
                disabledItem={nicDeviceDisabled}
                transformKey="interfaceName"
                className={styles["width-200"]}
                modalWidth={800}
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
        shouldUpdate={(pre: any, cur: any) =>
          pre.totalCoreNum !== cur.totalCoreNum || pre.runPath !== cur.runPath
        }
      >
        {({ _getFieldValue }: any) => {
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
                  validator(_rule: any, val: number | string) {
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
                disabled={origin && disabledConfig.disabled}
                className={styles["width-200"]}
              />
            </Item>
          );
        }}
      </Item>

      <IpAndAppointIp
        index={index}
        displayIndex={displayIndex}
        origin={origin}
        isEdit={isEdit}
        source={source}
      />

      <SecurityGroup form={form} index={index} origin={origin} />

      <QoS form={form} index={index} isEdit={isEdit} />
    </div>
  );
};

export default React.memo(NetCard);
