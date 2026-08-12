import { RadioGroup } from "@zstack/design";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import type { Condition as ICondition } from "@zstack/zsphere-types";
import { Op, SecurityGroupRuleType } from "@zstack/zsphere-types";
import type { SecurityGroup as ISecurityGroup } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useState, useReducer } from "react";
import { useIntl } from "react-intl";

import RuleList from "./list";

import style from "./style.module.less";

interface IProps {
  detail: ISecurityGroup;
}

const radioGroupMarginStyle = { marginBottom: 12, marginTop: 8 } as const;

const Overview: React.FC<IProps> = ({ detail }) => {
  const intl = useIntl();

  const { uuid } = detail;

  const defaultConditions = useMemo<ICondition[]>(() => {
    const conditions = [
      {
        key: "securityGroupUuid",
        op: Op.eq,
        value: uuid,
      },
    ];
    return conditions;
  }, [uuid]);

  const [tabType, setTabType] = useState<"ingress" | "egress">("ingress");

  const [ruleKey, updateKey] = useReducer((x) => x + 1, 1);
  useActionSubscribe({
    resourceTypeList: ["securityGroupRuleList"],
    onProgress: () => {
      updateKey();
    },
  });

  return (
    <div className={style.container}>
      <RadioGroup
        defaultValue="ingress"
        style={radioGroupMarginStyle}
        onValueChange={(value) => setTabType(value as "ingress" | "egress")}
        variant="outline"
        options={[
          {
            value: "ingress",
            label: intl.formatMessage({
              id: "ingressRule",
              defaultMessage: "Ingress Rule",
            }),
          },
          {
            value: "egress",
            label: intl.formatMessage({
              id: "egressRule",
              defaultMessage: "Egress Rule",
            }),
          },
        ]}
      />

      {tabType === "ingress" && (
        <RuleList
          securityGroup={[detail]}
          source={detail}
          view="main"
          defaultQuery={{
            conditions: [
              ...defaultConditions,
              {
                key: "type",
                op: Op.eq,
                value: SecurityGroupRuleType.Ingress,
              },
            ],
            sortBy: "priority",
            sortDirection: "asc",
          }}
          ruleType={SecurityGroupRuleType.Ingress}
          key={ruleKey}
        />
      )}
      {tabType === "egress" && (
        <RuleList
          securityGroup={[detail]}
          source={detail}
          view="main.out"
          defaultQuery={{
            conditions: [
              ...defaultConditions,
              {
                key: "type",
                op: Op.eq,
                value: SecurityGroupRuleType.Egress,
              },
            ],
            sortBy: "priority",
            sortDirection: "asc",
          }}
          ruleType={SecurityGroupRuleType.Egress}
          key={ruleKey}
        />
      )}
    </div>
  );
};

export default Overview;
