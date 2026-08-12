import { Text } from "@zstack/design";
import { ResourceName, State } from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/migrate-log";
import { LeftNavType } from "@zstack/zsphere-types";
import type { SchedHistoryLog } from "@zstack/zsphere-types/graphql";
import { getNeutralColor } from "@zstack/zsphere-utils";
import { useIntl } from "react-intl";

import { translateSchedTypes } from "./translate";

import style from "./style.module.less";

export default ({
  setVisible,
  setLogData,
}: {
  setVisible: (visible: boolean) => void;
  setLogData: (actionId: any) => void;
}) => {
  const intl = useIntl();

  return useColumnConfig<SchedHistoryLog>([
    {
      title: intl.formatMessage({
        id: "task.description",
        defaultMessage: "Task Description",
      }),
      key: "task",
      render: (row) => {
        const content = translateSchedTypes(intl, row?.schedType);
        return (
          <div
            onClick={() => {
              setLogData(row);
              setVisible(true);
            }}
          >
            <Text className={style.operationName}>{content}</Text>
          </div>
        );
      },
      exportToCSVRender(row) {
        const content = translateSchedTypes(intl, row?.schedType);
        return content;
      },
    },
    {
      key: "logType",
      title: intl.formatMessage({
        id: "trigger.reason",
        defaultMessage: "Trigger Reason",
      }),
      render: ({ schedReason }) => {
        return <Text>{schedReason}</Text>;
      },
      exportToCSVRender({ schedReason }) {
        return schedReason;
      },
    },
    {
      key: "reason",
      title: intl.formatMessage({
        id: "detail.reason",
        defaultMessage: "Detailed Reason",
      }),
      render: ({ failReason }) => {
        return failReason ? (
          <Text>{failReason}</Text>
        ) : (
          <Text>{intl.formatMessage({ id: "none" })}</Text>
        );
      },
      exportToCSVRender({ failReason }) {
        return failReason;
      },
    },
    {
      key: "vmName",
      title: intl.formatMessage({ id: "job.object", defaultMessage: "Target" }),
      render: ({ vmInstance, vmInstanceUuid, slbUuid }) => {
        if (!vmInstance) {
          return <Text>{vmInstanceUuid}</Text>;
        }

        let link = <Text>{vmInstance?.name}</Text>;

        if (slbUuid) {
          link = <Text>{vmInstance?.name}</Text>;
        }

        if (vmInstance?.type === "UserVm") {
          link = (
            <ResourceName
              value={vmInstance?.name}
              link={{
                to: `/vm`,
                microAppName: "virtualization-resource",
                uuid: vmInstance?.uuid,
                leftnav: LeftNavType.ClusterHost,
              }}
            />
          );
        }

        return link;
      },
      exportToCSVRender({ vmInstance, vmInstanceUuid }) {
        if (!vmInstance) {
          return vmInstanceUuid;
        }
        return vmInstance.name;
      },
    },
    {
      key: "taskResult",
      filterMultiple: false,
      filters: [
        {
          text: (
            <State
              type="success"
              name={intl.formatMessage({
                id: "success",
                defaultMessage: "Succeeded",
              })}
            />
          ),
          value: true,
        },
        {
          text: (
            <State
              type="error"
              name={intl.formatMessage({ id: "fault", defaultMessage: "Failed" })}
            />
          ),
          value: false,
        },
      ],
      render: ({ success }) => {
        return (
          <State
            type={success ? "success" : "error"}
            name={
              success
                ? intl.formatMessage({ id: "success", defaultMessage: "Succeeded" })
                : intl.formatMessage({ id: "fault", defaultMessage: "Failed" })
            }
          />
        );
      },
    },
    {
      title: intl.formatMessage({ id: "owner", defaultMessage: "Owner" }),
      key: "vmOwner",
      render: ({ owner }) => {
        if (!owner) {
          return intl.formatMessage({ id: "empty", defaultMessage: "Empty" });
        }

        if (owner?.uuid === "36c27e8ff05c4780bf6d2fa65700f22e") {
          return owner?.name;
        }
        return (
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
      exportToCSVRender({ owner }) {
        return (
          owner?.name ??
          intl.formatMessage({ id: "empty", defaultMessage: "Empty" })
        );
      },
    },
    {
      key: "preHost",
      render: ({ lastHostUuid, preHost }) => {
        if (!preHost && !lastHostUuid) {
          return (
            <Text style={{ color: getNeutralColor("light", 500) }}>
              {intl.formatMessage({ id: "null", defaultMessage: "N/A" })}
            </Text>
          );
        }
        if (!preHost) {
          return <Text>{lastHostUuid}</Text>;
        }

        return (
          <ResourceName
            value={preHost?.name}
            link={{
              to: `/host`,
              microAppName: "virtualization-resource",
              uuid: preHost?.uuid,
              leftnav: LeftNavType.ClusterHost,
            }}
          />
        );
      },
      exportToCSVRender({ preHost, lastHostUuid }) {
        if (!preHost && !lastHostUuid) {
          return intl.formatMessage({ id: "null", defaultMessage: "N/A" });
        }

        if (!preHost) {
          return lastHostUuid;
        }

        return preHost.name;
      },
    },
    {
      key: "targetHost",
      render: (row) => {
        const { destHostUuid, destHost } = row;
        if (!destHost && !destHostUuid) {
          return (
            <Text style={{ color: getNeutralColor("light", 500) }}>
              {intl.formatMessage({ id: "null", defaultMessage: "N/A" })}
            </Text>
          );
        }
        if (!destHost) {
          return <Text>{destHostUuid}</Text>;
        }
        return (
          <ResourceName
            value={destHost.name}
            link={{
              to: `/host`,
              microAppName: "virtualization-resource",
              uuid: destHost.uuid,
              leftnav: LeftNavType.ClusterHost,
            }}
          />
        );
      },
      exportToCSVRender({ destHostUuid, destHost }) {
        if (!destHost && !destHostUuid) {
          return intl.formatMessage({ id: "null", defaultMessage: "N/A" });
        }

        if (!destHost) {
          return destHostUuid;
        }

        return destHost.name;
      },
    },
  ]);
};
