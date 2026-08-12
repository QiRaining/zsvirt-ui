import { useTime } from "@zstack/hooks";
import { Constant } from "@zstack/zsphere-components";
import { ConstantType } from "@zstack/zsphere-constant";
import { CopyableText } from "@zstack/zsphere-design-biz";
import { useColumnConfig } from "@zstack/zsphere-engine/src/zbs-mds";
import { MdsStatus as IMdsStatus } from "@zstack/zsphere-types";
import type { CbdMds as ICbdMds } from "@zstack/zsphere-types/graphql";
import React from "react";

export default () => {
  const { getServerTime } = useTime();

  return useColumnConfig<ICbdMds>([
    {
      key: "mdsAddr",
      render: (value) => (
        <CopyableText>{value?.externalAddr || ""}</CopyableText>
      ),
    },
    {
      key: "mdsNodeIp",
      render: (value) => <CopyableText>{value?.addr || ""}</CopyableText>,
    },
    {
      key: "connection.status",
      render: (current) => (
        <Constant
          enumType={ConstantType.PrimaryStorageStatus}
          value={current.status}
        />
      ),
      filterOptions: IMdsStatus,
    },
    {
      key: "ssh.port",
      formatter: (value) => value.port,
    },
    {
      key: "ssh.user.name",
      formatter: (value) => value.username,
    },
    {
      key: "create.date",
      auth: {
        type: "block",
        resource: "zbs.mds",
        authKey: "createDate",
      },
      render: (current) =>
        getServerTime(current.createDate).format("YYYY-MM-DD HH:mm:ss"),
    },
  ]);
};
