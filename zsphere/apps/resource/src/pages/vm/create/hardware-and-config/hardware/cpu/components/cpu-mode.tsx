import { useQuery } from "@apollo/client";
import { getCustomCpuMode } from "@zstack/virtualization-resource/src/gql/vm.gql";
import { ConfigContext } from "@zstack/virtualization-resource/src/pages/vm/action/edit-config/config-context";
import { CPU_COMPAT_OS_LIST } from "@zstack/virtualization-resource/src/pages/vm/create/basic-config/os";
import { Form, Select } from "@zstack/zsphere-components";
import { CpuArchitecture } from "@zstack/zsphere-types";
import { cloneDeep, get } from "lodash-es";
import React, { useContext, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { aarch64CpuMode, CommonCpuMode } from "../utils";

import styles from "../style.module.less";

interface IProps {
  form?: any;
  isEdit: boolean;
}

const { Item } = Form;

const CPUMode: React.FC<IProps> = ({ form, isEdit }) => {
  const intl = useIntl();

  const disabledConfig = useContext(ConfigContext);

  const { data: customCpuModeData } = useQuery(getCustomCpuMode);

  const runPath = Form.useWatch("runPath", form);

  // 监听runPath变化，设置CPUMode字段
  useEffect(() => {
    if (!isEdit) {
      const clusterKVMCpuModel =
        runPath?.[0]?.__typename === "Cluster"
          ? runPath?.[0]?.clusterKVMCpuModel
          : runPath?.[0]?.cluster?.clusterKVMCpuModel;

      if (!clusterKVMCpuModel) {
        form.setFieldsValue({ CPUMode: "none" });
      } else if (
        !CPU_COMPAT_OS_LIST.has(form.getFieldValue("os")) ||
        clusterKVMCpuModel !== "none"
      ) {
        form.setFieldsValue({ CPUMode: clusterKVMCpuModel });
      }
    }
  }, [runPath, isEdit]);

  return (
    <Item
      noStyle
      shouldUpdate={(pre: any, cur: any) => {
        return pre.runPath !== cur.runPath;
      }}
    >
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
              style={{ width: 200 }}
              showSearch
              optionFilterProp="children"
              disabled={disabledConfig.disabled}
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
  );
};

export default React.memo(CPUMode);
