import { gql, useLazyQuery } from "@apollo/client";
import { queryHostSystemInfo } from "@zstack/virtualization-resource/src/gql/host.gql";
import PcpuSelect, {
  cpuStrToArr,
  getSelectValueFromCheckedKeys,
  useTreeData,
} from "@zstack/virtualization-resource/src/pages/vm/components/pcpu-select";
import { useResourceConfigQuery } from "@zstack/virtualization-resource/src/pages/vm/hooks/use-resource-config-query";
import { Switch, Form, Select } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import { isEqual, compact, values as lodashValues } from "lodash-es";
import React, { useState, useRef, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

const editVmOtherConfig = gql`
  mutation editVmOtherConfig($input: EditOtherConfigInput!) {
    editVmOtherConfig(input: $input) {
      actionId
    }
  }
`;

const EditOtherConfig: React.FC<{
  form: any;
  hostUuid: string;
  lastHostUuid?: string;
  visible: boolean;
  vmIsRunning?: boolean;
}> = ({ hostUuid, lastHostUuid, visible, vmIsRunning }) => {
  const intl = useIntl();
  const { treeData, hostNUMANodeObj, queryHostNUMANode } =
    useTreeData(hostUuid);
  const tooltip =
    vmIsRunning &&
    intl.formatMessage({
      id: "disable.vm.edit.action.with.running",
      defaultMessage: "Cannot modify this setting when the VM is running. Power off the VM and try again.",
    });

  const [getHostSystemInfo, { data: hostSystemInfoData }] = useLazyQuery(
    queryHostSystemInfo,
    {
      variables: { uuid: hostUuid || lastHostUuid || "" },
      fetchPolicy: "no-cache",
    },
  );
  const hostCpuModelName =
    hostSystemInfoData?.queryHostSystemInfo?.hostCpuModelName;

  // 使用ref存储函数引用，避免useEffect无限循环
  const queryHostNUMANodeRef = useRef(queryHostNUMANode);
  const getHostSystemInfoRef = useRef(getHostSystemInfo);

  // 在useEffect中更新ref值，避免在渲染期间访问ref
  useEffect(() => {
    queryHostNUMANodeRef.current = queryHostNUMANode;
    getHostSystemInfoRef.current = getHostSystemInfo;
  }, [queryHostNUMANode, getHostSystemInfo]);

  useEffect(() => {
    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/4b9b37db-f562-4bbc-b98c-1ef6af7e404a", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "edit-other-config.tsx:62",
        message: "useEffect triggered",
        data: { visible, hostUuid },
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "post-fix",
        hypothesisId: "A",
      }),
    }).catch(() => {});
    // #endregion
    if (visible) {
      // #region agent log
      fetch(
        "http://127.0.0.1:7243/ingest/4b9b37db-f562-4bbc-b98c-1ef6af7e404a",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "edit-other-config.tsx:66",
            message: "calling queryHostNUMANode and getHostSystemInfo",
            data: {},
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "post-fix",
            hypothesisId: "A",
          }),
        },
      ).catch(() => {});
      // #endregion
      queryHostNUMANodeRef.current();
      getHostSystemInfoRef.current();
    }
  }, [visible, hostUuid]);

  return (
    <>
      <Form.Item
        name="vmCpuHypervisorFeature"
        label={intl.formatMessage({
          id: "hide.kvm.virtualization.remark",
          defaultMessage: "Hide KVM Virtualization Flag",
        })}
        valuePropName="checked"
        tooltip={tooltip}
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
      >
        <Switch disabled={vmIsRunning} />
      </Form.Item>
      <Form.Item
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
        tooltip={tooltip}
      >
        <Switch disabled={vmIsRunning} />
      </Form.Item>
      <Form.Item
        name="antiSpoofing"
        label={intl.formatMessage({
          id: "vm.field.antiSpoofMingode",
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
      </Form.Item>
      <Form.Item
        name="haStickStragedy"
        label={intl.formatMessage({
          id: "hastickstragedy",
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
      </Form.Item>
      <Form.Item
        name="emulateHyperV"
        label="Hyper-V"
        valuePropName="checked"
        tooltip={tooltip}
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
        <Switch disabled={vmIsRunning} />
      </Form.Item>
      <Form.Item
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
        <PcpuSelect
          allowClear
          placeholder={intl.formatMessage({
            id: "pCPU.select",
            defaultMessage: "Select pCPU",
          })}
          widthClassName="w-80"
          treeData={treeData}
          hostNUMANodeObj={hostNUMANodeObj}
          type="detail"
        />
      </Form.Item>
      <Form.Item
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
      </Form.Item>
      <Form.Item
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
      </Form.Item>
      {hostCpuModelName?.toLowerCase().includes("hygon") && (
        <Form.Item
          name="vmCpuIdVendor"
          label={intl.formatMessage({
            id: "vm.edit.other.config.field.cpuid.vendor",
            defaultMessage: "CPU Vendor ID",
          })}
          icon="info"
          iconTooltip={
            <ReactMarkdown>
              {intl.formatMessage({
                id: "vm.edit.other.config.field.cpuid.vendor.tooltip",
                defaultMessage:
                  "### CPU Vendor ID\n\nIf the virtual machine is running on a host with Hygon CPUs, it is recommended to set the VM's CPU vendor ID to AuthenticAMD to ensure compatibility with various operating systems and maintain normal VM operation. If set to None, certain operating systems may experience compatibility issues.",
              })}
            </ReactMarkdown>
          }
          initialValue="AuthenticAMD"
        >
          <Select
            className="width-320"
            options={[
              { label: "AuthenticAMD", value: "AuthenticAMD" },
              { label: "None", value: "None" },
            ]}
          />
        </Form.Item>
      )}
    </>
  );
};

const Action: React.FC<IActionWrapperProps<IVM>> = ({
  visible,
  setVisible,
  selectedList = [],
  refetch,
}) => {
  const doAction = useAction();
  const intl = useIntl();
  const [form] = Form.useForm();

  const vm = selectedList?.[0];
  const [resourceConfig] = useResourceConfigQuery(
    vm?.uuid,
    ["vm", "kvm", "pciDevice"],
    [
      "vm.cpuid.vendor",
      "kvmHiddenState",
      "vmPortOff",
      "emulateHyperV",
      "migrate.autoConverge",
      "hotPlugEnabled",
    ],
    visible,
  );

  const [initialValues, setInitialValues] = useState<{ [prop: string]: any }>(
    {},
  );

  useEffect(() => {
    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/4b9b37db-f562-4bbc-b98c-1ef6af7e404a", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "edit-other-config.tsx:333",
        message: "Action useEffect triggered",
        data: {
          visible,
          vmUuid: vm?.uuid,
          resourceConfigRef: resourceConfig?.["kvmHiddenState"]?.value,
        },
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "C",
      }),
    }).catch(() => {});
    // #endregion
    if (visible && vm) {
      const value = {
        vmCpuHypervisorFeature:
          resourceConfig?.kvmHiddenState?.value === "true",
        vmPortOff: resourceConfig?.vmPortOff?.value === "true",
        antiSpoofing: !!vm?.systemTag?.antiSpoofing,
        haStickStragedy: !!vm?.systemTag?.haStickStragedy,
        emulateHyperV: resourceConfig?.emulateHyperV?.value === "true",
        emulatorPin: cpuStrToArr(vm?.emulatorPin),
        migrateAutoConverge:
          resourceConfig?.["migrate.autoConverge"]?.value === "true",
        vmCpuIdVendor: resourceConfig?.["vm.cpuid.vendor"]?.value,
        hotPlugEnabled: resourceConfig?.hotPlugEnabled?.value === "true",
      };
      // #region agent log
      fetch(
        "http://127.0.0.1:7243/ingest/4b9b37db-f562-4bbc-b98c-1ef6af7e404a",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "edit-other-config.tsx:348",
            message: "before setInitialValues and setFieldsValue",
            data: { valueKeys: Object.keys(value) },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "D",
          }),
        },
      ).catch(() => {});
      // #endregion
      setInitialValues(value);
      form.setFieldsValue(value);
      // #region agent log
      fetch(
        "http://127.0.0.1:7243/ingest/4b9b37db-f562-4bbc-b98c-1ef6af7e404a",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "edit-other-config.tsx:350",
            message: "after setInitialValues and setFieldsValue",
            data: {},
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "D",
          }),
        },
      ).catch(() => {});
      // #endregion
    }
  }, [visible, vm, resourceConfig]);

  const onOk = async (values: any) => {
    const payload: any = {
      updateResourceConfigPayload: [],
    };
    if (
      !isEqual(
        values.vmCpuHypervisorFeature,
        initialValues.vmCpuHypervisorFeature,
      )
    ) {
      payload.updateResourceConfigPayload.push({
        uuid: "xxx",
        name: "kvmHiddenState",
        category: "vm",
        resourceUuid: vm?.uuid,
        value: values.vmCpuHypervisorFeature.toString(),
      });
    }

    if (!isEqual(values.vmPortOff, initialValues.vmPortOff)) {
      payload.updateResourceConfigPayload.push({
        uuid: "xxx",
        name: "vmPortOff",
        category: "vm",
        resourceUuid: vm?.uuid,
        value: values.vmPortOff.toString(),
      });
    }

    if (!isEqual(values.antiSpoofing, initialValues.antiSpoofing)) {
      payload.setVmCleanTrafficPayload = {
        uuid: vm?.uuid,
        enable: values.antiSpoofing,
      };
    }

    if (!isEqual(values.haStickStragedy, initialValues.haStickStragedy)) {
      if (values.haStickStragedy) {
        payload.setHaStickStragedyPayload = { uuid: vm?.uuid };
      } else {
        payload.removeHaStickStragedyPayload = {
          vmInstanceUuid: vm?.uuid,
          clusterUuid: vm?.clusterUuid,
        };
      }
    }

    if (!isEqual(values.emulateHyperV, initialValues.emulateHyperV)) {
      payload.updateResourceConfigPayload.push({
        uuid: "xxx",
        name: "emulateHyperV",
        category: "vm",
        resourceUuid: vm?.uuid,
        value: values.emulateHyperV.toString(),
      });
    }

    if (!isEqual(values.emulatorPin, initialValues.emulatorPin)) {
      payload.setVmEmulatorPinPayload = {
        uuid: vm?.uuid,
        emulatorPinning:
          getSelectValueFromCheckedKeys(values.emulatorPin).join(",") ?? "",
      };
    }

    if (
      !isEqual(values.migrateAutoConverge, initialValues.migrateAutoConverge)
    ) {
      payload.updateResourceConfigPayload.push({
        uuid: "xxx",
        name: "migrate.autoConverge",
        category: "kvm",
        resourceUuid: vm?.uuid,
        value: values.migrateAutoConverge.toString(),
      });
    }

    if (!isEqual(values.hotPlugEnabled, initialValues.hotPlugEnabled)) {
      payload.updateResourceConfigPayload.push({
        uuid: "xxx",
        name: "hotPlugEnabled",
        category: "pciDevice",
        resourceUuid: vm?.uuid,
        value: values.hotPlugEnabled.toString(),
      });
    }

    if (
      values.vmCpuIdVendor &&
      !isEqual(values.vmCpuIdVendor, initialValues.vmCpuIdVendor)
    ) {
      payload.updateResourceConfigPayload.push({
        name: "vm.cpuid.vendor",
        category: "vm",
        resourceUuid: vm?.uuid,
        value: values.vmCpuIdVendor,
      });
    }

    if (compact(lodashValues(payload))?.length === 0) {
      return;
    }

    doAction({
      mutation: editVmOtherConfig,
      payload,
      name: intl.formatMessage({
        id: "edit.other.config",
        defaultMessage: "Modify Other Options",
      }),
      total: 1,
      onFinish: () => {
        refetch?.();
      },
    });
  };

  return (
    <DialogForm
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "edit.other.config",
        defaultMessage: "Modify Other Options",
      })}
      form={form}
      onOk={onOk}
      resourceName={formatResourceName(selectedList, intl)}
    >
      <Form
        form={form}
        initialValues={{
          emulatorPin: [],
        }}
      >
        <EditOtherConfig
          hostUuid={selectedList?.[0]?.hostUuid ?? -1}
          lastHostUuid={selectedList?.[0]?.lastHostUuid}
          visible={visible}
          vmIsRunning={vm?.state === "Running"}
          form={form}
        />
      </Form>
    </DialogForm>
  );
};

export default Action;
