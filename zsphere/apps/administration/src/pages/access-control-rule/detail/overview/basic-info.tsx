import { Text } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import { DraggableCard, Tag } from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { List } from "@zstack/zsphere-components";
import type { AccessControlRule as IAccessControlRule } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { useAccessControlRuleType } from "../../hook";

export interface IProps {
  detail: IAccessControlRule;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  refetch?: Function;
}

const BasicInfo: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed,
}) => {
  const intl = useIntl();

  const { accessControlRuleTypeMap } = useAccessControlRuleType();

  const { getServerTime } = useTime();

  const ipV4Rules = React.useMemo(
    () => detail?.rule?.split(",") ?? [],
    [detail.rule],
  );

  const list = React.useMemo<Array<ListItem>>(
    () => [
      {
        label: intl.formatMessage({
          id: "name",
          defaultMessage: "Name",
        }),
        value: detail?.name,
      },
      {
        // todo，这里看代码是看不懂这个i18n是啥意思，为啥要用ipV4Rules.length来当number
        label: intl.formatMessage(
          {
            id: "virtualization.accessControlRule.ip.adress.ipv4.num",
            defaultMessage: "IP Address ({num})",
          },
          {
            num: ipV4Rules.length,
          },
        ),
        value: (
          <div className="flex flex-col gap-1">
            {ipV4Rules.map((ip) => (
              <div key={ip}>
                <Tag>{ip}</Tag>
              </div>
            ))}
          </div>
        ),
      },
      {
        label: intl.formatMessage({
          id: "type",
          defaultMessage: "Type",
        }),
        value: accessControlRuleTypeMap.get(detail.strategy),
      },
      {
        label: intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        }),
        value: detail.description ? (
          <Text>{detail.description}</Text>
        ) : (
          <Text>{intl.formatMessage({ id: "none" })}</Text>
        ),
      },
      {
        label: intl.formatMessage({
          id: "createDate",
          defaultMessage: "Creation Time",
        }),
        value: getServerTime(detail.createDate).format("YYYY-MM-DD HH:mm:ss"),
      },
      //  去除所有最后操作时间
      // {
      //   label: intl.formatMessage({
      //     id: 'lastOpDate',
      //     defaultMessage: '最后操作日期'
      //   }),
      //   value: getServerTime(detail.lastOpDate).format('YYYY-MM-DD HH:mm:ss')
      // }
    ],
    [intl, detail, ipV4Rules, accessControlRuleTypeMap, getServerTime],
  );

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "config.info",
        defaultMessage: "Configurations",
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
