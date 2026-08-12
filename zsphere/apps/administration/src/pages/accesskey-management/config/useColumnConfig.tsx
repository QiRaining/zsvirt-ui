import { ResourceName } from "@zstack/zsphere-components";
import { CopyableText } from "@zstack/zsphere-design-biz";
import { useColumnConfig } from "@zstack/zsphere-engine/src/accesskey-management-local";
import type { AccessKey as IAccessKey } from "@zstack/zsphere-types/graphql";

import style from "./style.module.less";

export default () => {
  return useColumnConfig<IAccessKey>([
    {
      key: "AccessKeySecret",
      render: (value: any) => {
        return (
          <CopyableText className={style.customTextWrapper} password>
            {value?.AccessKeySecret}
          </CopyableText>
        );
      },
    },
    {
      key: "state",
    },
    {
      key: "owner",
      auth: {
        type: "block",
        authKey: "owner",
        resource: "accesskey.management.local",
      },
      render: (value: any) => {
        return value?.owner?.uuid === "36c27e8ff05c4780bf6d2fa65700f22e" ? (
          value?.owner?.name
        ) : (
          <ResourceName
            value={value?.owner?.name}
            link={{
              to: `/account-information/user`,
              microAppName: "virtualization-administration",
              uuid: value?.owner?.uuid,
            }}
          />
        );
      },
    },
  ]);
};
