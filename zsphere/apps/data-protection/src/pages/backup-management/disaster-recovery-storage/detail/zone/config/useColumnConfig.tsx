import { ResourceName } from "@zstack/zsphere-components";
import { Tag } from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/zone";
import type { IOption } from "@zstack/zsphere-engine/src/zone/useColumnConfig";
import { LeftNavType } from "@zstack/zsphere-types";
import type { Zone } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import style from "./style.module.less";

enum ZoneState {
  Enabled = "Enabled",
  Disabled = "Disabled",
}

export default ({ source }: any = {}) => {
  const intl = useIntl();

  const columnConfig: IOption<Zone> = React.useMemo(
    () => [
      {
        key: "name",
        render: (current: Zone) => {
          return (
            <div className={style.nameWrapper}>
              <ResourceName
                value={current.name}
                link={{
                  to: `/zone`,
                  microAppName: "virtualization-resource",
                  uuid: current.uuid,
                  leftnav: LeftNavType.ClusterHost,
                  navView: "notGroup",
                  keepState: false,
                }}
              />
              {current.uuid === source?.attachedZoneRefUuids?.[0] && (
                <Tag round level="weak" className={style.tag}>
                  {intl.formatMessage({
                    id: "default",
                    defaultMessage: "Default",
                  })}
                </Tag>
              )}
            </div>
          );
        },
      },
      {
        key: "state",
        filterOptions: ZoneState,
      },
    ],
    [intl, source],
  );

  return useColumnConfig(columnConfig);
};
