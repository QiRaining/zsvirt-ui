import { Text } from "@zstack/design";
import { useSecurityGroupRulePolicy } from "@zstack/virtualization-resource/src/pages/security-group/utils";
import { useColumnConfig } from "@zstack/zsphere-engine/src/security-group-rule";
import type { IOption } from "@zstack/zsphere-engine/src/security-group-rule/useColumnConfig";
import { SecurityGroupRuleProtocolType } from "@zstack/zsphere-types";
import type { SecurityGroupRule as ISecurityGroupRule } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import style from "./style.module.less";

const spaceFullWidthStyle = { width: "100%" } as const;

export default () => {
  const intl = useIntl();
  const { securityGroupRulePolicyMap } = useSecurityGroupRulePolicy();

  const getAuthorizedEle = (
    ipRange?: string,
    remoteSecurityGroupName?: string,
  ) => {
    let ipEle;
    let sgEle;

    if (ipRange) {
      ipEle = (
        <div className={style.authorizedWrapper}>
          <Text className={style.authorized}>IP:</Text>
          <Text>{ipRange}</Text>
        </div>
      );
    }

    if (remoteSecurityGroupName) {
      sgEle = (
        <div className={style.authorizedWrapper}>
          <Text className={style.authorized}>
            {`${intl.formatMessage({
              id: "securityGroup",
              defaultMessage: "Security Group",
            })}:`}
          </Text>
          <Text>{remoteSecurityGroupName}</Text>
        </div>
      );
    }

    if (!ipRange && !remoteSecurityGroupName) {
      return "-";
    }

    return (
      <div className="flex flex-col gap-2" style={spaceFullWidthStyle}>
        {ipEle}
        {sgEle}
      </div>
    );
  };

  const options = React.useMemo<IOption<ISecurityGroupRule>>(
    () => [
      {
        key: "priority",
        sorter: true,
        defaultSortOrder: "ascend",
        render: (record: ISecurityGroupRule) => {
          return record.priority === 0
            ? intl.formatMessage({
                id: "sg.rule.priority.top",
                defaultMessage: "Highest",
              })
            : record.priority;
        },
      },
      {
        key: "action",
        render: (record: ISecurityGroupRule) => {
          return record.action
            ? securityGroupRulePolicyMap.get(record.action)
            : "";
        },
      },
      {
        key: "protocol",
        filterOptions: SecurityGroupRuleProtocolType,
      },
      {
        key: "portRange",
        title: intl.formatMessage({ id: "port" }),
        render: (record: ISecurityGroupRule) =>
          record.dstPortRange ? <Text>{record.dstPortRange}</Text> : "-",
      },
      {
        key: "src",
        render: (record: ISecurityGroupRule) => {
          const { srcIpRange, remoteSecurityGroup } = record;

          return getAuthorizedEle(srcIpRange, remoteSecurityGroup?.name);
        },
      },
      {
        key: "dst",
        render: (record: ISecurityGroupRule) => {
          const { dstIpRange, remoteSecurityGroup } = record;

          return getAuthorizedEle(dstIpRange, remoteSecurityGroup?.name);
        },
      },
      {
        key: "ipVersion",
        filters: [
          { text: "IPv4", value: 4 },
          { text: "IPv6", value: 6 },
        ],
        formatter: (record) => `IPv${record.ipVersion}`,
      },
      {
        key: "description",
        render: (record: ISecurityGroupRule) => {
          let text = record.description ?? "-";

          if (record.priority === 0) {
            text =
              record.ipVersion === 4
                ? intl.formatMessage({
                    id: "sg.rule.ipv4.default.description",
                    defaultMessage: "Default: for communication within the group",
                  })
                : intl.formatMessage({
                    id: "sg.rule.ipv6.default.description",
                    defaultMessage: "Default: for communication within the group",
                  });
          }

          return <Text>{text}</Text>;
        },
      },
    ],
    [getAuthorizedEle, intl, securityGroupRulePolicyMap],
  );

  return useColumnConfig(options);
};
