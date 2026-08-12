import {
  ResourceName,
  ShareType,
  useShareTypeFilters,
} from "@zstack/zsphere-components";
import { ConstantType } from "@zstack/zsphere-constant";
import { useColumnConfig } from "@zstack/zsphere-engine/src/vgpu-device";
import {
  Op,
  PciDeviceState,
  PciDeviceStatus as OriginPciDeviceStatus,
} from "@zstack/zsphere-types";
import { LeftNavType } from "@zstack/zsphere-types";
import { NavView } from "@zstack/zsphere-types";
import type { VGpuDevice as IVGpuDevice } from "@zstack/zsphere-types/graphql";

export enum PciDeviceStatus {
  Active = "Active",
  Attached = "Attached",
}

export default () => {
  const shareTypeFilters = useShareTypeFilters();

  return useColumnConfig<IVGpuDevice>([
    {
      key: "name",
      linkResource: "vgpu-device",
    },
    {
      key: "state",
      filterOptions: PciDeviceState,
    },
    {
      key: "status",
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
      key: "host",
      linkResource: {
        microAppName: "hardware",
        path: "host",
      },
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
