import { useLazyQuery, gql } from "@apollo/client";
import { Text } from "@zstack/design";
import { queryGlobalConfigCpuMode } from "@zstack/virtualization-resource/src/gql/vm.gql";
import { DraggableCard } from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { List } from "@zstack/zsphere-components";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

const GLOBAL_CONFIG = gql`
  query globalConfig($category: String!, $name: String!) {
    globalConfig(category: $category, name: $name) {
      category
      defaultValue
      description
      name
      value
      uuid
      isValid
    }
  }
`;

export interface IProps {
  detail: ICluster;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  serRouterTabTarget?: (prop: string) => void;
}

const RelativeObject: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed,
  serRouterTabTarget,
}) => {
  const intl = useIntl();

  const [getGlobalConfigCpuMode, { data: globalConfigCpuMode }] = useLazyQuery(
    queryGlobalConfigCpuMode,
  );

  React.useEffect(() => {
    if (!detail.clusterKVMCpuModel) {
      getGlobalConfigCpuMode();
    }
  }, [detail.clusterKVMCpuModel]);

  const isOpenOrClosed = React.useCallback(
    (value) => {
      return value === "true"
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

  const vmCpuMode = React.useMemo(() => {
    if (detail.clusterKVMCpuModel === "none") {
      return;
    }

    if (detail.clusterKVMCpuModel === "host-model") {
      return intl.formatMessage({
        id: "vm.cpuMode.hostModel",
        defaultMessage: "Compatible",
      });
    }

    if (detail.clusterKVMCpuModel === "host-passthrough") {
      return intl.formatMessage({
        id: "vm.cpuMode.hostPassthrough",
        defaultMessage: "Passthrough",
      });
    }

    if (detail.clusterKVMCpuModel) {
      return detail.clusterKVMCpuModel;
    }

    return globalConfigCpuMode?.queryGlobalConfigCpuMode?.cpuMode
      ? `${globalConfigCpuMode?.queryGlobalConfigCpuMode?.cpuMode}  (${intl.formatMessage(
          {
            id: "use.global.cpuMode",
            defaultMessage: "Use System Parameter",
          },
        )})`
      : null;
  }, [globalConfigCpuMode, detail.clusterKVMCpuModel, intl]);

  const [getGlobalConfig, { data: globalConfigData }] =
    useLazyQuery(GLOBAL_CONFIG);
  const { globalConfig: _globalConfig } = globalConfigData || {};
  React.useEffect(() => {
    if (detail?.checkCpuModel === "default") {
      getGlobalConfig({
        variables: {
          category: "kvm",
          name: "checkHostCpuModelName",
        },
      });
    }
  }, [detail?.checkCpuModel, getGlobalConfig]);
  // const noCheck = intl.formatMessage({ id: 'noCheck', defaultMessage: '不检查' })
  // const inspect = intl.formatMessage({ id: 'inspect', defaultMessage: '检查' })

  const noCheck = intl.formatMessage({ id: "closed", defaultMessage: "Disabled" });
  const inspect = intl.formatMessage({ id: "open", defaultMessage: "Enabled" });

  const checkCpuModelValue = React.useMemo(
    () =>
      `${_globalConfig?.value === "false" ? noCheck : inspect}  (${intl.formatMessage(
        {
          id: "use.global.cpuMode",
          defaultMessage: "Use System Parameter",
        },
      )})`,
    [inspect, intl, noCheck, _globalConfig],
  );

  // 物理机CPU型号设置
  const checkCpuModelList = [
    {
      label: inspect,
      value: "true",
    },
    {
      label: noCheck,
      value: "false",
    },
    {
      label: checkCpuModelValue,
      value: "default",
    },
  ];

  const list = React.useMemo<Array<ListItem>>(
    () => [
      {
        label: intl.formatMessage({
          id: "vdiNetwork",
          defaultMessage: "VDI Network",
        }),
        value: detail?.displayNetworkCidr ? (
          <Text>{detail?.displayNetworkCidr}</Text>
        ) : undefined,
        icon: "info",
        iconTooltip: (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "cluster.field.vdiNetwork.tooltip",
              defaultMessage: `### VDI Network

1. Enter the VDI network CIDR if you deployed a network used independently by VDI.
2. If this setting does not take effect, VDI will use the management network by default.`,
            })}
          </ReactMarkdown>
        ),
      },
      {
        label: intl.formatMessage({
          id: "migrateNetwork",
          defaultMessage: "Migration Network",
        }),
        value: detail?.migrateNetworkCidr ? (
          <Text>{detail?.migrateNetworkCidr}</Text>
        ) : undefined,
        icon: "info",
        iconTooltip: (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "cluster.field.migrateNetwork.tooltip",
              defaultMessage: `### Migration Network

1. The network used for migrating virtual machines. Enter the CIDR of the migration network here.
2. If not set, the management network will be used for VM migration by default.`,
            })}
          </ReactMarkdown>
        ),
      },
      {
        label: intl.formatMessage({
          id: "cpu.overProvisioning.ratio",
          defaultMessage: "CPU Overcommit Ratio",
        }),
        value: `${detail.resourceConfigValue?.hostCpuOverProvisioningRatio ?? 0} : 1`,
        icon: "info",
        iconTooltip: (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "cluster.field.cpu.overProvisioning.ratio.tooltip",
              defaultMessage: `### CPU Overcommit Ratio

Controls the number of virtual CPUs allocated to virtual machines. The calculation formula: Physical CPU Total Threads × CPU Overcommit Ratio = Allocatable Virtual CPUs.`,
            })}
          </ReactMarkdown>
        ),
      },
      {
        label: intl.formatMessage({
          id: "overProvisioning.memory",
          defaultMessage: "Memory Overcommit Ratio",
        }),
        value: `${detail.resourceConfigValue?.mevocoOverProvisioningMemory ?? 0} : 1`,
        icon: "info",
        iconTooltip: (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "cluster.field.overProvisioning.memory.tooltip",
              defaultMessage: `### Memory Overcommit Ratio

Controls the amount of virtual memory capacity allocated to a virtual machine. The calculation formula: (Physical Memory Capacity − Reserved Capacity) × Memory Overcommit Ratio = Allocatable Virtual Memory Capacity.`,
            })}
          </ReactMarkdown>
        ),
      },
      {
        label: intl.formatMessage({
          id: "virtualization.cluster.detail.field.vm.cpuMode",
          defaultMessage: "VM CPU Mode",
        }),
        value: vmCpuMode,
        icon: "info",
        iconTooltip: (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "virtualization.appoint.vmCpuModel.tooltip",
              defaultMessage: `
iconTooltip`,
            })}
          </ReactMarkdown>
        ),
      },
      {
        label: intl.formatMessage({
          id: "virtualization.cluster.detail.field.host.cpuMode",
          defaultMessage: "Host CPU Model Check",
        }),
        value: checkCpuModelList.find(
          (model) => model.value === detail.checkCpuModel,
        )?.label,
        icon: "info",
        iconTooltip: (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "virtualization.cluster.field.checkCpuModel.iconTooltip",
              defaultMessage: `
iconTooltip`,
            })}
          </ReactMarkdown>
        ),
      },
      {
        label: intl.formatMessage({
          id: "virtualization.cluster.field.vm.ha.across.clusters",
          defaultMessage: "VM Cross-Cluster HA",
        }),
        value: isOpenOrClosed(
          detail?.resourceConfigValue?.vmVmHaAcrossClusters,
        ),
        icon: "info",
        iconTooltip: (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "virtualization.cluster.field.vm.ha.across.clusters.tooltip",
              defaultMessage: `
iconTooltip`,
            })}
          </ReactMarkdown>
        ),
      },
    ],
    [intl, detail, vmCpuMode, checkCpuModelList, isOpenOrClosed],
  );

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "config.info",
        defaultMessage: "Configurations",
      })}
      isList
      onCollapseChange={onCollapseChange}
      collapsed={collapsed}
      titleActions={[
        {
          icon: "external-link",
          tooltip: intl.formatMessage({
            id: "see.more",
            defaultMessage: "More",
          }),
          onClick: () => serRouterTabTarget?.("setting"),
        },
      ]}
      // titleActions={[
      //   {
      //     icon: 'edit',
      //     tooltip: intl.formatMessage({ id: 'edit.config', defaultMessage: '修改配置' }),
      //     onClick: () => console.log('need to do')
      //   }
      // ]}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
};

export default RelativeObject;
