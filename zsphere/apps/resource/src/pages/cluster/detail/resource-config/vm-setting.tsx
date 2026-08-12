import { useLazyQuery } from "@apollo/client";
import { queryGlobalConfigCpuMode } from "@zstack/virtualization-resource/src/gql/vm.gql";
import { List } from "@zstack/zsphere-components";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

interface IProps {
  current: ICluster;
}

const VmSetting: React.FC<IProps> = ({ current }) => {
  const intl = useIntl();

  const [getGlobalConfigCpuMode, { data: globalConfigCpuMode }] = useLazyQuery(
    queryGlobalConfigCpuMode,
  );

  React.useEffect(() => {
    if (!current.clusterKVMCpuModel) {
      getGlobalConfigCpuMode();
    }
  }, [current.clusterKVMCpuModel]);

  const vmCpuMode = React.useMemo(() => {
    if (current.clusterKVMCpuModel === "none") {
      return intl.formatMessage({
        id: "none",
        defaultMessage: "None",
      });
    }

    if (current.clusterKVMCpuModel === "host-model") {
      return intl.formatMessage({
        id: "vm.cpuMode.hostModel",
        defaultMessage: "Compatible",
      });
    }

    if (current.clusterKVMCpuModel === "host-passthrough") {
      return intl.formatMessage({
        id: "vm.cpuMode.hostPassthrough",
        defaultMessage: "Passthrough",
      });
    }

    if (current.clusterKVMCpuModel) {
      return current.clusterKVMCpuModel;
    }

    return globalConfigCpuMode?.queryGlobalConfigCpuMode?.cpuMode
      ? `${globalConfigCpuMode?.queryGlobalConfigCpuMode?.cpuMode}  (${intl.formatMessage(
          {
            id: "use.global.cpuMode",
            defaultMessage: "Use System Parameter",
          },
        )})`
      : null;
  }, [globalConfigCpuMode, current.clusterKVMCpuModel, intl]);

  const isOpenOrClosed = React.useCallback(
    (value) => {
      return String(value) === "true"
        ? intl.formatMessage({
            id: "open",
            defaultMessage: "Enabled",
          })
        : intl.formatMessage({
            id: "closed",
            defaultMessage: "Disabled",
          });
    },
    [intl],
  );

  const list = React.useMemo(() => {
    return [
      {
        label: intl.formatMessage({
          id: "virtualization.cluster.field.ha.enable",
          defaultMessage: "VM HA",
        }),
        value: isOpenOrClosed(
          current?.resourceConfigValue?.haVmHaLevel === "NeverStop",
        ),
      },
      {
        label: intl.formatMessage({
          id: "virtualization.cluster.field.vm.ha.across.clusters",
          defaultMessage: "VM Cross-Cluster HA",
        }),
        value: isOpenOrClosed(
          current?.resourceConfigValue?.vmVmHaAcrossClusters,
        ),
      },
      {
        label: intl.formatMessage({
          id: "appoint.vmCpuModel",
          defaultMessage: "VM CPU Model",
        }),
        value: vmCpuMode,
      },
      {
        label: intl.formatMessage({
          id: "virtualization.cluster.field.emulateHyperV",
          defaultMessage: "VM Hyper-V",
        }),
        value: isOpenOrClosed(current?.resourceConfigValue?.vmEmulateHyperV),
      },
      {
        label: intl.formatMessage({
          id: "virtualization.cluster.field.videoType",
          defaultMessage: "Video Card Type on Boot",
        }),
        value: current?.resourceConfigValue?.vmVideoType,
      },
      {
        label: intl.formatMessage({
          id: "virtualization.cluster.field.auto.set.vm.nic.multiqueue",
          defaultMessage: "vNIC Multi-queue Upgrading",
        }),
        value: isOpenOrClosed(
          current?.resourceConfigValue?.kvmAutoSetVmNicMultiqueue,
        ),
      },
    ];
  }, [intl, current, vmCpuMode]);

  return <List list={list} />;
};

export default VmSetting;
