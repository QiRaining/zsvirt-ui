import { ResourceName, Link } from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/security-group";
import type { IOption } from "@zstack/zsphere-engine/src/security-group/useColumnConfig";
import { LeftNavType } from "@zstack/zsphere-types";
import { SecurityGroupState } from "@zstack/zsphere-types";
import type { SecurityGroup, Zone } from "@zstack/zsphere-types/graphql";
import qs from "qs";
import React, { useMemo } from "react";

export default ({ source }: { source?: Zone & { __typename: string } }) => {
  const zoneUuid = useMemo(() => {
    if (source?.__typename === "Zone") {
      return source.uuid;
    }
  }, [source]);

  const searchObj = qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  });
  const options: IOption<SecurityGroup> = useMemo(
    () => [
      {
        key: "name",
        linkResource: {
          microAppName: "virtualization-resource",
          path: "security-group",
        },
        render: (current: SecurityGroup) => (
          <ResourceName
            value={current?.name}
            link={{
              to: `/security-group`,
              microAppName: "virtualization-resource",
              uuid: current?.uuid,
              leftnav: searchObj?.leftnav || LeftNavType.Network,
              zoneUuid,
            }}
          />
        ),
      },
      {
        key: "owner",
        auth: {
          type: "block",
          authKey: "owner",
          resource: "security.group",
        },
        render: (current: SecurityGroup) => {
          return (
            <Link.Owner
              uuid={current.owner?.uuid ?? ""}
              type={current.owner?.type}
            >
              {current.owner?.name}
            </Link.Owner>
          );
        },
      },
      {
        key: "state",
        filterOptions: SecurityGroupState,
      },
    ],
    [searchObj?.leftnav, zoneUuid],
  );

  return useColumnConfig(options);
};
