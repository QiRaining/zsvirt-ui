import { Text } from "@zstack/design";
import {
  ResourceName,
  ShareType,
  useShareTypeFilters,
} from "@zstack/zsphere-components";
import { ConstantType } from "@zstack/zsphere-constant";
import { useColumnConfig } from "@zstack/zsphere-engine/src/gpu-device";
import {
  Op,
  PciDeviceState,
  PciDeviceStatus as OriginPciDeviceStatus,
} from "@zstack/zsphere-types";
import type { IListView } from "@zstack/zsphere-types";
import { LeftNavType } from "@zstack/zsphere-types";
import { NavView } from "@zstack/zsphere-types";
import type { PciDevice as IPciDevice } from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";

export enum PciDeviceType {
  GPU_Video_Controller = "GPU_Video_Controller",
  GPU_Audio_Controller = "GPU_Audio_Controller",
  GPU_3D_Controller = "GPU_3D_Controller",
  Ethernet_Controller = "Ethernet_Controller",
  Moxa_Device = "Moxa_Device",
  Generic = "Generic",
}

export enum PciDeviceStatus {
  Active = "Active",
  Attached = "Attached",
}

interface IUseColumnConfigProps {
  view?: IListView;
}

export default ({ view }: IUseColumnConfigProps = {}) => {
  const intl = useIntl();
  const shareTypeFilters = useShareTypeFilters();
  const isSelectView = view?.includes("select");

  const virtStatusMap = new Map<string, string>([
    [
      "SRIOV_VIRTUALIZABLE",
      intl.formatMessage({
        id: "SRIOV_VIRTUALIZABLE",
        defaultMessage: "Virtualizable",
      }),
    ],
    [
      "VFIO_MDEV_VIRTUALIZABLE",
      intl.formatMessage({
        id: "SRIOV_VIRTUALIZABLE",
        defaultMessage: "Virtualizable",
      }),
    ],
    [
      "SRIOV_VIRTUALIZED",
      intl.formatMessage({
        id: "SRIOV_VIRTUALIZED",
        defaultMessage: "Virtualized",
      }),
    ],
    [
      "VFIO_MDEV_VIRTUALIZED",
      intl.formatMessage({
        id: "SRIOV_VIRTUALIZED",
        defaultMessage: "Virtualized",
      }),
    ],
    [
      "UNVIRTUALIZABLE",
      intl.formatMessage({
        id: "UNVIRTUALIZABLE",
        defaultMessage: "Unvirtualizable",
      }),
    ],
  ]);

  return useColumnConfig<IPciDevice>([
    {
      key: "name",
      ...(isSelectView
        ? {
            render: ({ name }: IPciDevice) => <Text>{name}</Text>,
          }
        : {
            linkResource: {
              microAppName: "hardware",
              path: "gpu-device",
            },
          }),
    },
    {
      key: "deviceName",
      formatter: ({ name }) => name,
    },
    {
      key: "pciDeviceSpec",
      render: (row) => <Text>{row?.pciDeviceSpec?.name}</Text>,
      auth: {
        type: "block",
        authKey: "gpu.device.spec",
        resource: "gpu.device",
      },
    },
    {
      key: "type",
      searchKey: "type",
      filterOptions: PciDeviceType,
    },
    {
      key: "enabledState",
      searchKey: "state",
      formatter: ({ state }) => state,
      filterOptions: PciDeviceState,
    },
    {
      key: "readyStatus",
      searchKey: "status",
      formatter: ({ status }) =>
        status === OriginPciDeviceStatus.System
          ? PciDeviceStatus.Active
          : status,
      filterOptions: PciDeviceStatus,
      filterCondition: (values: string[] = []) => {
        // “系统”和“未加载”状态合并成一个。 jira：
        const virtStatus = values.includes("Active")
          ? [...values, "System"]
          : values;
        return {
          key: "status",
          op: Op.in,
          values: virtStatus,
        };
      },
    },
    {
      key: "virtStatus",
      formatter: ({ virtStatus = "", status }) => {
        // 已透传，则为 “不可虚拟化”
        if (status === "Attached") {
          return intl.formatMessage({
            id: "UNVIRTUALIZABLE",
            defaultMessage: "Unvirtualizable",
          });
        }
        return virtStatusMap.has(virtStatus)
          ? virtStatusMap.get(virtStatus)
          : intl.formatMessage({ id: "UNKNOWN", defaultMessage: "Unknown" });
      },
      filterCondition: (values: string[] = []) => {
        return {
          key: "virtStatus",
          op: Op.in,
          values: values.join(",").split(","),
        };
      },
      filters: [
        {
          text: intl.formatMessage({
            id: "SRIOV_VIRTUALIZABLE",
            defaultMessage: "Virtualizable",
          }),
          value: "SRIOV_VIRTUALIZABLE,VFIO_MDEV_VIRTUALIZABLE",
        },
        {
          text: intl.formatMessage({
            id: "SRIOV_VIRTUALIZED",
            defaultMessage: "Virtualized",
          }),
          value: "SRIOV_VIRTUALIZED,VFIO_MDEV_VIRTUALIZED",
        },
        {
          text: intl.formatMessage({
            id: "UNVIRTUALIZABLE",
            defaultMessage: "Unvirtualizable",
          }),
          value: "UNVIRTUALIZABLE",
        },
        {
          text: intl.formatMessage({ id: "UNKNOWN", defaultMessage: "Unknown" }),
          value: "UNKNOWN",
        },
      ],
    },
    {
      key: "vmInstance",
      render: ({ vmInstanceUuid, vmInstance, templatedVmInstance }) => {
        if (templatedVmInstance) {
          return (
            <ResourceName
              value={templatedVmInstance.name}
              canModify
              link={{
                to: `/vm-template`,
                microAppName: "virtualization-resource",
                uuid: templatedVmInstance.uuid,
                leftnav: LeftNavType.TemplateVm,
                navView: NavView.Template,
              }}
            />
          );
        }
        if (vmInstance) {
          return (
            <ResourceName
              value={vmInstance.name}
              canModify
              link={{
                to: `/vm`,
                microAppName: "virtualization-resource",
                uuid: vmInstance.uuid,
                leftnav: LeftNavType.ClusterHost,
                navView: NavView.Resource,
              }}
            />
          );
        }
        return <ResourceName canModify value={vmInstanceUuid} />;
      },
    },
    {
      key: "shareType",
      render: (row: any) => {
        return <ShareType type={row.shareType!} />;
      },
      filters: shareTypeFilters,
      filterEnumType: ConstantType.ShareType,
      auth: {
        type: "block",
        authKey: "share.type",
        resource: "common",
      },
    },
  ]);
};
