import { useQuery } from "@apollo/client";
import { getCustomCpuMode } from "@zstack/virtualization-resource/src/gql/vm.gql";
import { Form, Select, Switch } from "@zstack/zsphere-components";
import type { globalConfigConfigList } from "@zstack/zsphere-hooks";
import { useLazyGlobalConfigQuery } from "@zstack/zsphere-hooks";
import { CpuArchitecture } from "@zstack/zsphere-types";
import type { FormInstance } from "antd/es/form";
import { cloneDeep, get, remove, includes, omit } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import style from "./style.module.less";

const CommonCpuMode = ["none", "host-model", "host-passthrough"];
const aarch64CpuMode = ["Kunpeng-920", "FT-2000+", "Tengyun-S2500"];

const vmGlobalConfig: globalConfigConfigList = [
  {
    category: "vm",
    name: "emulateHyperV",
  },
  {
    category: "kvm",
    name: "vm.cpuMode",
  },
  {
    category: "vm",
    name: "videoType",
  },
];

export interface IProps {
  form?: FormInstance;
  isCreate?: boolean;
}

const VmSetting: React.FC<IProps> = ({ form, isCreate }) => {
  const intl = useIntl();
  const { data: customCpuModeData } = useQuery(getCustomCpuMode);

  const { queryGlobalConfig, globalConfigDataMap } =
    useLazyGlobalConfigQuery(vmGlobalConfig);

  const [architecture, setArchitecture] = React.useState<string>("");

  const formData = React.useMemo(() => form?.getFieldsValue() ?? {}, [form]);

  const customCpuModeList: string[] = React.useMemo(() => {
    const customList = cloneDeep(
      get(customCpuModeData?.getCustomCpuMode, "list", []),
    );

    switch (architecture) {
      case CpuArchitecture.x86_64:
        return remove(
          customList,
          (it) => it != null && !includes(CommonCpuMode, it),
        );
      case CpuArchitecture.aarch64:
        return [...aarch64CpuMode];
      default:
        return remove(
          customList,
          (it) => it != null && !includes(CommonCpuMode, it),
        ); // 虚拟化只有x86_64，虚拟化编辑使用
    }
  }, [architecture, customCpuModeData?.getCustomCpuMode]);

  const cpuModelForCustomList = React.useMemo(() => {
    if (customCpuModeList?.length > 0) {
      // form?.setFieldsValue({ customCpuModel: customCpuModeList[0] })
    }
    return customCpuModeList
      ?.filter((it) => it != null)
      .map((it) => ({ value: it, label: it }));
  }, [customCpuModeList, form]);

  const cpuModelForArchList = React.useMemo(() => {
    switch (architecture) {
      case CpuArchitecture.x86_64:
        return [
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
      case CpuArchitecture.aarch64:
        return [
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
      default:
        return [
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
    }
  }, [architecture, intl]);

  React.useEffect(() => {
    if (formData.architecture) {
      setArchitecture(formData.architecture);
    }
  }, [formData]);

  React.useEffect(() => {
    if (isCreate) {
      queryGlobalConfig?.();
    }
  }, [isCreate, queryGlobalConfig]);

  React.useEffect(() => {
    const setFields = () => {
      const excludeKeys: string[] = ["kvm-vm.cpuMode", "vm-videoType"];

      const dataMap = omit(globalConfigDataMap, excludeKeys);

      const fields = Object.entries(dataMap).map(([key, { value }]) => {
        const _value = ["true", "false"].includes(value)
          ? JSON.parse(value)
          : value;

        return { name: key, value: _value };
      });

      form?.setFields(fields);

      if (architecture === CpuArchitecture.x86_64) {
        form?.setFieldsValue({
          "vm-videoType": "vga",
          cpuMode: "none",
        });
      }
      if (architecture === CpuArchitecture.aarch64) {
        form?.setFieldsValue({
          "vm-videoType": "virtio",
          cpuMode: "host-passthrough",
        });
      }
    };

    if (isCreate) {
      setFields();
    }
  }, [isCreate, globalConfigDataMap, architecture, form]);

  return (
    <>
      <Form.Item
        label={intl.formatMessage({
          id: "virtualization.cluster.field.ha.enable",
          defaultMessage: "VM HA",
        })}
        name="ha-vm.ha.level"
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "virtualization.cluster.field.ha.enable.iconTooltip",
              defaultMessage: `
iconTooltip`,
            })}
          </ReactMarkdown>
        }
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        label={intl.formatMessage({
          id: "virtualization.cluster.field.vm.ha.across.clusters",
          defaultMessage: "VM Cross-Cluster HA",
        })}
        name="vm-vm.ha.across.clusters"
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "virtualization.cluster.field.vm.ha.across.clusters.tooltip",
              defaultMessage: `
iconTooltip`,
            })}
          </ReactMarkdown>
        }
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      {/* 临时写法 */}
      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) => prev.architecture !== curr.architecture}
      >
        {({ getFieldValue }) => {
          const _architecture = getFieldValue("architecture");

          setArchitecture(_architecture);
          return null;
        }}
      </Form.Item>

      <Form.Item
        label={intl.formatMessage({
          id: "appoint.vmCpuModel",
          defaultMessage: "VM CPU Model",
        })}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "virtualization.appoint.vmCpuModel.tooltip",
              defaultMessage: `
iconTooltip`,
            })}
          </ReactMarkdown>
        }
      >
        <Form.Item noStyle name="cpuMode">
          <Select
            width="l"
            showSearch
            // getPopupContainer={(): HTMLElement =>
            //   document.querySelector('.advanced-setting-panel') as HTMLElement
            // }
            // options={[...cpuModelForArchList, ...cpuModelForCustomList]}
          >
            {cpuModelForArchList.map((it) => (
              <Select.Option key={it.value} value={it.value}>
                {it.label}
              </Select.Option>
            ))}
            <Select.Option className={style.selectSlot} disabled>
              {intl.formatMessage({
                id: "cluster.field.cpuModel.select.option.slot.custom.mode",
                defaultMessage: "Custom Mode",
              })}
            </Select.Option>
            {cpuModelForCustomList.map((it) => (
              <Select.Option key={it.value} value={it.value}>
                {it.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.cpuMode !== currentValues.cpuMode
          }
        >
          {({ getFieldValue: _getFieldValue }) => {
            return _getFieldValue('cpuMode') === 'custom' ? (
              <Form.Item noStyle name="customCpuModel">
                <Select
                  width={160}
                  style={{ marginLeft: 8 }}
                  showSearch
                  // getPopupContainer={(): HTMLElement =>
                  //   document.querySelector('.advanced-setting-panel') as HTMLElement
                  // }
                  options={cpuModelForCustomList}
                />
              </Form.Item>
            ) : null
          }}
        </Form.Item> */}
      </Form.Item>

      <Form.Item
        label={intl.formatMessage({
          id: "virtualization.cluster.field.emulateHyperV",
          defaultMessage: "VM Hyper-V",
        })}
        name="vm-emulateHyperV"
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "virtualization.cluster.field.emulateHyperV.tooltip",
              defaultMessage: `
iconTooltip`,
            })}
          </ReactMarkdown>
        }
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        label={intl.formatMessage({
          id: "virtualization.cluster.field.videoType",
          defaultMessage: "Video Card Type on Boot",
        })}
        name="vm-videoType"
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "virtualization.cluster.field.videoType.tooltip",
              defaultMessage: `
iconTooltip`,
            })}
          </ReactMarkdown>
        }
      >
        <Select
          width="l"
          options={["vga", "cirrus", "qxl", "virtio"].map((it) => ({
            label: it,
            value: it,
          }))}
        />
      </Form.Item>

      <Form.Item
        label={intl.formatMessage({
          id: "virtualization.cluster.field.auto.set.vm.nic.multiqueue",
          defaultMessage: "vNIC Multi-queue Upgrading",
        })}
        name="kvm-auto.set.vm.nic.multiqueue"
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "virtualization.cluster.field.auto.set.vm.nic.multiqueue.tooltip",
              defaultMessage: `
iconTooltip`,
            })}
          </ReactMarkdown>
        }
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>
    </>
  );
};

export default VmSetting;
