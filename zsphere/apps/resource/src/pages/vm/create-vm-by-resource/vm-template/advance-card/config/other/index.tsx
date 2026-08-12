import { Tooltip } from "@zstack/design";
import PcpuSelect, {
  useTreeData,
} from "@zstack/virtualization-resource/src/pages/vm/components/pcpu-select";
import { Switch, Form } from "@zstack/zsphere-components";
import type { FormCreateType } from "@zstack/zsphere-types";
import React, { useState, useEffect } from "react";
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
  source: any;
}

const { Item } = Form;

const OtherConfig: React.FC<IProps> = ({ form }) => {
  const intl = useIntl();
  const [hostUuid, setHostUuid] = useState("");

  const { treeData, hostNUMANodeObj, queryHostNUMANode } =
    useTreeData(hostUuid);

  // 监听 runPath 变化，设置相关字段
  const runPath = Form.useWatch("runPath", form);

  useEffect(() => {
    if (hostUuid) {
      queryHostNUMANode();
    }
  }, [hostUuid, queryHostNUMANode]);

  // 监听 runPath 变化，设置 haStickStragedy
  useEffect(() => {
    if (runPath?.[0]?.__typename) {
      let haStickStragedy = true;
      if (runPath[0].__typename === "HostVO") {
        haStickStragedy =
          runPath[0].cluster?.resourceConfigValue?.vmVmHaAcrossClusters ===
          "true";
      }
      if (runPath[0].__typename === "Cluster") {
        haStickStragedy =
          runPath[0].resourceConfigValue?.vmVmHaAcrossClusters === "true";
      }
      form.setFieldsValue({ haStickStragedy });
    }
  }, [runPath, form]);

  // 监听 runPath 变化，设置 emulateHyperV
  useEffect(() => {
    if (runPath?.[0]?.__typename) {
      let emulateHyperV = true;
      if (runPath[0].__typename === "HostVO") {
        emulateHyperV =
          runPath[0].cluster?.resourceConfigValue?.vmEmulateHyperV === "true";
      }
      if (runPath[0].__typename === "Cluster") {
        emulateHyperV =
          runPath[0].resourceConfigValue?.vmEmulateHyperV === "true";
      }
      form.setFieldsValue({ emulateHyperV });
    }
  }, [runPath, form]);

  // 监听 runPath 变化，设置 hostUuid
  useEffect(() => {
    if (runPath?.[0]?.uuid) {
      setHostUuid(runPath[0].uuid);
    }
  }, [runPath]);

  return (
    <div className={styles.content}>
      <Item
        name="vmCpuHypervisorFeature"
        label={intl.formatMessage({
          id: "hide.kvm.virtualization.remark",
          defaultMessage: "Hide KVM Virtualization Flag",
        })}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "vm.create.field.vmCpuHypervisorFeature.tooltip",
              defaultMessage: `### Hide KVM Virtualization Flag

Default: disabled. Specifies whether to hide the KVM virtualization flag. If enabled, <hidden state='on'> is inserted in the <kvm> field of the XML file defined for a newly started VM.`,
            })}
          </ReactMarkdown>
        }
        valuePropName="checked"
      >
        <Switch />
      </Item>
      <Item
        name="vmPortOff"
        label={intl.formatMessage({
          id: "vmware.io.port.mock.switch",
          defaultMessage: "VMware I/O Port Simulation",
        })}
        valuePropName="checked"
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "vm.create.field.vmPortOff.tooltip",
              defaultMessage: `### VMware I/O Port Simulation

1. Default: disabled. VMware IO port emulation allows KVM virtual machines to emulate IO ports in VMware virtualized environments, enabling KVM virtual machines to use the VMware IO port standard for compatibility with VMware virtualized environments.

2. Key purposes:

  * Migration & Compatibility: Allows for VM migration from VMware to a KVM environment, or to run both VMware and KVM VMs in a hybrid environment without significant configuration changes.
  * Testing & Development: Enables developers and testers to simulate a VMware environment using KVM VMs for application testing or configuration validation, eliminating the need for a separate VMware license.`,
            })}
          </ReactMarkdown>
        }
      >
        <Switch />
      </Item>
      <Item
        name="antiSpoofing"
        label={intl.formatMessage({
          id: "zsv.field.antiSpoofMingode",
          defaultMessage: "Anti-Spoofing Mode",
        })}
        valuePropName="checked"
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "vm.field.antiSpoofMingode.tooltip",
              defaultMessage: `### Anti-Spoofing Mode

Provides IP/MAC anti-spoofing and ARP anti-spoofing for VM instances. If enabled, VM instances can only communicate with outside networks using the IP/MAC addresses allocated by the Cloud.
`,
            })}
          </ReactMarkdown>
        }
      >
        <Switch />
      </Item>
      <Item noStyle shouldUpdate={(pre, cur) => pre.runPath !== cur.runPath}>
        {() => {
          return (
            <Item
              name="haStickStragedy"
              label={intl.formatMessage({
                id: "zsv.field.haStickStragedy",
                defaultMessage: "Cross-Cluster HA Policy",
              })}
              valuePropName="checked"
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "zsv.field.haStickStragedy.tooltip",
                    defaultMessage: `### Cross-Cluster HA Policy

  1. Applicable Scenarios: This strategy applies to scenarios where shared storage (distributed storage, NFS storage, SAN storage) is used, and virtual machines need to be migrated between hosts during maintenance or host replacement.
  2. This strategy only affects automatic VM migration behavior and does not impact other actions such as manual hot migration of virtual machines (changing the host), specifying a host to start a VM, or dynamic resource scheduling (DRS) strategies that change the host.
  3. When disabled, VMs will be restricted to only being active within the cluster where the strategy was enabled.
  4. When enabled, VMs in the above-mentioned scenarios will no longer be limited by the cluster's scope.`,
                  })}
                </ReactMarkdown>
              }
            >
              <Switch />
            </Item>
          );
        }}
      </Item>
      <Item noStyle shouldUpdate={(pre, cur) => pre.runPath !== cur.runPath}>
        {() => {
          return (
            <Item
              name="emulateHyperV"
              label="Hyper-V"
              valuePropName="checked"
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "zsv.field.emulateHyperV.tooltip",
                    defaultMessage: `### Hyper-V

Default: disabled. Specifies whether to enable Hyper-V emulation for a VM, primarily used for nested virtualization scenarios in Windows-based systems.`,
                  })}
                </ReactMarkdown>
              }
            >
              <Switch />
            </Item>
          );
        }}
      </Item>
      <Item shouldUpdate={(pre, cur) => pre.runPath !== cur.runPath}>
        {() => {
          const runPath = form.getFieldValue("runPath");

          return (
            <Item
              name="emulatorPin"
              label={intl.formatMessage({
                id: "emulator.pin",
                defaultMessage: "EmulatorPin",
              })}
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "zsv.field.emulatorPin.tooltip",
                    defaultMessage: `### EmulatorPin

1. EmulatorPin assigns all other threads than vCPU threads and IO threads of a VM to host physical CPUs (pCPUs).

2. After you configure EmulatorPin, relevant threads are to be running on assigned pCPUs.

3. If you do not need EmulatorPin configurations, clear all the associations and relevant threads are to be running on pCPUs based on the OS scheduling.`,
                  })}
                </ReactMarkdown>
              }
            >
              {runPath?.[0]?.__typename === "HostVO" ? (
                <PcpuSelect
                  allowClear
                  placeholder={intl.formatMessage({
                    id: "pCPU.select",
                    defaultMessage: "Select pCPU",
                  })}
                  width={320}
                  treeData={treeData}
                  hostNUMANodeObj={hostNUMANodeObj}
                  type="detail"
                />
              ) : (
                <Tooltip
                  title={intl.formatMessage({
                    id: "zsv.field.emulatorPin.runPath.no.host.specified.tooltip",
                    defaultMessage:
                      "Cannot configure EmulatorPin because you have not specified a host as the running location.",
                  })}
                >
                  <PcpuSelect
                    allowClear
                    disabled
                    placeholder={intl.formatMessage({
                      id: "pCPU.select",
                      defaultMessage: "Select pCPU",
                    })}
                    width={320}
                    treeData={treeData}
                    hostNUMANodeObj={hostNUMANodeObj}
                    type="detail"
                  />
                </Tooltip>
              )}
            </Item>
          );
        }}
      </Item>
      <Item
        name="migrateAutoConverge"
        label={intl.formatMessage({
          id: "hot.migrations.auto-converge.mode",
          defaultMessage: "Auto-Converge",
        })}
        valuePropName="checked"
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "zsv.field.migrateAutoConverge.tooltip",
              defaultMessage: `### Auto-Converge

1. Default: disabled. Allows you to enable or disable auto-converge when you hot migrate a KVM VM.

2. If the migration is blocked because the VM has been high-loaded for a long time, you can enable auto-converge to improve the success rate of the migration.

3. If your applications are performance-sensitive, we recommend that you disable auto-converge.`,
            })}
          </ReactMarkdown>
        }
      >
        <Switch />
      </Item>
      <Item
        name="hotPlugEnabled"
        label={intl.formatMessage({
          id: "globalConfig.pciDevice.hotPlugEnabled",
          defaultMessage: "PCI Hot Plug",
        })}
        valuePropName="checked"
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "zsv.field.hotPlugEnabled.tooltip",
              defaultMessage: `### PCI Hot Plug

Default: enabled. Specifies whether to enable hot plugging of PCI devices for a VM. If a hardware incompatibility error occurs during hot plugging or a hardware device does not support hot plugging, you can turn off this switch.`,
            })}
          </ReactMarkdown>
        }
      >
        <Switch />
      </Item>
    </div>
  );
};

export default React.memo(OtherConfig);
