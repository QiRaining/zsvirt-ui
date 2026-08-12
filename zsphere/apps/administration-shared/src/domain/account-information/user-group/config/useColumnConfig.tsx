import { useTime } from "@zstack/hooks";
import { ResourceName } from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/zsv-user-group";
import type { UserGroup as IUserGroup } from "@zstack/zsphere-types/graphql";
import { useSearchParams, useNavigate } from "react-router";

import RoleList from "../components/role-list";

export default () => {
  const { getServerTime } = useTime();
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid") || "";
  const navigate = useNavigate();

  const goToabstract = () => {
    navigate({
      pathname: location.pathname,
      search: location.search,
    });
  };

  return useColumnConfig<IUserGroup>([
    {
      key: "name",
      linkResource: {
        microAppName: "virtualization-administration",
        path: "account-information/user-group",
      },
      render: (current) => {
        return (
          <ResourceName
            value={current?.name}
            isRouterManaged
            link={{
              to: `/account-information/user-group`,
              microAppName: "virtualization-administration",
              uuid: current?.uuid,
            }}
          />
        );
      },
    },
    {
      key: "group.user.count",
      formatter: (current) => {
        return current.groupUserCount || 0;
      },
    },
    {
      key: "role",
      render: (current) => {
        return (
          <RoleList current={current} uuid={uuid} goToabstract={goToabstract} />
        );
      },
    },
    {
      key: "createDate",
      render: (current) =>
        getServerTime(current.createDate).format("YYYY-MM-DD HH:mm:ss"),
    },
  ]);
};
