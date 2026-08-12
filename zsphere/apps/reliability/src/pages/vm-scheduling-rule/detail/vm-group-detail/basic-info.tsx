import { Text, Tooltip } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import { Icon } from "@zstack/icon";
import type { ListItem } from "@zstack/zsphere-components";
import { List, DraggableCard } from "@zstack/zsphere-components";
import { CopyableText } from "@zstack/zsphere-design-biz";
import type { VmGroup } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";

import styles from "./style.module.less";

export interface IProps {
  detail: VmGroup;
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
        value: detail?.name ? <Text>{detail.name}</Text> : undefined,
      },
      {
        label: intl.formatMessage({
          id: "vmCount",
          defaultMessage: "VMs",
        }),
        value: detail?.vmCount || "0",
      },
      {
        label: intl.formatMessage({
          id: "associatedSchedulingRule",
          defaultMessage: "Associated Scheduling Policy",
        }),
        value: detail?.vmSchedulingRuleCount,
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
        id: "vmGroup",
        defaultMessage: "VM Scheduling Group",
      })}
      isList
      onCollapseChange={onCollapseChange}
      collapsed={collapsed}
      className={styles.card}
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
                `/virtualization-reliability/vm-scheduling-rule/vm-group/detail?uuid=${detail.uuid}`,
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
