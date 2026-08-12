import { gql } from "@apollo/client";
import { Spin } from "@zstack/design";
import { DialogBase } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps, IQuery } from "@zstack/zsphere-types";
import { SecurityGroupRuleType, Op } from "@zstack/zsphere-types";
import type {
  SecurityGroup as ISecurityGroup,
  SecurityGroupRule as ISecurityGroupRule,
  SecurityGroupRulePriority,
} from "@zstack/zsphere-types/graphql";
import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";

import RuleList from "../list";

import style from "./style.module.less";

const updateSecurityGroupRulePriority = gql`
  mutation updateSecurityGroupRulePriority(
    $input: UpdateSecurityGroupRulePriorityInput!
  ) {
    updateSecurityGroupRulePriority(input: $input) {
      actionId
    }
  }
`;

const spinPlaceholderStyle = { height: 217 } as const;

export interface IProps {
  title?: string;
  securityGroupRuleType: SecurityGroupRuleType;
}

const Action: React.FC<
  IActionWrapperProps<ISecurityGroupRule, ISecurityGroup> & IProps
> = ({ source, title: _title, securityGroupRuleType, visible, setVisible }) => {
  const intl = useIntl();
  const doAction = useAction();
  // ZSTAC-59559
  const [delayedVisible, setDelayedVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setDelayedVisible(visible), 200);
    return () => clearTimeout(timer);
  }, [visible]);

  const title =
    _title ||
    intl.formatMessage({
      id: "securityGroupRule.action.adjust.priority.title",
      defaultMessage: "Adjust Priority",
    });

  const rulesPriorityRef = React.useRef<Array<SecurityGroupRulePriority>>([]);

  const defalutQuery = React.useMemo<IQuery>(() => {
    const conditions: IQuery["conditions"] = [
      {
        key: "securityGroupUuid",
        op: Op.eq,
        value: source?.uuid,
      },
      {
        key: "type",
        op: Op.eq,
        value: securityGroupRuleType,
      },
    ];

    return {
      conditions,
      start: 0,
      limit: 200,
      sortBy: "priority",
      sortDirection: "asc",
    };
  }, [source?.uuid, securityGroupRuleType]);

  const onSortEnd = (dataSource: ISecurityGroupRule[]) => {
    const defaultSgRules = dataSource.filter((it) => it.priority === 0);
    const sgRules = dataSource.filter((it) => it.priority !== 0);

    rulesPriorityRef.current = sgRules.map((it, index) => ({
      ruleUuid: it.uuid,
      priority: index + 1,
    }));

    return [
      ...defaultSgRules,
      ...sgRules.map((it, index) => ({ ...it, priority: index + 1 })),
    ];
  };

  const sortableProps = React.useMemo(
    () => ({
      sortable: true,
      onSortEnd,
      onDisabledSortable: (dataSource: ISecurityGroupRule[]) => {
        return dataSource
          .filter((it) => it.priority === 0)
          .map((it) => it.uuid);
      },
    }),
    [],
  );

  const onOk = async () => {
    doAction({
      mutation: updateSecurityGroupRulePriority,
      payload: {
        securityGroupUuid: source?.uuid,
        rules: rulesPriorityRef.current,
        type: securityGroupRuleType,
      },
      name: title,
      total: 1,
      type: "securityGroupRuleList",
      onFinish: () => {
        setVisible?.(false);
      },
    });
  };

  return (
    <DialogBase
      widthClassName="w-[1000px]"
      title={title}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
    >
      <div className={style.modalBody}>
        {delayedVisible ? (
          <RuleList
            view={
              securityGroupRuleType === SecurityGroupRuleType.Ingress
                ? "select"
                : "select.out"
            }
            securityGroup={[source!]}
            ruleType={securityGroupRuleType}
            toolbar={false}
            rowSelection={false}
            pagination={false}
            defaultQuery={defalutQuery}
            tableProps={
              {
                sortableProps,
              } as any
            }
          />
        ) : (
          <Spin spinning>
            <div style={spinPlaceholderStyle} />
          </Spin>
        )}
      </div>
    </DialogBase>
  );
};

export default Action;
