import { Text } from "@zstack/design";
import { Icon } from "@zstack/icon";
import {
  SecurityGroupRulePolicy,
  SecurityGroupRuleType,
} from "@zstack/zsphere-types";
import { isCidr, isIP } from "@zstack/zsphere-utils";
import React from "react";
import { useIntl } from "react-intl";

import {
  validatePortNotConflict,
  validatorIp,
  validatorIpLength,
  validatorPort,
  validatorPortLength,
} from "./action/validator";

import style from "./style.module.less";

export enum RuleVerifyCodeEnum {
  "SG.1000" = "SG.1000",
  "SG.1001" = "SG.1001",
  "SG.1002" = "SG.1002",
  "SG.1003" = "SG.1003",
  "SG.1004" = "SG.1004",
  "SG.1005" = "SG.1005",
  "SG.1006" = "SG.1006",
  "SG.1007" = "SG.1007",
  "SG.1008" = "SG.1008",
  "SG.1009" = "SG.1009",
  "SG.1010" = "SG.1010",
  "SG.1011" = "SG.1011",
}

export const MaxRulesLimit = 100;

export const useSecurityGroupRuleType = () => {
  const intl = useIntl();

  const securityGroupRuleTypeMap = new Map<SecurityGroupRuleType, string>([
    [
      SecurityGroupRuleType.Ingress,
      intl.formatMessage({
        id: "securityGroup.rule.field.type.ingress",
        defaultMessage: "Ingress",
      }),
    ],
    [
      SecurityGroupRuleType.Egress,
      intl.formatMessage({
        id: "securityGroup.rule.field.type.egress",
        defaultMessage: "Egress",
      }),
    ],
  ]);

  return {
    securityGroupRuleTypeMap,
  };
};

export const useSecurityGroupRulePolicy = () => {
  const intl = useIntl();

  const securityGroupRulePolicyMap = new Map<SecurityGroupRulePolicy, string>([
    [
      SecurityGroupRulePolicy.ACCEPT,
      intl.formatMessage({
        id: "securityGroup.rule.field.action.accept",
        defaultMessage: "Allow",
      }),
    ],
    [
      SecurityGroupRulePolicy.DROP,
      intl.formatMessage({
        id: "securityGroup.rule.field.action.drop",
        defaultMessage: "Reject",
      }),
    ],
  ]);

  return { securityGroupRulePolicyMap };
};

export const useImportSgRuleVerifyCode = () => {
  const intl = useIntl();

  const State: React.FC<{ type: "danger" | "success"; text: string }> = ({
    type,
    text,
  }) => {
    return (
      <div className="flex flex-nowrap items-center gap-2">
        {type === "danger" ? (
          <Icon type="close-circle-fill" color="danger" />
        ) : (
          <Icon type="checkmark-circle-fill" color="positive" />
        )}
        <Text>{text}</Text>
      </div>
    );
  };

  const ruleVerifyCodeMap = new Map<RuleVerifyCodeEnum, React.ReactNode>([
    [
      RuleVerifyCodeEnum["SG.1000"],
      <State
        type="success"
        text={intl.formatMessage({
          id: "sg.rule.verify.success",
          defaultMessage: "Test passed",
        })}
      />,
    ],
    [
      RuleVerifyCodeEnum["SG.1001"],
      <State
        type="danger"
        text={intl.formatMessage({
          id: "sg.rule.verify.success.SG.1001",
          defaultMessage: "Cannot find the source or the destination. Modify and try again.",
        })}
      />,
    ],
    [
      RuleVerifyCodeEnum["SG.1002"],
      <State
        type="danger"
        text={intl.formatMessage({
          id: "sg.rule.verify.success.SG.1002",
          defaultMessage: "Duplicated rule. Modify and try again.",
        })}
      />,
    ],
    [
      RuleVerifyCodeEnum["SG.1003"],
      <State
        type="danger"
        text={intl.formatMessage({
          id: "sg.rule.verify.success.SG.1003",
          defaultMessage: "A conflict in the rule field.",
        })}
      />,
    ],
    [
      RuleVerifyCodeEnum["SG.1004"],
      <State
        type="danger"
        text={intl.formatMessage({
          id: "sg.rule.verify.success.SG.1004",
          defaultMessage: "Invalid rule fields.",
        })}
      />,
    ],
    [
      RuleVerifyCodeEnum["SG.1005"],
      <State
        type="danger"
        text={intl.formatMessage({
          id: "sg.rule.verify.success.SG.1005",
          defaultMessage: "Wrong PORT field.",
        })}
      />,
    ],
    [
      RuleVerifyCodeEnum["SG.1006"],
      <State
        type="danger"
        text={intl.formatMessage({
          id: "sg.rule.verify.success.SG.1006",
          defaultMessage: "Wrong IP field.",
        })}
      />,
    ],
    [
      RuleVerifyCodeEnum["SG.1007"],
      <State
        type="danger"
        text={intl.formatMessage({
          id: "sg.rule.verify.success.SG.1007",
          defaultMessage: "Incomplete information. Modify and try again.",
        })}
      />,
    ],
    [
      RuleVerifyCodeEnum["SG.1008"],
      <State
        type="danger"
        text={intl.formatMessage({
          id: "sg.rule.verify.success.SG.1008",
          defaultMessage: "Invalid characters in the rule. Modify and try again.",
        })}
      />,
    ],
    [
      RuleVerifyCodeEnum["SG.1009"],
      <State
        type="danger"
        text={intl.formatMessage({
          id: "sg.rule.verify.success.SG.1009",
          defaultMessage: "The rule contains both an IP address and a security group as the source/destination. Modify and try again.",
        })}
      />,
    ],
    [
      RuleVerifyCodeEnum["SG.1010"],
      <State
        type="danger"
        text={intl.formatMessage({
          id: "sg.rule.verify.success.SG.1010",
          defaultMessage: "Enter an integer between 1-100.",
        })}
      />,
    ],
    [
      RuleVerifyCodeEnum["SG.1011"],
      <State
        type="danger"
        text={intl.formatMessage({
          id: "sg.rule.verify.success.SG.1011",
          defaultMessage: "No security UUID.",
        })}
      />,
    ],
  ]);

  return {
    ruleVerifyCodeMap,
  };
};

export const useValidIpOrPort = () => {
  const intl = useIntl();

  const isLegalIPV6Range = (ipRange: string) => {
    const _ip = ipRange.split("-");
    const ipRangeValidate = (ip: string[]) => {
      return ip.length === 2;
    };
    const isIPValidate = (ip: string[]) => {
      return isIP(ip[0], 6) && isIP(ip[1], 6);
    };
    const result = ipRangeValidate(_ip) && isIPValidate(_ip);
    return result;
  };

  const validatorIpV6 = (inputIp: string) => {
    if (!inputIp) {
      return false;
    }
    const ipList = inputIp.split(",");
    let flag;

    for (const ip of ipList ?? []) {
      const i = ip.trim();
      flag = !i || (!isIP(i, 6) && !isCidr(i, 6) && !isLegalIPV6Range(i));
      if (flag) {
        break;
      }
    }
    return !flag;
  };

  const checkIp = (ip: string, ipVersion: 4 | 6 = 4) =>
    !ip || (ipVersion === 4 ? validatorIp(ip) : validatorIpV6(ip))
      ? Promise.resolve()
      : Promise.reject(
          Error(
            intl.formatMessage({
              id: "ruleTemplate.field.ip.validator.format",
              defaultMessage: "Invalid IP address.",
            }),
          ),
        );
  const checkIpLength = (ip: string) =>
    !ip || validatorIpLength(ip)
      ? Promise.resolve()
      : Promise.reject(
          Error(
            intl.formatMessage({
              id: "ruleTemplate.field.ip.validator.valueRange",
              defaultMessage: "The number of entries has exceeded the threshold.",
            }),
          ),
        );

  const checkPort = (port: string) =>
    !port || validatorPort(port)
      ? Promise.resolve()
      : Promise.reject(
          Error(
            intl.formatMessage({
              id: "ruleTemplate.field.port.validator.format",
              defaultMessage: "Invalid port.",
            }),
          ),
        );
  const checkPortLength = (port: string) =>
    !port || validatorPortLength(port)
      ? Promise.resolve()
      : Promise.reject(
          Error(
            intl.formatMessage({
              id: "ruleTemplate.field.port.validator.valueRange",
              defaultMessage: "The number of entries has exceeded the threshold.",
            }),
          ),
        );

  const checkPortRange = (
    port: string, //无输入 或者输入值非法 都不做冲突校验
  ) =>
    !port || !validatorPort(port) || validatePortNotConflict(port)
      ? Promise.resolve()
      : Promise.reject(
          Error(
            intl.formatMessage({
              id: "ruleTemplate.field.port.validator.used",
              defaultMessage: "The port is already in use.",
            }),
          ),
        );

  return {
    checkIp,
    checkIpLength,
    checkPort,
    checkPortLength,
    checkPortRange,
  };
};
