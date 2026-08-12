import {
  ResourceName,
  ShareType,
  useShareTypeFilters,
} from "@zstack/zsphere-components";
import { ConstantType } from "@zstack/zsphere-constant";
import { useColumnConfig } from "@zstack/zsphere-engine/src/vm-template";
import { formatValue } from "@zstack/zsphere-engine/utils";
import { CpuArchitecture } from "@zstack/zsphere-types";
import { LeftNavType } from "@zstack/zsphere-types";
import { NavView } from "@zstack/zsphere-types";
import type {
  VmInstance as IVM,
  OvfExportEntity as OVF,
} from "@zstack/zsphere-types/graphql";
import { formatStorage } from "@zstack/zsphere-utils";
import { sumBy, pick } from "lodash-es";
import { useIntl } from "react-intl";

export default () => {
  const intl = useIntl();
  const shareTypeFilters = useShareTypeFilters();

  return useColumnConfig<IVM>([
    {
      key: "name",
      render: (row: IVM) => {
        return (
          <ResourceName
            value={row?.name}
            isRouterManaged
            link={{
              to: `/vm-template`,
              microAppName: "virtualization-resource",
              uuid: row?.uuid,
              leftnav: LeftNavType.TemplateVm,
              navView: NavView.Template,
              keepState: false,
            }}
          />
        );
      },
    },
    {
      key: "cpuNum",
      render: (current) => {
        return (
          <div className="flex items-center gap-1">
            {current.cpuNum}
            {intl.formatMessage({ id: "core", defaultMessage: "Cores" })}
          </div>
        );
      },
    },
    {
      key: "size",
      gqlKey: "allVolumes",
      formatter: ({ allVolumes }: IVM) =>
        formatStorage(
          sumBy(allVolumes, (volume) => volume?.actualSize ?? 0),
          2,
        ),
      exportToCSVRender: ({ allVolumes }: IVM) =>
        formatStorage(
          sumBy(allVolumes, (volume) => volume?.actualSize ?? 0),
          2,
        ),
    },
    {
      key: "mem",
      formatter: (current: IVM) => {
        return formatStorage(current.memorySize || 0, 2);
      },
      exportToCSVRender: ({ memorySize }) => formatStorage(memorySize || 0, 2),
    },
    {
      key: "architecture",
      filterOptions: pick(CpuArchitecture, [
        CpuArchitecture.x86_64,
        CpuArchitecture.aarch64,
      ]),
      exportToCSVRender: ({ architecture }) =>
        formatValue("architecture", architecture, []),
    },
    {
      key: "shareType",
      render: (current: IVM) => {
        return <ShareType type={current.shareType!} />;
      },
      filters: shareTypeFilters,
      filterEnumType: ConstantType.ShareType,
      auth: {
        type: "block",
        authKey: "share.type",
        resource: "common",
      },
    },
    {
      key: "owner",
      render: (current: IVM & OVF) => {
        const owner = current.owner || current?.vmInstance?.owner;
        return owner?.uuid === "36c27e8ff05c4780bf6d2fa65700f22e" ? (
          owner?.name
        ) : (
          <ResourceName
            value={owner?.name}
            link={{
              leftnav: LeftNavType.ClusterHost,
              to: `/account-information/user`,
              microAppName: "virtualization-administration",
              uuid: owner?.uuid,
            }}
          />
        );
      },
      auth: {
        type: "block",
        authKey: "owner",
        resource: "vm",
      },
      exportToCSVRender(value?: IVM | OVF) {
        if (!value) {
          return "";
        }
        if ("owner" in value && value.owner) {
          return value.owner.name;
        }
        if (
          "vmInstance" in value &&
          value.vmInstance &&
          value.vmInstance.owner
        ) {
          return value.vmInstance.owner.name;
        }
        return "";
      },
    },
  ]);
};
