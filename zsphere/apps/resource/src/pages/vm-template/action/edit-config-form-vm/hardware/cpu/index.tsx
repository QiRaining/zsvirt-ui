import { useQuery } from "@apollo/client";
import { Button, Text } from "@zstack/design";
import { Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { getCustomCpuMode } from "@zstack/virtualization-resource/src/gql/vm.gql";
import { ConfigContext } from "@zstack/virtualization-resource/src/pages/vm/action/edit-config/config-context";
import BindCPUModal from "@zstack/virtualization-resource/src/pages/vm/create/components/bind-cpu-modal";
import HotAddDescription from "@zstack/virtualization-resource/src/pages/vm/create/components/hot-add-desc";
import { formatStructureCpuBindToSubmit } from "@zstack/virtualization-resource/src/pages/vm/utils";
import { Form, InputNumber, Select, Switch } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import type { FormCreateType } from "@zstack/zsphere-types";
import { CpuArchitecture } from "@zstack/zsphere-types";
import { includes, keys, isUndefined, cloneDeep, get } from "lodash-es";
import React, { useContext, useState, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { CommonCpuMode, MAX_CPU_NUM, aarch64CpuMode, winLists } from "./utils";

import styles from "./style.module.less";

interface IProps {
  hideTag?: boolean;
  hideDescription?: boolean;
  hideQuantity?: boolean;
  setFields?: Function;
  formCreateType?: FormCreateType;
  form?: any;
  source: any;

  //
  editFormResource?: boolean; // 是否是从资源池创建
}

const { Item } = Form;

const allCanDisableItems = [
  // 'totalCoreNum',
  // 'sockedNum',
  "CPUMode",
  "cpuResourceLevel",
  "cpuBindListByVCpu",
  "cpuHideKVMMark", //
  "hotPlug",
];

const STYLE_SOCKET_DESC = { marginTop: 16 } as const;
const STYLE_CPU_MODE_SELECT = { width: 200 } as const;
const STYLE_RESOURCE_LEVEL_SELECT = { width: 200 } as const;
const STYLE_BIND_CPU_TEXT = { width: 200 } as const;
const STYLE_EDIT_ICON = { cursor: "pointer" } as const;
const STYLE_BUTTON_LINK = { padding: 0 } as const;

const CPUCard: React.FC<IProps> = ({
  form,
  source,
  editFormResource = true,
}) => {
  const intl = useIntl();

  const disableItems = editFormResource ? allCanDisableItems : [];

  const isEdit = source?.__typename === "VmInstance";

  const disabledConfig = useContext(ConfigContext);

  const [bindCPUModalVisible, setBindCPUModalVisible] =
    useState<boolean>(false);

  const [hostUuid, setHostUuid] = useState<string>("");

  const [cpuNum, setCpuNum] = useState<number>(0);

  const [cpuBindList, setCpuBindList] = useState<any[]>(
    isEdit
      ? source?.systemTag?.vmCpuPinningList?.map(
          (cv: { vCPU: any; pCPU: string }) => ({
            vCPU: cv.vCPU,
            pCPUList: cv.pCPU?.split(","),
          }),
        )
      : [],
  );

  const { isRequired, numberRange } = useValidator(intl);

  const { data: customCpuModeData } = useQuery(getCustomCpuMode);

  useEffect(() => {
    if (!isEdit) {
      const guest = form.getFieldValue("guest");
      const os = form.getFieldValue("os");

      if (guest === "Linux") {
        form.setFieldsValue({
          hotPlug: true,
        });
      }

      if (guest === "Windows") {
        form.setFieldsValue({
          hotPlug: !!includes(winLists, os),
        });
      }
      if (guest === "Other") {
        form.setFieldsValue({
          hotPlug: false,
        });
      }
    }
  }, [form, isEdit]);

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
    if (cpuBindList.length > 0) {
      // CPU 总核数变化且已配置了 CPU NUMA 绑定，清除绑定
      setCpuBindList([]);
      form.setFieldsValue({ vnumaEnabled: false });
      form.setFieldsValue({ cpuBindListByVCpu: [] });
    }
    const nicMultiQueueNumKeys = keys(form.getFieldValue()).filter(
      (it) => it.indexOf("nicMultiQueueNum-") === 0,
    );
    let kvmAutoSetVmNicMultiqueue = false;
    const runPath = form.getFieldValue("runPath");
    const _nicMultiQueueNumValue = "1";
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
        value: val.toString(),
      })),
      { name: "sockedNum", value: val },
    ]);
  };

  useEffect(() => {
    if (!isEdit) {
      onCpuNumChange(4); // 创建页面中 初始化nicMultiQueueNum
    }
  }, [isEdit]);

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
                      <div style={STYLE_SOCKET_DESC}>
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
          if (source?.__typename !== "VmInstance") {
            const clusterKVMCpuModel =
              runPath?.[0]?.__typename === "Cluster"
                ? runPath?.[0]?.clusterKVMCpuModel
                : runPath?.[0]?.cluster?.clusterKVMCpuModel;

            if (clusterKVMCpuModel) {
              form.setFieldsValue({ CPUMode: clusterKVMCpuModel });
            } else {
              form.setFieldsValue({ CPUMode: "none" });
            }
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
                style={STYLE_CPU_MODE_SELECT}
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
          style={STYLE_RESOURCE_LEVEL_SELECT}
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
            pre.hotPlug !== cur.hotPlug
          }
        >
          {({ getFieldValue }) => {
            const cpuBindListByVCpu = getFieldValue("cpuBindListByVCpu");
            const runPath = getFieldValue("runPath");
            const hotPlug = getFieldValue("hotPlug");
            setCpuNum(limitCpuNum());
            // 存在多入口,后续还有 需要加条件
            const currentTypeName =
              runPath?.[0]?.__typename === "HostVO"
                ? "HostVO"
                : source?.__typename;

            //zone情况下,存一下hostUuid,source里面拿不到
            if (runPath?.[0]?.__typename === "HostVO") {
              setHostUuid(runPath?.[0]?.uuid);
            }

            const haveCpuBindListByVCpu = cpuBindListByVCpu?.every(
              (it: any) => it.pCPUList.length !== 0,
            );

            if (cpuBindListByVCpu?.length && haveCpuBindListByVCpu) {
              return (
                <div style={STYLE_BIND_CPU_TEXT}>
                  <Text>
                    {formatStructureCpuBindToSubmit(cpuBindListByVCpu)
                      ?.map?.((item) => `${item?.vCPU}:${item?.pCPU}`)
                      ?.join(";")}
                  </Text>
                  {disabledConfig.disabled ? (
                    <Tooltip title={disabledConfig.tooltip}>
                      <Icon
                        type="edit"
                        style={STYLE_EDIT_ICON}
                        color="disabled"
                      />
                    </Tooltip>
                  ) : (
                    <Icon
                      type="edit"
                      style={STYLE_EDIT_ICON}
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
                  <span>
                    <Button style={STYLE_BUTTON_LINK} variant="link" disabled>
                      {intl.formatMessage({
                        id: "virtualization.create.instance.cpu.bind.physics.cpu.set",
                        defaultMessage: "Binding",
                      })}
                    </Button>
                  </span>
                </Tooltip>
              );
            }

            if (hotPlug) {
              return (
                <Tooltip
                  title={intl.formatMessage({
                    id: "virtualization.create.instance.cpu.bind.physics.cpu.set.error",
                    defaultMessage:
                      "You cannot enable both CPU vNUMA and CPU Hot Plug simultaneously.",
                  })}
                >
                  <span>
                    <Button style={STYLE_BUTTON_LINK} variant="link" disabled>
                      {intl.formatMessage({
                        id: "virtualization.create.instance.cpu.bind.physics.cpu.set",
                        defaultMessage: "Binding",
                      })}
                    </Button>
                  </span>
                </Tooltip>
              );
            }

            if (disabledConfig.disabled) {
              return (
                <Tooltip title={disabledConfig.tooltip}>
                  <span>
                    <Button style={STYLE_BUTTON_LINK} variant="link" disabled>
                      {intl.formatMessage({
                        id: "virtualization.create.instance.cpu.bind.physics.cpu.set",
                        defaultMessage: "Binding",
                      })}
                    </Button>
                  </span>
                </Tooltip>
              );
            }

            return (
              <Button
                style={STYLE_BUTTON_LINK}
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
          if (guest === "Linux" && !isEdit && !didClickBindNumaCancel) {
            form.setFieldsValue({
              hotPlug: true,
            });
          }

          //hotPlug与cpuBindListByVCpu 互斥
          if (cpuBindListByVCpu?.length && haveCpuBindListByVCpu) {
            form.setFieldsValue({
              hotPlug: false,
            });
            switchDisable = true;
          }

          if (guest === "Windows") {
            if (!isEdit) {
              form.setFieldsValue({
                hotPlug: !!includes(winLists, os),
              });
            }

            switchDisable = !includes(winLists, os);
          }
          if (guest === "Other") {
            if (!isEdit) {
              form.setFieldsValue({
                hotPlug: false,
              });
            }
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
              description={<HotAddDescription />}
            >
              <Switch
                disabled={
                  switchDisable ||
                  disabledConfig.disabled ||
                  disableItems.includes("hotPlug")
                }
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
          const _cpuHideKVMMarkDisable = false;
          // 存在多入口,后续还有 需要加条件
          //
          const clusterKVMCpuModel =
            runPath?.[0]?.__typename === "Cluster"
              ? runPath?.[0]?.clusterKVMCpuModel
              : runPath?.[0]?.cluster?.clusterKVMCpuModel;

          if (clusterKVMCpuModel) {
            cpuHideKVMMarkDisable =
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
        cpuBindList={cpuBindList}
        isEdit={isEdit}
        visible={bindCPUModalVisible}
        setVisible={setBindCPUModalVisible}
        source={source}
        hostUuid={hostUuid}
        cpuNum={cpuNum}
        form={form}
        setCpuBindList={setCpuBindList}
      />
    </div>
  );
};

export default React.memo(CPUCard);
