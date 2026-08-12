import { Button } from "@zstack/design";
import { Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { ConfigContext } from "@zstack/virtualization-resource/src/pages/vm/action/edit-config/config-context";
import { formatStructureCpuBindToSubmit } from "@zstack/virtualization-resource/src/pages/vm/utils";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
} from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import type { FormCreateType } from "@zstack/zsphere-types";
import { keys, isNumber } from "lodash-es";
import React, { useContext, useRef, useState, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import BindCPUModal from "../../../components/bind-cpu-modal";
import CPUMode from "./components/cpu-mode";
import HotPlug from "./components/hot-plug";
import SockedNum from "./components/socked-num";
import { MAX_CPU_NUM } from "./utils";

import styles from "./style.module.less";

interface IProps {
  hideTag?: boolean;
  hideDescription?: boolean;
  hideQuantity?: boolean;
  setFields?: Function;
  formCreateType?: FormCreateType;
  form?: any;
  source: any;
  isEdit?: boolean;
}

const { Item } = Form;

const STYLE_WIDTH_200 = { width: 200 } as const;
const STYLE_PADDING_0 = { padding: 0 } as const;

const CPUCard: React.FC<IProps> = ({ form, source, isEdit = false }) => {
  const intl = useIntl();

  const lockRef = useRef(true);

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

  // 使用 Form.useWatch 监听字段变化，避免在渲染时调用 setState
  const runPath = Form.useWatch("runPath", form);
  const totalCoreNum = Form.useWatch("totalCoreNum", form);

  // 在 useEffect 中更新状态，而不是在渲染函数中
  useEffect(() => {
    if (runPath?.[0]?.__typename === "HostVO") {
      setHostUuid(runPath[0].uuid);
    }
  }, [runPath]);

  useEffect(() => {
    if (totalCoreNum !== undefined) {
      const limitedCpuNum =
        totalCoreNum > MAX_CPU_NUM ? MAX_CPU_NUM : totalCoreNum;
      setCpuNum(limitedCpuNum);
    }
  }, [totalCoreNum]);

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
      form.setFieldsValue({ vnumaEnabled: false, cpuBindListByVCpu: [] });
    }

    //,网卡多队列只在VM创建时候跟CPU个数联动，以及在新添加网卡的时候跟CPU联动，其他时候就不用支持联动了。
    if (!isEdit) {
      const nicMultiQueueNumKeys = keys(form.getFieldValue()).filter(
        (it) => it.indexOf("nicMultiQueueNum-") === 0,
      );

      let kvmAutoSetVmNicMultiqueue = false;
      const runPath = form.getFieldValue("runPath");
      let nicMultiQueueNumValue = val;

      if (runPath?.[0]) {
        const isHost = runPath[0].__typename === "HostVO";
        const isCluster = runPath[0].__typename === "Cluster";

        if (isHost || isCluster) {
          kvmAutoSetVmNicMultiqueue =
            runPath[0][isHost ? "cluster" : ""]?.resourceConfigValue
              ?.kvmAutoSetVmNicMultiqueue !== "false";
        }
      }

      if (kvmAutoSetVmNicMultiqueue && isNumber(val)) {
        nicMultiQueueNumValue = val < 12 ? val : 12;
      }

      form.setFields([
        ...nicMultiQueueNumKeys.map((key) => ({
          name: key,
          value: nicMultiQueueNumValue.toString(),
        })),
        { name: "sockedNum", value: val.toString() },
      ]);
    } else if (!disabledConfig.disabled) {
      form.setFields([{ name: "sockedNum", value: val.toString() }]);
    }
  };

  // ZSV-3824, 数字太大会导致页面卡死
  const _limitCpuNum = () => {
    const formCpuNum = form.getFieldValue("totalCoreNum");
    return formCpuNum > MAX_CPU_NUM ? MAX_CPU_NUM : formCpuNum;
  };

  const validateTotalCpuNum = (_rule: any, val: number | string) => {
    const sockedNum = Number(form.getFieldValue("sockedNum"));
    const totalCpus = Number(val);
    if (totalCpus % sockedNum !== 0) {
      return Promise.reject(
        intl.formatMessage({
          id: "virtualization.create.instance.cpu.core.num.error",
          defaultMessage: "The cores need to be divisible by the cores per socket.",
        }),
      );
    }
    return Promise.resolve();
  };

  return (
    <div className={styles.content} key="cpuCard">
      <Item
        label={intl.formatMessage({
          id: "virtualization.create.instance.cpu.core.num",
          defaultMessage: "Cores",
        })}
        name="totalCoreNum"
        rules={[
          isRequired(),
          numberRange(1, MAX_CPU_NUM),
          ...(disabledConfig.disabled
            ? [{ validator: validateTotalCpuNum }]
            : []),
        ]}
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
          disabled={disabledConfig.cpuNumDisabled}
          className={styles.cpuNum}
          onChange={onCpuNumChange}
          min={1}
          max={MAX_CPU_NUM}
        />
      </Item>
      <SockedNum form={form} isEdit={isEdit} />
      <CPUMode form={form} isEdit={isEdit} />
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
        <Select style={STYLE_WIDTH_200}>
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
        className={styles.cpuBindField}
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
            const currentRunPath = getFieldValue("runPath");
            const hotPlug = getFieldValue("hotPlug");
            // 存在多入口,后续还有 需要加条件
            const currentTypeName =
              currentRunPath?.[0]?.__typename === "HostVO"
                ? "HostVO"
                : source?.__typename;

            if (cpuBindList?.length) {
              return (
                <div className={styles.cpuBindList}>
                  {formatStructureCpuBindToSubmit(cpuBindList).map(
                    ({ vCPU, pCPU }) => {
                      const content = `${vCPU}:${pCPU}`;
                      return (
                        <div key={content} className={styles.cpuBindItem}>
                          {content}
                        </div>
                      );
                    },
                  )}
                  {disabledConfig.disabled ? (
                    <Tooltip title={disabledConfig.tooltip}>
                      <Icon
                        type="edit"
                        className={styles.editIcon}
                        color="disabled"
                      />
                    </Tooltip>
                  ) : (
                    <Icon
                      type="edit"
                      className={styles.editIcon}
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
                  lockRef.current = false;
                }}
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
      <HotPlug
        form={form}
        isEdit={isEdit}
        cpuBindList={cpuBindList}
        lockRef={lockRef}
      />
      <Item
        noStyle
        shouldUpdate={(pre: any, cur: any) =>
          pre.runPath !== cur.runPath || pre.CPUMode !== cur.CPUMode
        }
      >
        {() => {
          const cpuMode = form?.getFieldValue("CPUMode");
          const cpuNone = cpuMode === "None" || cpuMode === "none";

          // 存在多入口,后续还有 需要加条件
          //
          //

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
              <Switch disabled={cpuNone || disabledConfig.disabled} />
            </Item>
          );
        }}
      </Item>
      <BindCPUModal
        isEdit={isEdit}
        cpuBindList={cpuBindList}
        setCpuBindList={setCpuBindList}
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
