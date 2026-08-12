import { Text } from "@zstack/design";
import {
  ResourceName,
  Link,
  useMetricNameConfig,
} from "@zstack/zsphere-components";
import { getMenuList } from "@zstack/zsphere-config";
import { NavView } from "@zstack/zsphere-types";
import type { Audit as IAudit } from "@zstack/zsphere-types/graphql";

interface ILink {
  to: string;
  microAppName: string;
  leftnav?: string;
  navView?: string;
}

const linkMap = new Map<string, ILink>();

const menuList = getMenuList();

menuList.forEach(({ resourceType, path }) => {
  if (!resourceType || !path) {
    return;
  }
  const url = new URL(path, window.location.href);
  const microAppName = url.pathname.split("/")[1];
  const pathname = url.pathname.slice(microAppName.length + 1);
  const leftnav = url.searchParams.get("leftnav") || undefined;
  if (!Array.isArray(resourceType)) {
    resourceType = resourceType.split(",");
  }
  resourceType.forEach((type) => {
    let to = pathname;
    switch (type) {
      case "VmSchedulingRuleGroupVO":
        to += "/vm-group";
        break;
      case "HostSchedulingRuleGroupVO":
        to += "/host-group";
        break;
    }

    let navView;
    navView = undefined;
    if (type === "DirectoryVO") {
      navView = NavView.Group;
    }
    if (type === "TemplatedVmInstanceVO") {
      navView = NavView.Template;
    }

    linkMap.set(type, { to, microAppName, leftnav, navView });
  });
});

export interface IProps {
  view: string;
  row: IAudit;
}

export default function AuditResourceName({ row, view }: IProps) {
  const { translateAlarmNameByLocale } = useMetricNameConfig();
  if (!row.resourceName) {
    return <span>-</span>;
  }
  let resourceName = row.resourceName;
  if (
    row.resourceType === "EventSubscriptionVO" ||
    row.resourceType === "AlarmVO"
  ) {
    resourceName = translateAlarmNameByLocale(resourceName, row.alarmZhName);
  }
  if (
    view !== "sub" &&
    row.currentResourceName &&
    row.resourceUuid &&
    row.resourceType
  ) {
    let link = linkMap.get(row.resourceType);
    //模版、虚拟机互相转化特殊处理
    if (
      row.apiName === "ConvertVmInstanceToTemplatedVmInstance" &&
      !row.isError
    ) {
      link = linkMap.get("TemplatedVmInstanceVO");
      if (link) {
        return (
          <ResourceName
            value={resourceName}
            isRouterManaged
            link={{
              ...link,
              uuid: row.resourceUuid,
            }}
          />
        );
      }
    }
    if (
      row.apiName === "ConvertTemplatedVmInstanceToVmInstance" &&
      !row.isError
    ) {
      link = linkMap.get("VmInstanceVO");
      if (link) {
        return (
          <ResourceName
            value={resourceName}
            isRouterManaged
            link={{
              ...link,
              uuid: row.resourceUuid,
            }}
          />
        );
      }
    }

    if (link) {
      return (
        <ResourceName
          value={resourceName}
          isRouterManaged
          link={{
            ...link,
            uuid: row.resourceUuid,
          }}
        />
      );
    }
    if (row.resourceType === "OAuth2ClientVO") {
      return (
        // TODO 这里的链接要改
        <Link
          microAppName="virtualization-administration"
          to="/account-third-party-auth"
        >
          {resourceName}
        </Link>
      );
    }
  }
  return <Text>{resourceName}</Text>;
}
