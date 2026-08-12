import { Tag } from "@zstack/design";
import { Link } from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/tag";
import type { IOption } from "@zstack/zsphere-engine/src/tag/useColumnConfig";
import type { Tag as ITag } from "@zstack/zsphere-types/graphql";
import React from "react";

import style from "./style.module.less";

export default (_args: any) => {
  const options = React.useMemo<IOption<ITag>>(
    () => [
      {
        key: "name",
        render: (current) => {
          return (
            <Link.Detail
              className={style.tagLink}
              to="/tag-management"
              uuid={current.uuid}
              microAppName="virtualization-monitoring-om"
            >
              <Tag className={style.tag} color={current?.color}>
                {current?.name}
              </Tag>
            </Link.Detail>
          );
        },
      },
      {
        key: "count",
        formatter: ({ resourceCount }) => resourceCount,
      },
      {
        key: "owner",
        render: (value, current) => {
          return (
            <Link.Owner uuid={current.owner?.uuid} type={current.owner?.type}>
              {current.owner?.name}
            </Link.Owner>
          );
        },
      },
    ],
    [],
  );

  return useColumnConfig(options);
};
