import { Text } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import type { IconTypes } from "@zstack/icon";
import { ResourceName } from "@zstack/zsphere-components";
import { State } from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/scheduling-task";
import type { IOption } from "@zstack/zsphere-engine/src/scheduling-task/useColumnConfig";
import { formatValue } from "@zstack/zsphere-engine/utils";
import type { VmMigrationActivity } from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";

export default () => {
  const intl = useIntl();
  const { getServerTime } = useTime();

  const options: IOption<any> = [
    {
      key: "actionDescrition",
      render: (current: VmMigrationActivity) => {
        const isAuto = current?.cause === "Automatic";
        const text = `${
          isAuto
            ? intl.formatMessage({
                id: "automatic.drs",
                defaultMessage: "Auto Scheduling",
              })
            : intl.formatMessage({
                id: "manual.drs",
                defaultMessage: "Manual Scheduling",
              })
        }-${current.vm?.name || current.vmUuid}`;
        return <Text>{text}</Text>;
      },
      exportToCSVRender: (current) => {
        const isAuto = current?.cause === "Automatic";
        return `${
          isAuto
            ? intl.formatMessage({
                id: "automatic.drs",
                defaultMessage: "Auto Scheduling",
              })
            : intl.formatMessage({
                id: "manual.drs",
                defaultMessage: "Manual Scheduling",
              })
        }-${current.vm?.name || current.vmUuid}`;
      },
    },
    {
      key: "job.object",
      linkResource: {
        microAppName: "virtualization-resource",
        path: "vm",
      },
      render: (current) => {
        return (
          <>
            {current?.vm?.name && current?.vmUuid ? (
              <ResourceName
                value={current?.vm?.name}
                link={{
                  to: `/vm`,
                  microAppName: "virtualization-resource",
                  uuid: current?.vmUuid,
                }}
              />
            ) : (
              <span>
                {intl.formatMessage({ id: "none", defaultMessage: "None" })}
              </span>
            )}
          </>
        );
      },
      exportToCSVRender: (current) => {
        return current?.vm?.name && current?.vmUuid ? current?.vm?.name : "-";
      },
    },
    {
      key: "cluster.which.belongs",
      render: (current) => current?.clusterName || "-",
      exportToCSVRender: (current) => {
        return current?.clusterName || "-";
      },
    },
    {
      key: "migration.status",
      render: (current: VmMigrationActivity) => {
        const statusMap = new Map<
          string,
          {
            name: string;
            icon: IconTypes;
            color: any;
          }
        >([
          [
            "Created",
            {
              name: intl.formatMessage({
                id: "migration.status.Created",
                defaultMessage: "To Be Migrated",
              }),
              icon: "loader",
              color: {
                color: "info",
                number: 500,
              },
            },
          ],
          [
            "InProgress",
            {
              name: intl.formatMessage({
                id: "migration.status.InProgress",
                defaultMessage: "Migrating",
              }),
              icon: "loader",
              color: {
                color: "info",
                number: 500,
              },
            },
          ],
          [
            "Successful",
            {
              name: intl.formatMessage({
                id: "migration.status.Successful",
                defaultMessage: "Migration Completed",
              }),
              icon: "checkmark-circle-fill",
              color: {
                color: "positive",
                number: 500,
              },
            },
          ],
          [
            "Failed",
            {
              name: intl.formatMessage({
                id: "migration.status.Failed",
                defaultMessage: "Migration Failed",
              }),
              icon: "close-circle-fill",
              color: {
                color: "danger",
                number: 500,
              },
            },
          ],
        ]);
        const statusProps = statusMap.get(current.status!)!;
        return <State prefix="icon" {...statusProps} />;
      },
      exportToCSVRender: (current) => {
        let text = "";
        if (current.status === "Successful") {
          text = intl.formatMessage({
            id: "migration.status.Successful",
            defaultMessage: "Migration Completed",
          });
        }
        if (current.status === "Failed") {
          text = intl.formatMessage({
            id: "migration.status.Failed",
            defaultMessage: "Migration Failed",
          });
        }
        if (current.status === "InProgress") {
          text = intl.formatMessage({
            id: "migration.status.InProgress",
            defaultMessage: "Migrating",
          });
        }
        if (current.status === "Created") {
          text = intl.formatMessage({
            id: "migration.status.Created",
            defaultMessage: "To Be Migrated",
          });
        }

        return text;
      },
    },
    // 触发原因不再需要前端转译，见：
    {
      key: "trigger.reason",
      render: (current: VmMigrationActivity) => {
        return <Text>{current.reason || ""}</Text>;
      },
      exportToCSVRender: (current) => {
        return current.reason || "";
      },
    },
    {
      key: "pre.host",
      linkResource: {
        microAppName: "virtualization-resource",
        path: "host",
      },
      render: (current) => {
        return (
          <>
            {current?.sourceHost?.name && current?.vmSourceHostUuid ? (
              <ResourceName
                value={current?.sourceHost?.name}
                link={{
                  to: `/host`,
                  microAppName: "virtualization-resource",
                  uuid: current?.vmSourceHostUuid,
                }}
              />
            ) : (
              <span>
                {intl.formatMessage({ id: "none", defaultMessage: "None" })}
              </span>
            )}
          </>
        );
      },
      exportToCSVRender: (current) => {
        return current?.sourceHost?.name && current?.vmSourceHostUuid
          ? current?.sourceHost?.name
          : "-";
      },
    },
    {
      key: "target.host",
      linkResource: {
        microAppName: "virtualization-resource",
        path: "host",
      },
      render: (current: VmMigrationActivity) => {
        return (
          <>
            {current?.targetHost?.name && current?.vmTargetHostUuid ? (
              <ResourceName
                value={current?.targetHost?.name}
                link={{
                  to: `/host`,
                  microAppName: "virtualization-resource",
                  uuid: current?.vmTargetHostUuid,
                }}
              />
            ) : (
              <span>
                {intl.formatMessage({ id: "none", defaultMessage: "None" })}
              </span>
            )}
          </>
        );
      },
      exportToCSVRender: (current) => {
        return current?.targetHost?.name && current?.vmTargetHostUuid
          ? current?.targetHost?.name
          : "-";
      },
    },
    {
      key: "startTime",
      render: (current: VmMigrationActivity) => {
        return getServerTime(current.createDate).format("YYYY-MM-DD HH:mm:ss");
      },
      exportToCSVRender: (current) => {
        const val = formatValue("createDate", current, options);
        return val || val === 0
          ? getServerTime(val).format("YYYY-MM-DD HH:mm:ss")
          : "-";
      },
    },
    {
      key: "end.time",
      render: (current: VmMigrationActivity) => {
        return current.endDate ? (
          getServerTime(current.endDate).format("YYYY-MM-DD HH:mm:ss")
        ) : (
          <div className="zstack-table-list-column-empty">-</div>
        );
      },
      exportToCSVRender: (current) => {
        const val = formatValue("endDate", current, options);
        return val || val === 0
          ? getServerTime(val).format("YYYY-MM-DD HH:mm:ss")
          : "-";
      },
    },
  ];

  return useColumnConfig(options);
};
