import { Text, Tooltip } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import { Icon } from "@zstack/icon";
import type { ListItem } from "@zstack/zsphere-components";
import { List, DraggableCard } from "@zstack/zsphere-components";
import { CopyableText } from "@zstack/zsphere-design-biz";
import type { HostGroup } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";

import styles from "./style.module.less";

export interface IProps {
  detail: HostGroup;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

const BasicInfo: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed,
}) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { getServerTime } = useTime();

  const list = React.useMemo<Array<ListItem>>(
    () => [
      {
        label: intl.formatMessage({
          id: "name",
          defaultMessage: "Name",
        }),
        value: <Text>{detail.name}</Text>,
      },
      {
        label: intl.formatMessage({
          id: "hostCount",
          defaultMessage: "Hosts",
        }),
        value: detail?.hostCount ?? 0,
      },
      {
        label: intl.formatMessage({
          id: "associatedSchedulingRule",
          defaultMessage: "Associated Scheduling Policy",
        }),
        value: detail?.vmSchedulingRuleCount ?? 0,
      },
      {
        label: intl.formatMessage({
          id: "UUID",
          defaultMessage: "UUID",
        }),
        value: <CopyableText>{detail?.uuid}</CopyableText>,
      },
      {
        label: intl.formatMessage({
          id: "createDate",
          defaultMessage: "Creation Time",
        }),
        value: getServerTime(detail?.createDate).format("YYYY-MM-DD HH:mm:ss"),
      },
    ],
    [detail, intl, getServerTime],
  );

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "hostGroup",
        defaultMessage: "Host Scheduling Group",
      })}
      className={styles.card}
      isList
      onCollapseChange={onCollapseChange}
      collapsed={collapsed}
      extra={
        <Tooltip
          title={intl.formatMessage({
            id: "see.more",
            defaultMessage: "More",
          })}
        >
          <div
            onClick={() =>
              navigate(
                `/virtualization-reliability/vm-scheduling-rule/host-group/detail?uuid=${detail.uuid}`,
              )
            }
          >
            <Icon type="external-link" />
          </div>
        </Tooltip>
      }
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
};

export default BasicInfo;
