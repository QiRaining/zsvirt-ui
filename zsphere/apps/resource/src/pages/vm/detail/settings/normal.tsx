import { Tag } from "@zstack/design";
import type { ListItem } from "@zstack/zsphere-components";
import { List, ResourceName } from "@zstack/zsphere-components";
import { LeftNavType } from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import _ from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";

import { vmGroupAuth } from "../overview/relative-object";

interface IProps {
  detail: IVM;
}

const NormalSetting: React.FC<IProps> = ({ detail }) => {
  const intl = useIntl();

  const list = React.useMemo<ListItem[]>(() => {
    const tagName = `${intl.formatMessage({
      id: "tag",
      defaultMessage: "Tag",
    })} (${detail?.tag?.length ?? 0})`;
    return [
      {
        label: tagName,
        value:
          !!detail?.tag?.length &&
          _.map(detail?.tag, (item) => (
            <Tag
              color={item?.color}
              key={item?.uuid}
              style={{ margin: "0 4px 4px 0" }}
            >
              {item?.name}
            </Tag>
          )),
      },
      {
        label: intl.formatMessage({
          id: "virtualization.Hostname",
          defaultMessage: "Hostname",
        }),
        value: <ResourceName canModify value={detail.systemTag?.hostname} />,
      },
      {
        label: intl.formatMessage({
          id: "virtualization.roleApiModule.vm-group",
          defaultMessage: "VM Scheduling Group",
        }),
        auth: vmGroupAuth,
        value: (
          <ResourceName
            canModify
            value={detail?.vmGroup?.name}
            link={{
              microAppName: "virtualization-reliability",
              to: `/vm-scheduling-rule/vm-group`,
              from: LeftNavType.ClusterHost,
              uuid: detail?.vmGroup?.uuid,
              zoneUuid: detail?.zoneUuid,
            }}
          />
        ),
      },
      {
        label: "User Data",
        auth: {
          authKey: "user.data",
          resource: "vm",
          type: "block",
        },
        value: (
          <ResourceName canModify copyable value={detail.systemTag?.userdata} />
        ),
      },
    ];
  }, [intl, detail]);

  return <List list={list} />;
};

export default NormalSetting;
