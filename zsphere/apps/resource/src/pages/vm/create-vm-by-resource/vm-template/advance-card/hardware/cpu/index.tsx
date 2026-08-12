import { useQuery } from "@apollo/client";
import { Button, Text } from "@zstack/design";
import { Tooltip } from "@zstack/design";
import { getCustomCpuMode } from "@zstack/virtualization-resource/src/gql/vm.gql";
import { ConfigContext } from "@zstack/virtualization-resource/src/pages/vm/action/edit-config/config-context";
import { formatStructureCpuBindToSubmit } from "@zstack/virtualization-resource/src/pages/vm/utils";
import {
  Form,
  Icon,
  Input,
  InputNumber,
  Select,
  Switch,
} from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import type { FormCreateType } from "@zstack/zsphere-types";
import { CpuArchitecture } from "@zstack/zsphere-types";
import { includes, keys, isUndefined, cloneDeep, get } from "lodash-es";
import React, { useContext, useState, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import BindCPUModal from "./bind-cpu-modal";
import { CommonCpuMode, MAX_CPU_NUM, aarch64CpuMode, winLists } from "./utils";

import styles from "./style.module.less";

// Static style constants
const STYLE_WIDTH_200 = { width: 200 } as const;
const STYLE_PADDING_0 = { padding: 0 } as const;
const STYLE_CURSOR_POINTER = { cursor: "pointer" } as const;
const STYLE_MARGIN_TOP_16 = { marginTop: 16 } as const;

interface IProps {
  hideTag?: boolean;
  hideDescription?: boolean;
  hideQuantity?: boolean;
  setFields?: Function;
  formCreateType?: FormCreateType;
  form?: any;
  source: any;

  //
  createByResource?: boolean; // 是否是从资源池创建
}

const { Item } = Form;

const allCanDisableItems = [
  // 'totalCoreNum',
  // 'sockedNum',
  "cpuQuota",
  "CPUMode",
  "cpuResourceLevel",
  "cpuBindListByVCpu",
  // 'hotPlug',
  "cpuHideKVMMark",
];

const CPUCard: React.FC<IProps> = ({
  form,
  source,
  createByResource = true,
}) => {
  const intl = useIntl();

  const disableItems = createByResource ? allCanDisableItems : [];

  const isEdit = false;

  const disabledConfig = useContext(ConfigContext);

  const [bindCPUModalVisible, setBindCPUModalVisible] =
    useState<boolean>(false);

  const [hostUuid, setHostUuid] = useState<string>("");

  const [cpuNum, setCpuNum] = useState<number>(0);

  const [_didClickBindNumaCancel, setDidClickBindNumaCancel] =
    useState<boolean>(false);

  const { isRequired, numberRange } = useValidator(intl);

  const { data: customCpuModeData } = useQuery(getCustomCpuMode);

  // 监听相关字段变化，设置表单值
  const runPath = Form.useWatch("runPath", form);
  const guest = Form.useWatch("guest", form);
  const os = Form.useWatch("os", form);
  const cpuBindListByVCpu = Form.useWatch("cpuBindListByVCpu", form);

  // 监听 runPath 变化，设置 hostUuid 和 cpuNum
  useEffect(() => {
    if (runPath?.[0]?.__typename === "HostVO") {
      setHostUuid(runPath[0].uuid);
    }
    setCpuNum(limitCpuNum());
  }, [runPath]);

  // 监听 cpuBindListByVCpu 和 hotPlug 变化，设置互斥关系
  useEffect(() => {
    const haveCpuBindListByVCpu = cpuBindListByVCpu?.every(
      (it: any) => it.pCPUList.length !== 0,
    );

    if (cpuBindListByVCpu?.length && haveCpuBindListByVCpu) {
      form.setFieldsValue({
        hotPlug: false,
      });
    }
  }, [cpuBindListByVCpu, form]);

  // 监听 guest 和 os 变化，设置 hotPlug
  useEffect(() => {
    if (guest === "Windows") {
      if (!isEdit) {
        form.setFieldsValue({
          hotPlug: !!includes(winLists, os),
        });
      }
    }
    if (guest === "Other") {
      if (!isEdit) {
        form.setFieldsValue({
          hotPlug: false,
        });
      }
    }
  }, [guest, os, form]);

  const levelOptions = [
    {
      value: "Normal",
      text: intl.formatMessage({
        id: "cpu.level.options.normal",
        defaultMessage: "Normal",
      }),
    },
    {
      value: "CpuHigh",
      text: intl.formatMessage({
        id: "cpu.level.options.high",
        defaultMessage: "High",
      }),
    },
  ];
  const onCpuNumChange = (val: number | string) => {
    const cpuBindListByVCpu = form.getFieldValue("cpuBindListByVCpu");
    if (cpuBindListByVCpu?.length > 0) {
      // CPU 总核数变化且已配置了 CPU NUMA 绑定，清除绑定
      form.setFieldsValue({
        vnumaEnabled: false,
        cpuBindListByVCpu: [],
      });
    }
    const nicMultiQueueNumKeys = keys(form.getFieldValue()).filter(
      (it) => it.indexOf("nicMultiQueueNum-") === 0,
    );
    let kvmAutoSetVmNicMultiqueue = false;
    const runPath = form.getFieldValue("runPath");
    let nicMultiQueueNumValue = "1";
    if (runPath?.[0] && runPath?.[0]?.__typename) {
      if (runPath?.[0]?.__typename === "HostVO") {
        kvmAutoSetVmNicMultiqueue =
          runPath?.[0]?.cluster?.resourceConfigValue
            ?.kvmAutoSetVmNicMultiqueue !== "false";
      }
      if (runPath?.[0]?.__typename === "Cluster") {
        kvmAutoSetVmNicMultiqueue =
          runPath?.[0]?.resourceConfigValue?.kvmAutoSetVmNicMultiqueue !==
          "false";
      }
    }

    if (kvmAutoSetVmNicMultiqueue && val) {
      nicMultiQueueNumValue = (val as number) < 12 ? String(val) : "12";
    }

    form.setFields([
      ...nicMultiQueueNumKeys.map((key) => ({
        name: key,
        value: nicMultiQueueNumValue,
      })),
      { name: "sockedNum", value: val },
    ]);
  };

  // ZSV-3824, 数字太大会导致页面卡死
  const limitCpuNum = () => {
    const formCpuNum = form.getFieldValue("totalCoreNum");
    return formCpuNum > MAX_CPU_NUM ? MAX_CPU_NUM : formCpuNum;
  };

  return (
    <div className={styles.content} key="cpuCard">
      <Item
        label={intl.formatMessage({
          id: "virtualization.create.instance.cpu.core.num",
          defaultMessage: "Cores",
        })}
        name="totalCoreNum"
        rules={[isRequired(), numberRange(1, MAX_CPU_NUM)]}
        required
        tooltip={
          disabledConfig.cpuNumDisabled &&
          intl.formatMessage({
            id: "edit.vm.change.cpuNum.disabled.tooltip",
            defaultMessage:
              "Cannot modify this setting when the VM is running. Enable CPU and memory hot plugs and try again.",
          })
        }
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "vm.create.instance.cpu.core.num.tooltip",
              defaultMessage: `### Cores

After binding the CPU NUMA, if you change the number of virtual machine CPU cores, the CPU NUMA binding will be automatically canceled.`,
            })}
          </ReactMarkdown>
        }
      >
        <InputNumber
          disabled={
            disabledConfig.cpuNumDisabled ||
            disableItems.includes("totalCoreNum")
          }
          className={styles.cpuNum}
          onChange={onCpuNumChange}
          min={1}
          max={MAX_CPU_NUM}
        />
      </Item>
      <Item
        noStyle
        shouldUpdate={(pre, cur) =>
          pre.totalCoreNum !== cur.totalCoreNum &&
          !isUndefined(pre.totalCoreNum)
        }
      >
        {() => {
          const _cpuNum = limitCpuNum();

          let sockedNumOptions = [1];
          if (_cpuNum) {
            const result = [];
            for (let i = 1; i < _cpuNum + 1; i++) {
              if (_cpuNum % i === 0) {
                result.push(i);
              }
            }
            sockedNumOptions = result;
          }

          return (
            <Item
              noStyle
              shouldUpdate={(pre, cur) => pre.sockedNum !== cur.sockedNum}
            >
              {() => {
                const presockedNum = form.getFieldValue("sockedNum");
                const sockedNum = _cpuNum / presockedNum;

                return (
                  <Item
                    rules={[isRequired()]}
                    label={intl.formatMessage({
                      id: "virtualization.create.instance.cpu.socket.num",
                      defaultMessage: "Cores per Socket",
                    })}
                    name="sockedNum"
                    description={
                      <div style={STYLE_MARGIN_TOP_16}>
                        {intl.formatMessage(
                          {
                            id: "virtualization.create.instance.field.socket.num.tips.info",
                            defaultMessage: "Sockets: {socketNum}",
                          },
                          {
                            socketNum: sockedNum,
                          },
                        )}
                      </div>
                    }
                    tooltip={disabledConfig.tooltip}
                  >
                    <Select
                      disabled={
                        disabledConfig.disabled ||
                        disableItems.includes("sockedNum")
                      }
                      width={200}
                      options={sockedNumOptions?.map((it) => ({
                        value: it,
                        label: `${it}`,
                        key: it,
                      }))}
                    />
                  </Item>
                );
              }}
            </Item>
          );
        }}
      </Item>
      <Item noStyle shouldUpdate={(pre, cur) => pre.runPath !== cur.runPath}>
        {() => {
          const runPath = form.getFieldValue("runPath");
          const architecture = runPath?.[0]?.architecture;

          const list = cloneDeep(
            get(customCpuModeData?.getCustomCpuMode, "list", []),
          );
          let customCpuMode: any = [];
          let cpuModelForArchList = [
            {
              value: "none",
              label: intl.formatMessage({
                id: "none",
                defaultMessage: "None",
              }),
            },
            {
              value: "host-model",
              label: intl.formatMessage({
                id: "vm.cpuMode.hostModel",
                defaultMessage: "Compatible",
              }),
            },
            {
              value: "host-passthrough",
              label: intl.formatMessage({
                id: "vm.cpuMode.hostPassthrough",
                defaultMessage: "Passthrough",
              }),
            },
          ];
          if (architecture !== CpuArchitecture.aarch64) {
            customCpuMode = list.filter(
              (t: string) => t != null && CommonCpuMode.indexOf(t) === -1,
            );
          }
          if (architecture === CpuArchitecture.aarch64) {
            customCpuMode = [...aarch64CpuMode];
            cpuModelForArchList = [
              {
                value: "host-model",
                label: intl.formatMessage({
                  id: "vm.cpuMode.hostModel",
                  defaultMessage: "Compatible",
                }),
              },
              {
                value: "host-passthrough",
                label: intl.formatMessage({
                  id: "vm.cpuMode.hostPassthrough",
                  defaultMessage: "Passthrough",
                }),
              },
            ];
          }

          return (
            <Item
              label={intl.formatMessage({
                id: "virtualization.create.instance.cpu.mode",
                defaultMessage: "CPU Mode",
              })}
              name="CPUMode"
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "virtualization.instance.cpu.mode.tooltip",
                    defaultMessage: `### CPU Mode

Specifies whether to select the same CPU model as the host for a virtual machine. This configuration makes the virtual machine inherit some or all host CPU features that suit your business needs.

**For VM with x86_64 CPU architecture:**

1. Options: None, Compatible, Passthrough, and Custom Mode (a specific CPU model).
2. If you select "None", the CPU model of the VM is simulated via QEMU. In this mode, the VM inherits necessary host CPU features to a small degree. We recommend you select this mode if you need to migrate your VM.
3. If you select "Compatible", the CPU model of the VM  is similar to or same as that of the host, such as Intel Haswell CPU. In this mode, the VM inherits many host CPU features. You can select this mode if you need to migrate your VM.
4. If you select "Passthrough", the CPU model as well as CPU features of the VM are the same as the CPU model and CPU features of the host. For example, both the VM and host support the extended page table extension, huge page, and virtualization features. Compared with the "None", "Compatible", and "Custom modes", VM in this mode has the most CPU features. You can select this mode if your business requires many features.
5. If you select "Custom" (a specific CPU model), the CPU model of the VM is set to the specified model. Different CPU models may have different CPU features.

**For VM with aarch64 CPU architecture:**

1. Options: Inherit Cluster Setting (by default), None, Compatible, Passthrough, and Custom Mode (a specific CPU model).
2. If you select "Inherit Cluster Setting (by default)", the CPU model of the VM is consistent with the VM CPU model of the cluster where the VM resides.
3. If you select "Compatible", the CPU model of the VM  is similar to or same as that of the host, such as Intel Haswell CPU. In this mode, the VM inherits many host CPU features. You can select this mode if you need to migrate your VM.
4. If you select "Passthrough", the CPU model as well as CPU features of the VM are the same as the CPU model and CPU features of the host. For example, both the VM and host support the extended page table extension, huge page, and virtualization features. Compared with the "None", "Compatible", and "Custom modes", VM in this mode has the most CPU features. You can select this mode if your business requires many features.
5. If you select "Custom" (a specific CPU model), the CPU model of the VM is set to the specified model. Different CPU models may have different CPU features.

#### Note:

1. If you select "Passthrough", the VM will allow for virtualization. However, if you migrate a VM to a host whose CPU model is different from the current host, the migration may fail. In addition, the CPU utilization of the VM measured within the VM may differ from the CPU utilization measured from the host.
2. If you specifically set the CPU model of an individual virtual machine, the VM CPU model configured for the cluster will not take effect on that VM.
3. If you modify the CPU model, you need to reboot the VM to make the modification take effect.`,
                  })}
                </ReactMarkdown>
              }
              tooltip={disabledConfig.tooltip}
            >
              <Select
                style={STYLE_WIDTH_200}
                showSearch
                disabled={
                  disabledConfig.disabled || disableItems.includes("CPUMode")
                }
              >
                {cpuModelForArchList.map((it) => (
                  <Select.Option key={it.value} value={it.value}>
                    {it.label}
                  </Select.Option>
                ))}
                <Select.Option className={styles.selectSlot} disabled>
                  {intl.formatMessage({
                    id: "cluster.field.cpuModel.select.option.slot.custom.mode",
                    defaultMessage: "Custom Mode",
                  })}
                </Select.Option>
                {customCpuMode
                  .filter((it: any) => it != null)
                  .map((it: any) => (
                    <Select.Option key={it} value={it}>
                      {it}
                    </Select.Option>
                  ))}
              </Select>
            </Item>
          );
        }}
      </Item>
      <Item
        label={intl.formatMessage({
          id: "virtualization.create.instance.cpu.resouce.level",
          defaultMessage: "CPU Resource Priority",
        })}
        name="cpuResourceLevel"
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "virtualization.create.instance.cpu.resouce.level.tooltip",
              defaultMessage: `### CPU Resource Priority

1. When resource contention occurs due to high host workloads, VMs with High Resource Priority can compete for more resources than those with Normal Resource Priority.

2. We recommend that you set CPU Resource Priority to High for vital VMs。
                `,
            })}
          </ReactMarkdown>
        }
      >
        <Select
          style={STYLE_WIDTH_200}
          disabled={disableItems.includes("cpuResourceLevel")}
        >
          {levelOptions.map(({ value, text }) => (
            <Select.Option value={value} key={value}>
              {text}
            </Select.Option>
          ))}
        </Select>
      </Item>
      <Item
        noStyle
        shouldUpdate={(pre, cur) => {
          return pre.runPath !== cur.runPath;
        }}
      >
        {() => {
          const runPath = form.getFieldValue("runPath");
          const runPathisHost = runPath?.[0]?.__typename === "HostVO";
          let hostCpuGHz = "";
          //
          if (runPathisHost) {
            hostCpuGHz = runPath?.[0]?.hostSystemInfo.cpuGHz;
          }
          return (
            <Item
              label={intl.formatMessage({
                id: "virtualization.create.instance.cpu.clock.speed.limit",
                defaultMessage: "CPU Clock Speed Limit",
              })}
              name="cpuQuota"
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "virtualization.create.instance.cpu.clock.speed.limit.iconTooltip",
                    defaultMessage: `### CPU Clock Speed Limit

Control the upper limit of CPU resources a virtual machine can use on the host. Valid range: 1%–100%. Setting 100% or leaving it blank both indicate no limit.`,
                  })}
                </ReactMarkdown>
              }
              rules={[
                {
                  validator: (_, value) => {
                    if (!value) {
                      return Promise.resolve();
                    }
                    const num = parseFloat(value);
                    if (
                      Number.isNaN(num) ||
                      num < 1 ||
                      num > 100 ||
                      !/^\d+(\.\d{1,2})?$/.test(value)
                    ) {
                      return Promise.reject(
                        intl.formatMessage({
                          id: "virtualization.create.instance.cpu.clock.speed.limit.error",
                          defaultMessage:
                            "Enter a value between 1 to 100, supporting two decimal places.",
                        }),
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              description={
                runPathisHost && (
                  <span>
                    {intl.formatMessage(
                      {
                        id: "virtualization.create.instance.cpu.clock.speed.limit.description",
                        defaultMessage: `Host CPU clock speed: {hostCpuGHz} GHz`,
                      },
                      {
                        hostCpuGHz,
                      },
                    )}
                  </span>
                )
              }
            >
              <Input
                disabled={disableItems.includes("cpuQuota")}
                style={STYLE_WIDTH_200}
                suffix="%"
                placeholder={intl.formatMessage({
                  id: "unlimited",
                  defaultMessage: "Unlimited",
                })}
              />
            </Item>
          );
        }}
      </Item>
      <Item
        label={intl.formatMessage({
          id: "virtualization.create.instance.cpu.bind.numa",
          defaultMessage: "CPU NUMA Binding",
        })}
        name="cpuBindListByVCpu"
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "zsv.create.instance.cpu.bind.numa.tooltip",
              defaultMessage: `### CPU NUMA Binding

You can bind the virtual CPUs (vCPUs) of a virtual machine to specific host pCPUs based on NUMA topology, which improves VM performance.

- Before binding CPU NUMA, specify a host and disable CPU Hot Plug.
- When binding vCPUs to pCPUs based on the host pNUMA topology, you can manually bind or just click Smart Binding.
- You can bind a vCPU to one or more pCPUs or bind one or more vCPUs to a pCPU.
- The utilization of each pCPU in the past 15 minutes is displayed. You can bind a vCPU to the optimal pCPU based on the utilization.
- After binding the CPU NUMA, if you change the number of virtual machine CPU cores, the CPU NUMA binding will be automatically canceled.
                              `,
            })}
          </ReactMarkdown>
        }
      >
        <Item
          noStyle
          shouldUpdate={(pre, cur) =>
            pre.runPath !== cur.runPath ||
            pre.totalCoreNum !== cur.totalCoreNum ||
            pre.hotPlug !== cur.hotPlug ||
            pre.cpuBindListByVCpu !== cur.cpuBindListByVCpu
          }
        >
          {({ getFieldValue }) => {
            const cpuBindListByVCpu = getFieldValue("cpuBindListByVCpu");
            const runPath = getFieldValue("runPath");
            const hotPlug = getFieldValue("hotPlug");

            // 存在多入口,后续还有 需要加条件
            const currentTypeName =
              runPath?.[0]?.__typename === "HostVO"
                ? "HostVO"
                : source?.__typename;

            const haveCpuBindListByVCpu = cpuBindListByVCpu?.every(
              (it: any) => it.pCPUList.length !== 0,
            );

            if (cpuBindListByVCpu?.length && haveCpuBindListByVCpu) {
              return (
                <div style={STYLE_WIDTH_200}>
                  <Text>
                    {formatStructureCpuBindToSubmit(cpuBindListByVCpu)
                      ?.map?.((item) => `${item?.vCPU}:${item?.pCPU}`)
                      ?.join(";")}
                  </Text>
                  {disabledConfig.disabled ? (
                    <Tooltip title={disabledConfig.tooltip}>
                      <Icon
                        type="edit"
                        style={STYLE_CURSOR_POINTER}
                        color="disabled"
                      />
                    </Tooltip>
                  ) : (
                    <Icon
                      type="edit"
                      style={STYLE_CURSOR_POINTER}
                      onClick={() => {
                        setBindCPUModalVisible(true);
                      }}
                    />
                  )}
                </div>
              );
            }
            if (["HostVO", "VmInstance"].indexOf(currentTypeName) === -1) {
              return (
                <Tooltip
                  title={intl.formatMessage({
                    id: "virtualization.create.instance.cpu.bind.physics.cpu.set.tip",
                    defaultMessage: "You need to specify the host before starting...",
                  })}
                >
                  <Button style={STYLE_PADDING_0} variant="link" disabled>
                    {intl.formatMessage({
                      id: "virtualization.create.instance.cpu.bind.physics.cpu.set",
                      defaultMessage: "Binding",
                    })}
                  </Button>
                </Tooltip>
              );
            }

            if (hotPlug) {
              return (
                <Tooltip
                  title={intl.formatMessage({
                    id: "virtualization.create.instance.cpu.bind.open.hotPlug.tip",
                    defaultMessage:
                      "To bind CPU NUMA, disable CPU Hot Plug first.",
                  })}
                >
                  <Button style={STYLE_PADDING_0} variant="link" disabled>
                    {intl.formatMessage({
                      id: "virtualization.create.instance.cpu.bind.physics.cpu.set",
                      defaultMessage: "Binding",
                    })}
                  </Button>
                </Tooltip>
              );
            }

            if (disabledConfig.disabled) {
              return (
                <Tooltip title={disabledConfig.tooltip}>
                  <Button style={STYLE_PADDING_0} variant="link" disabled>
                    {intl.formatMessage({
                      id: "virtualization.create.instance.cpu.bind.physics.cpu.set",
                      defaultMessage: "Binding",
                    })}
                  </Button>
                </Tooltip>
              );
            }

            return (
              <Button
                style={STYLE_PADDING_0}
                variant="link"
                onClick={() => {
                  setBindCPUModalVisible(true);
                }}
                disabled={disableItems.includes("cpuBindListByVCpu")}
              >
                {intl.formatMessage({
                  id: "virtualization.create.instance.cpu.bind.physics.cpu.set",
                  defaultMessage: "Binding",
                })}
              </Button>
            );
          }}
        </Item>
      </Item>
      <Item
        noStyle
        shouldUpdate={(pre, cur) => {
          return (
            pre.guest !== cur.guest ||
            pre.os !== cur.os ||
            pre.cpuBindListByVCpu !== cur.cpuBindListByVCpu
          );
        }}
      >
        {() => {
          const guest = form.getFieldValue("guest");
          const os = form.getFieldValue("os");
          const cpuBindListByVCpu = form.getFieldValue("cpuBindListByVCpu");
          const haveCpuBindListByVCpu = cpuBindListByVCpu?.every(
            (it: any) => it.pCPUList.length !== 0,
          );
          let switchDisable = false;

          //hotPlug与cpuBindListByVCpu 互斥
          if (cpuBindListByVCpu?.length && haveCpuBindListByVCpu) {
            switchDisable = true;
          }

          if (guest === "Windows") {
            switchDisable = !includes(winLists, os);
          }
          if (guest === "Other") {
            switchDisable = true;
          }

          return (
            <Item
              label={intl.formatMessage({
                id: "virtualization.create.instance.cpu.hot.plug",
                defaultMessage: "CPU Hot Plug",
              })}
              name="hotPlug"
              valuePropName="checked"
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "zsv.create.instance.cpu.hot.plug.tooltip",
                    defaultMessage: `### CPU Hot Plug

Default: enabled. Specify whether to allow online modification of a VM's CPU.
                                  `,
                  })}
                </ReactMarkdown>
              }
              tooltip={
                cpuBindListByVCpu?.length && haveCpuBindListByVCpu
                  ? intl.formatMessage({
                      id: "virtualization.create.instance.hotPlug.open.bind.cpu.tip",
                      defaultMessage: "To enable CPU Hot Plug, unbind CPU NUMA first.",
                    })
                  : disabledConfig.tooltip
              }
            >
              <Switch
                disabled={switchDisable || disableItems.includes("hotPlug")}
              />
            </Item>
          );
        }}
      </Item>
      <Item
        noStyle
        shouldUpdate={(pre, cur) =>
          pre.runPath !== cur.runPath || pre.CPUMode !== cur.CPUMode
        }
      >
        {() => {
          const runPath = form?.getFieldValue("runPath");
          const cpuMode = form?.getFieldValue("CPUMode");
          const cpuNone = cpuMode === "None" || cpuMode === "none";
          let _cpuHideKVMMarkDisable = false;
          // 存在多入口,后续还有 需要加条件
          //
          const clusterKVMCpuModel =
            runPath?.[0]?.__typename === "Cluster"
              ? runPath?.[0]?.clusterKVMCpuModel
              : runPath?.[0]?.cluster?.clusterKVMCpuModel;

          if (clusterKVMCpuModel) {
            _cpuHideKVMMarkDisable =
              clusterKVMCpuModel === "none" && cpuMode === "none";
          }

          return (
            <Item
              label={intl.formatMessage({
                id: "virtualization.create.instance.hide.kvm.virtualization.mark",
                defaultMessage: "CPU Hypervisor Tag",
              })}
              name="cpuHideKVMMark"
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "zsv.create.instance.hide.kvm.virtualization.mark.tooltip",
                    defaultMessage: `### CPU Hypervisor Tag

Default: enabled. Specify whether to enable the hypervisor tag for the VM CPU. If you turn off the switch, the VM CPU hypervisor tag is disabled, which is used to skip virtualization environment detections from applications on the VM.`,
                  })}
                </ReactMarkdown>
              }
              valuePropName="checked"
              tooltip={
                cpuNone
                  ? intl.formatMessage({
                      id: "virtualization.create.instance.hide.kvm.virtualization.disabled.tips",
                      defaultMessage:
                        "You cannot modify the CPU hypervisor tag, because the VM's CPU mode is set to \"None\".",
                    })
                  : disabledConfig.tooltip
              }
            >
              <Switch
                disabled={
                  cpuNone ||
                  disabledConfig.disabled ||
                  disableItems.includes("cpuHideKVMMark")
                }
              />
            </Item>
          );
        }}
      </Item>
      <BindCPUModal
        setDidClickBindNumaCancel={setDidClickBindNumaCancel}
        isEdit={isEdit}
        visible={bindCPUModalVisible}
        setVisible={setBindCPUModalVisible}
        source={source}
        hostUuid={hostUuid}
        cpuNum={cpuNum}
        form={form}
      />
    </div>
  );
};

export default React.memo(CPUCard);
