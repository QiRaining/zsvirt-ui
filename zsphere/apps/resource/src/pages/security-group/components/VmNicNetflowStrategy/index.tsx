import type { ISelectProps } from "@zstack/zsphere-components";
import { Form, Select } from "@zstack/zsphere-components";
import { VmNicSecurityPolicyEnum } from "@zstack/zsphere-types";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import style from "./style.module.less";

export interface IVmNicDefaultNetflowStrategyProps {
  width?: ISelectProps["width"];
  ingressPolicyName?: string;
  egressPolicyName?: string;
}

export const useVmNicDefaultNetflowStrategy = () => {
  const intl = useIntl();

  const vmNicDefaultNetflowStrategyMap = new Map<
    VmNicSecurityPolicyEnum,
    string
  >([
    [
      VmNicSecurityPolicyEnum.ALLOW,
      intl.formatMessage({
        id: "vmNic.default.netflow.strategy.allow",
        defaultMessage: "Allow",
      }),
    ],
    [
      VmNicSecurityPolicyEnum.DENY,
      intl.formatMessage({
        id: "securityGroup.rule.field.action.deny",
        defaultMessage: "Reject",
      }),
    ],
  ]);

  const vmNicDefaultNetflowStrategyList = [
    ...vmNicDefaultNetflowStrategyMap.entries(),
  ].map(([key, label]) => ({ key, label }));

  return { vmNicDefaultNetflowStrategyMap, vmNicDefaultNetflowStrategyList };
};

export const VmNicDefaultNetflowStrategy: React.FC<
  IVmNicDefaultNetflowStrategyProps
> = ({
  width = "m",
  ingressPolicyName = "ingressPolicy",
  egressPolicyName = "egressPolicy",
}) => {
  const intl = useIntl();
  const { vmNicDefaultNetflowStrategyList } = useVmNicDefaultNetflowStrategy();

  const vmNicDefaultNetflowStrategyOptions = React.useMemo(
    () =>
      vmNicDefaultNetflowStrategyList.map((it: any) => ({
        label: it.label,
        value: it.key,
      })),
    [vmNicDefaultNetflowStrategyList],
  );

  return (
    <div className={style["defalut-netflow-container"]}>
      <Form.Item
        label={intl.formatMessage({
          id: "vmNic.default.netflow.strategy",
          defaultMessage: "Policy for Unstipulated Flow",
        })}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "vmNic.field.default.netflow.strategy.iconTooltip",
              defaultMessage: "",
            })}
          </ReactMarkdown>
        }
      />
      <div className={style["defalut-netflow"]}>
        <Form.Item
          label={intl.formatMessage({
            id: "vmNic.default.netflow.strategy.ingress",
            defaultMessage: "Ingress",
          })}
          name={ingressPolicyName}
        >
          <Select width={width} options={vmNicDefaultNetflowStrategyOptions} />
        </Form.Item>
        <Form.Item
          label={intl.formatMessage({
            id: "vmNic.default.netflow.strategy.egress",
            defaultMessage: "Egress",
          })}
          name={egressPolicyName}
        >
          <Select width={width} options={vmNicDefaultNetflowStrategyOptions} />
        </Form.Item>
      </div>
    </div>
  );
};
