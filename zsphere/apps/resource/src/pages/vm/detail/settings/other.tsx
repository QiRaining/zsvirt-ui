import { useQuery } from "@apollo/client";
import { queryHostSystemInfo } from "@zstack/virtualization-resource/src/gql/host.gql";
import { cpuStrToArr } from "@zstack/virtualization-resource/src/pages/vm/components/pcpu-select";
import { List, ResourceName } from "@zstack/zsphere-components";
import { Tag } from "@zstack/zsphere-components";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

interface IProps {
  detail: IVM;
  resourceConfig: any;
}

const OtherSetting: React.FC<IProps> = ({ detail, resourceConfig }) => {
  const intl = useIntl();

  const { data } = useQuery(queryHostSystemInfo, {
    variables: { uuid: detail?.hostUuid || detail?.lastHostUuid || "" },
    fetchPolicy: "no-cache",
  });
  const hostCpuModelName = data?.queryHostSystemInfo?.hostCpuModelName;

  const list = React.useMemo(() => {
    return [
      {
        label: intl.formatMessage({
          id: "hide.kvm.virtualization.remark",
          defaultMessage: "Hide KVM Virtualization Flag",
        }),
        value:
          resourceConfig?.kvmHiddenState?.value === "true"
            ? intl.formatMessage({ id: "open", defaultMessage: "Enabled" })
            : intl.formatMessage({ id: "close", defaultMessage: "Disabled" }),
      },
      {
        label: intl.formatMessage({
          id: "vmware.io.port.mock.switch",
          defaultMessage: "VMware I/O Port Simulation",
        }),
        value:
          resourceConfig?.vmPortOff?.value === "true"
            ? intl.formatMessage({ id: "open", defaultMessage: "Enabled" })
            : intl.formatMessage({ id: "close", defaultMessage: "Disabled" }),
      },
      {
        label: intl.formatMessage({
          id: "vm.field.antiSpoofMingode",
          defaultMessage: "Anti-Spoofing Mode",
        }),
        value: <ResourceName value={!!detail.systemTag?.antiSpoofing} />,
      },
      {
        label: intl.formatMessage({
          id: "crossClusterHaStrategy",
          defaultMessage: "Cross-Cluster HA Policy",
        }),
        value: <ResourceName value={!!detail.systemTag?.haStickStragedy} />,
      },
      {
        label: intl.formatMessage({
          id: "hyperv.switch",
          defaultMessage: "Hyper-V",
        }),
        value:
          resourceConfig?.emulateHyperV?.value === "true"
            ? intl.formatMessage({ id: "open", defaultMessage: "Enabled" })
            : intl.formatMessage({ id: "close", defaultMessage: "Disabled" }),
      },
      {
        label: intl.formatMessage({
          id: "emulator.pin",
          defaultMessage: "EmulatorPin",
        }),
        value: cpuStrToArr(detail.emulatorPin).map((item) => {
          return (
            <Tag key={item} color="#F0F2F5">
              {item}
            </Tag>
          );
        }),
      },
      {
        label: intl.formatMessage({
          id: "hot.migrations.auto-converge.mode",
          defaultMessage: "Auto-Converge",
        }),
        value:
          resourceConfig?.["migrate.autoConverge"]?.value === "true"
            ? intl.formatMessage({ id: "open", defaultMessage: "Enabled" })
            : intl.formatMessage({ id: "close", defaultMessage: "Disabled" }),
      },
      {
        label: intl.formatMessage({
          id: "globalConfig.pciDevice.hotPlugEnabled",
          defaultMessage: "PCI Hot Plug",
        }),
        value:
          resourceConfig?.hotPlugEnabled?.value === "true"
            ? intl.formatMessage({ id: "open", defaultMessage: "Enabled" })
            : intl.formatMessage({ id: "close", defaultMessage: "Disabled" }),
      },
      {
        label: intl.formatMessage({
          id: "vm.create.field.cpuid.vendor",
          defaultMessage: "CPU Vendor ID",
        }),
        show:
          !!hostCpuModelName &&
          hostCpuModelName.toLowerCase().includes("hygon"),
        value: resourceConfig?.["vm.cpuid.vendor"]?.value,
      },
    ];
  }, [intl, detail, resourceConfig, hostCpuModelName]);

  return <List list={list} />;
};

export default OtherSetting;
