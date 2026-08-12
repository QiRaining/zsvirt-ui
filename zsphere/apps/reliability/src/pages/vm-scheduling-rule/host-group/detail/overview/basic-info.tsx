import { useTime } from "@zstack/hooks";
import type { ListItem } from "@zstack/zsphere-components";
import { ResourceName, List, DraggableCard } from "@zstack/zsphere-components";
import { CopyableText } from "@zstack/zsphere-design-biz";
import type { HostGroup } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

interface IProps {
  detail: HostGroup;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

const BasicInfo: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed = false,
}) => {
  const intl = useIntl();
  const { getServerTime } = useTime();

  const {
    uuid,
    description,
    owner,
    hostCount,
    vmSchedulingRuleCount,
    createDate,
    _lastOpDate,
  } = detail;

  const list: ListItem[] = useMemo(() => {
    return [
      {
        label: intl.formatMessage({
          id: "hostCount",
          defaultMessage: "Hosts",
        }),
        value: hostCount || "0",
      },
      {
        label: intl.formatMessage({
          id: "associatedSchedulingRule",
          defaultMessage: "Associated Scheduling Policy",
        }),
        value: vmSchedulingRuleCount || "0",
      },
      {
        label: intl.formatMessage({ id: "owner", defaultMessage: "Owner" }),
        value: (
          <ResourceName
            value={owner?.name}
            link={
              owner?.uuid === "36c27e8ff05c4780bf6d2fa65700f22e"
                ? undefined
                : { to: "need to do", microAppName: "needtodo" }
            }
          />
        ),
        auth: {
          type: "block",
          authKey: "owner",
          resource: "host.group",
        },
      },
      {
        label: intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        }),
        value: description || undefined,
      },
      {
        label: "UUID",
        value: <CopyableText>{uuid}</CopyableText>,
      },
      {
        label: intl.formatMessage({
          id: "createDate",
          defaultMessage: "Creation Time",
        }),
        value: getServerTime(createDate).format("YYYY-MM-DD HH:mm:ss"),
      },
      //  去除所有最后操作时间
      // {
      //   label: intl.formatMessage({ id: 'lastOpDate', defaultMessage: '最后操作时间' }),
      //   value: getServerTime(lastOpDate).format('YYYY-MM-DD HH:mm:ss')
      // }
    ];
  }, [intl, getServerTime, detail]);

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "basic.info",
        defaultMessage: "Basic Info",
      })}
      isList
      onCollapseChange={onCollapseChange}
      collapsed={collapsed}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
};

export default BasicInfo;
