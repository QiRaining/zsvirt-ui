import { Text } from "@zstack/design";
import { useMetricNameConfig } from "@zstack/zsphere-components";
import { CopyableText } from "@zstack/zsphere-design-biz";
import type { Audit as IAudit } from "@zstack/zsphere-types/graphql";
import { capitalize } from "lodash-es";

import useAuditColumnConfig from "../config-from-origin/useColumnConfig";
import AuditResourceName from "../detail/audit-resource-name";

import style from "./style.module.less";

export interface IUseColumnConfig {
  view: string;
  onApiNameClick: (row: IAudit) => void;
}

export default function getUseColumnConfig({
  view,
  onApiNameClick,
}: IUseColumnConfig) {
  return function useColumnConfig() {
    const { translateAlarmNameByLocale } = useMetricNameConfig();
    return useAuditColumnConfig(view, [
      {
        key: "apiName",
        render: (row: IAudit) => (
          <Text className={style.name}>
            <a onClick={() => onApiNameClick(row)}>{row.apiName}</a>
          </Text>
        ),
        exportToCSVRender: (row: IAudit) => row.apiName || "-",
      },
      {
        key: "clientBrowser",
        formatter: (row: IAudit) => {
          return row.clientBrowser ? capitalize(row.clientBrowser) : "-";
        },
        exportToCSVRender: (row: IAudit) =>
          row.clientBrowser ? capitalize(row.clientBrowser) : "-",
      },
      {
        // 登录 IP
        key: "clientIp",
        render: (row: IAudit) =>
          row.clientIp ? <CopyableText>{row.clientIp}</CopyableText> : "-",
        exportToCSVRender: (row: IAudit) => row.clientIp || "-",
      },
      {
        // 操作员 IP
        key: "clientIpForResource",
        searchKey: "clientIp",
        render: (row: IAudit) =>
          row.clientIp ? <CopyableText>{row.clientIp}</CopyableText> : "-",
        exportToCSVRender: (row: IAudit) => row.clientIp || "-",
      },
      {
        key: "resourceName",
        render: (row: IAudit) => <AuditResourceName view={view} row={row} />,
        exportToCSVRender: (row: IAudit) => {
          if (!row.resourceName) {
            return "-";
          }
          let resourceName = row.resourceName;
          if (
            row.resourceType === "EventSubscriptionVO" ||
            row.resourceType === "AlarmVO"
          ) {
            resourceName = translateAlarmNameByLocale(
              resourceName,
              row.alarmZhName,
            );
          }
          return resourceName;
        },
      },
      {
        key: "resourceType",
        formatter: (row: IAudit) => row.resourceType || "-",
        exportToCSVRender: (row: IAudit) => row.resourceType || "-",
      },
    ]);
  };
}
