import { Text } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import { ResourceName } from "@zstack/zsphere-components";
import { State } from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/scheduling-information";
import type { IOption } from "@zstack/zsphere-engine/src/scheduling-information/useColumnConfig";
import React from "react";
import { useIntl } from "react-intl";

import style from "../style.module.less";

export default () => {
  const intl = useIntl();
  const { getServerTime } = useTime();

  const options: IOption<any> = [
    {
      key: "advice.migration.vm",
      linkResource: {
        microAppName: "virtualization-resource",
        path: "vm",
      },
      render: (current) => {
        return (
          <>
            {current?.vm?.uuid ? (
              <ResourceName
                value={current?.vm?.name}
                link={{
                  to: `/vm`,
                  microAppName: "virtualization-resource",
                  uuid: current?.vm?.uuid,
                }}
              />
            ) : (
              <span className={style.none}>
                {intl.formatMessage({ id: "none", defaultMessage: "None" })}
              </span>
            )}
          </>
        );
      },
    },
    {
      key: "current.host",
      linkResource: {
        microAppName: "virtualization-resource",
        path: "host",
      },
      render: (current) => {
        return (
          <>
            {current?.vmSourceHost?.name &&
            current?.vmSourceHost?.managementIp ? (
              <ResourceName
                value={`${current?.vmSourceHost?.name} (${current?.vmSourceHost?.managementIp})`}
                link={{
                  to: `/host`,
                  microAppName: "virtualization-resource",
                  uuid: current?.vmSourceHost?.uuid,
                }}
              />
            ) : (
              <span className={style.none}>
                {intl.formatMessage({ id: "none", defaultMessage: "None" })}
              </span>
            )}
          </>
        );
      },
    },
    {
      key: "advice.target.host",
      linkResource: {
        microAppName: "virtualization-resource",
        path: "host",
      },
      render: (current) => {
        return (
          <>
            {current?.vmSourceHost?.name &&
            current?.vmSourceHost?.managementIp ? (
              <ResourceName
                value={`${current?.vmTargetHost?.name} (${current?.vmTargetHost?.managementIp})`}
                link={{
                  to: `/host`,
                  microAppName: "virtualization-resource",
                  uuid: current?.vmTargetHost?.uuid,
                }}
              />
            ) : (
              <span className={style.none}>
                {intl.formatMessage({ id: "none", defaultMessage: "None" })}
              </span>
            )}
          </>
        );
      },
    },
    {
      key: "reason",
      render: (current) => (
        <Text title={current?.reason}>{current?.reason}</Text>
      ),
    },
    {
      key: "executeStatus",
      //已执行状态挪到了任务 调度任务统一处理
      render: (current) => {
        switch (current?.status) {
          case "Unexecuted":
            return (
              <State
                type="warning"
                color={{ color: "danger", number: 500 }}
                name={intl.formatMessage({
                  id: "unexecuted",
                  defaultMessage: "To Be Executed",
                })}
              />
            );
          case "InProgress":
            return (
              <>
                <State
                  type="progress"
                  name={intl.formatMessage({
                    id: "executing",
                    defaultMessage: "Executing",
                  })}
                />
              </>
            );
          default:
            return <></>;
        }
      },
    },
    {
      key: "adviceCreateTime",
      render: (current) => {
        return getServerTime(current?.createDate).format("YYYY-MM-DD HH:mm:ss");
      },
    },
  ];

  return useColumnConfig(options);
};
