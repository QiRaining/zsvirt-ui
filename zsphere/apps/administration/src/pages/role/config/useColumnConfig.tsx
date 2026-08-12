import { useTime } from "@zstack/hooks";
import { ResourceName } from "@zstack/zsphere-components";
import { Tag } from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/zsv-role";
import { ZsvRoleQueryType } from "@zstack/zsphere-types";
import type { ZsvRole as IZsvRole } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { transformRoleName } from "../utils";

export default () => {
  const intl = useIntl();
  const { getServerTime } = useTime();

  return useColumnConfig<IZsvRole>([
    {
      key: "name",
      render: (current) => {
        return (
          <div className="flex items-center gap-1">
            <ResourceName
              value={transformRoleName(intl, {
                uuid: current?.uuid,
                name: current?.name,
              })}
              link={{
                to: `/role`,
                microAppName: "virtualization-administration",
                uuid: current?.uuid,
              }}
            />
            {current?.type === ZsvRoleQueryType.Predefined && (
              <Tag round level="weak">
                {intl.formatMessage({ id: "default", defaultMessage: "Default" })}
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      key: "user.count",
      render: (current) => current?.userCount || 0,
    },
    {
      key: "user.group.count",
      render: (current) => current?.userGroupCount || 0,
    },
    {
      key: "createDate",
      render: (current) =>
        getServerTime(current.createDate).format("YYYY-MM-DD HH:mm:ss"),
    },
  ]);
};
