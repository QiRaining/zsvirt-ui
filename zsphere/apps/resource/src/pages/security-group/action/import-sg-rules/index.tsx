import { gql } from "@apollo/client";
import { Button, Checkbox, Text } from "@zstack/design";
import {
  Form,
  Icon,
  Table,
  Empty,
  State as ZState,
  Alert,
} from "@zstack/zsphere-components";
import { Upload } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import {
  useAction,
  useValidator,
  IIsRequiredType,
} from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import {
  SecurityGroupRuleType,
  SecurityGroupRuleState,
  SecurityGroupRulePolicy,
  SecurityGroupRuleProtocolType,
} from "@zstack/zsphere-types";
import type {
  SecurityGroup,
  SecurityGroupRule as ISecurityGroupRule,
  AddRuleParam as IAddRuleParam,
  SecurityGroupRuleParam as ISecurityGroupRuleParam,
  ValidateSecurityGroupRuleOutput as IValidateSecurityGroupRuleOutput,
} from "@zstack/zsphere-types/graphql";
import { genUuid } from "@zstack/zsphere-utils";
import { usePersistFn } from "ahooks";
import { ConfigProvider, message } from "antd";
import GBK from "gbk.js";
import _ from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import {
  useSecurityGroupRuleType,
  useSecurityGroupRulePolicy,
  useValidIpOrPort,
  MaxRulesLimit,
} from "../../utils";

import style from "./style.module.less";

// @ts-expect-error
const { apolloClient } = window.g_main;

enum MessageKey {
  Loading = "validateSecurityGroupRuleLoading",
}

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

export const useImportSgRuleVerifyCode = () => {
  const intl = useIntl();

  const State: React.FC<{ type: "danger" | "success"; text: string }> = ({
    type,
    text,
  }) => {
    return (
      <div className={`flex items-center gap-2 ${style.space}`}>
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

export interface IVerifyResult {
  code: string;
  result?: {
    position?: {
      rowNo: number;
      columnNo: number;
    };
    message?: string;
  };
}

const addSecurityGroupRule = gql`
  mutation addSecurityGroupRule($input: AddSecurityGroupRuleInput!) {
    addSecurityGroupRule(input: $input) {
      actionId
    }
  }
`;

const validateSecurityGroupRule = gql`
  mutation validateSecurityGroupRule($input: ValidateSecurityGroupRuleInput!) {
    validateSecurityGroupRule(input: $input) {
      available
      code
    }
  }
`;

export const useSecurityGroupRulesColumns = () => {
  const intl = useIntl();
  const { securityGroupRuleTypeMap } = useSecurityGroupRuleType();
  const { securityGroupRulePolicyMap } = useSecurityGroupRulePolicy();
  const { ruleVerifyCodeMap } = useImportSgRuleVerifyCode();

  const columns = React.useMemo(
    () => [
      {
        key: "type",
        dataIndex: "type",
        width: 100,
        fixed: "left" as const,
        title: intl.formatMessage({
          id: "securityGroup.rule.field.direction",
          defaultMessage: "Direction",
        }),
        render: (value: any) => {
          return securityGroupRuleTypeMap.get(value);
        },
      },
      {
        key: "priority",
        dataIndex: "priority",
        width: 100,
        title: intl.formatMessage({ id: "priority", defaultMessage: "Priority" }),
      },
      {
        key: "action",
        dataIndex: "action",
        width: 100,
        title: intl.formatMessage({ id: "strategy", defaultMessage: "Policy" }),
        render: (value: any) => {
          return securityGroupRulePolicyMap.get(value);
        },
      },
      {
        key: "protocol",
        dataIndex: "protocol",
        width: 100,
        title: intl.formatMessage({
          id: "protocol",
          defaultMessage: "Protocol",
        }),
      },
      {
        key: "dstPortRange",
        dataIndex: "dstPortRange",
        width: 100,
        title: intl.formatMessage({
          id: "portRange",
          defaultMessage: "Port Range",
        }),
        render: (value: string) => {
          return value ? <Text>{value}</Text> : "-";
        },
      },
      {
        key: "authorizedIp",
        dataIndex: "authorizedIp",
        width: 150,
        title: intl.formatMessage({
          id: "securityGroup.rule.field.authorized.ip.cidr",
          defaultMessage: "Source/Destination IP/CIDR",
        }),
        render: (value: string, record: ISecurityGroupRule) => {
          const ip = record.srcIpRange || record.dstIpRange;

          return ip ? <Text>{ip}</Text> : "-";
        },
      },
      {
        key: "authorizedSg",
        dataIndex: "authorizedSg",
        width: 150,
        title: intl.formatMessage({
          id: "securityGroup.rule.field.authorized.sgName",
          defaultMessage: "Source/Destination Security Group",
        }),
        render: (value: string, record: ISecurityGroupRule) => {
          const sgName = record.remoteSecurityGroup?.name;

          return sgName ? <Text>{sgName}</Text> : "-";
        },
      },
      {
        key: "ipVersion",
        dataIndex: "ipVersion",
        width: 100,
        title: intl.formatMessage({
          id: "ipVersionType",
          defaultMessage: "IP Address Type",
        }),
        render: (value: string) => {
          return <Text>{`IPv${value}`}</Text>;
        },
      },
      {
        key: "verify",
        dataIndex: "verify",
        width: 160,
        fixed: "right" as const,
        title: intl.formatMessage({
          id: "verify.resulut",
          defaultMessage: "Verification Result",
        }),
        render: (v: any, row: any) => {
          return (
            ruleVerifyCodeMap.get(row.verifyResult.code) ?? (
              <ZState
                prefix="icon"
                type="error"
                name={intl.formatMessage({
                  id: "unknown",
                  defaultMessage: "Unknown",
                })}
              />
            )
          );
        },
      },
    ],
    [
      intl,
      ruleVerifyCodeMap,
      securityGroupRulePolicyMap,
      securityGroupRuleTypeMap,
    ],
  );

  return columns;
};

const Action: React.FC<IActionWrapperProps<SecurityGroup>> = ({
  visible,
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();
  const { isRequired } = useValidator(intl);
  const doAction = useAction();
  const [form] = Form.useForm();
  const { checkPort, checkPortRange, checkIp } = useValidIpOrPort();

  const [dataSource, setDataSource] = React.useState<any[]>([]);
  const [allowPartialImport, setAllowPartialImport] = React.useState(false);

  const fileRef = React.useRef<any>("");

  const columns = useSecurityGroupRulesColumns();

  const current = React.useMemo(() => selectedList?.[0] ?? {}, [selectedList]);

  const title = intl.formatMessage({
    id: "securityGroup.import.securityGroupRule",
    defaultMessage: "Import Rule",
  });

  const validatedDataSource = React.useMemo(
    () =>
      dataSource.filter(
        (item) => item.verifyResult.code === RuleVerifyCodeEnum["SG.1000"],
      ),
    [dataSource],
  );

  const preVerify = usePersistFn(
    async (item: Partial<IAddRuleParam>, _rowNo: number) => {
      const verifyResult: IVerifyResult = {
        code: RuleVerifyCodeEnum["SG.1000"], // 默认是正确的
        result: {},
      };

      const _item = {
        ...item,
        verifyResult,
      };

      const isRequierd = (value?: any) => {
        const isExist = (v: any): boolean => {
          let _v = v;
          if (_.isNumber(v)) {
            _v = String(v);
          }
          return !_.isNil(_v) && !_.isEmpty(_v);
        };

        if (!isExist(value)) {
          throw JSON.stringify({
            ...item,
            verifyResult: {
              code: RuleVerifyCodeEnum["SG.1007"],
            },
          });
        }
      };

      // 校验方向
      const verifySgRuleType = (record: Partial<IAddRuleParam>) => {
        isRequierd(record.type);

        const keys = Object.keys(SecurityGroupRuleType);

        if (!keys.includes(record.type as string)) {
          throw JSON.stringify({
            ...item,
            verifyResult: {
              code: RuleVerifyCodeEnum["SG.1008"],
            },
          });
        }

        return record;
      };

      // 校验策略
      const verifySgRulePolicy = (record: Partial<IAddRuleParam>) => {
        isRequierd(record.action);

        const keys = Object.keys(SecurityGroupRulePolicy);

        if (!keys.includes(record.action as string)) {
          throw JSON.stringify({
            ...item,
            verifyResult: {
              code: RuleVerifyCodeEnum["SG.1008"],
            },
          });
        }

        return record;
      };

      // 校验协议
      const verifySgRuleProtocol = (record: Partial<IAddRuleParam>) => {
        isRequierd(record.protocol);

        const keys = Object.keys(SecurityGroupRuleProtocolType);

        if (!keys.includes(record.protocol as string)) {
          throw JSON.stringify({
            ...item,
            verifyResult: {
              code: RuleVerifyCodeEnum["SG.1008"],
            },
          });
        }

        return record;
      };

      // 校验端口范围
      const verifySgRulePortRange = async (record: Partial<IAddRuleParam>) => {
        if (
          [
            SecurityGroupRuleProtocolType.TCP,
            SecurityGroupRuleProtocolType.UDP,
          ].includes(record.protocol as SecurityGroupRuleProtocolType)
        ) {
          isRequierd(record.dstPortRange);
        }

        if (
          [
            SecurityGroupRuleProtocolType.ICMP,
            SecurityGroupRuleProtocolType.ALL,
          ].includes(record.protocol as SecurityGroupRuleProtocolType)
        ) {
          if (record.dstPortRange) {
            throw JSON.stringify({
              ...item,
              verifyResult: {
                code: RuleVerifyCodeEnum["SG.1008"],
              },
            });
          }
        }

        try {
          await checkPort(record.dstPortRange as string);
          await checkPortRange(record.dstPortRange as string);
          return record;
        } catch {
          throw JSON.stringify({
            ...item,
            verifyResult: {
              code: RuleVerifyCodeEnum["SG.1005"],
            },
          });
        }
      };

      // 校验ip地址类型
      const verifyIpVersion = (record: Partial<IAddRuleParam>) => {
        isRequierd(record.ipVersion);

        const ipVersionList = [4, 6];

        if (!ipVersionList.includes(record.ipVersion as number)) {
          throw JSON.stringify({
            ...item,
            verifyResult: {
              code: RuleVerifyCodeEnum["SG.1008"],
            },
          });
        }

        return record;
      };

      // 校验授权对象,ip/安全组
      const verifyAuthorized = async (
        record: Partial<
          IAddRuleParam & {
            remoteSecurityGroup: { name: string; uuid: string };
          }
        >,
      ) => {
        const ip = record.srcIpRange || record.dstIpRange;
        const sgUuid = record.remoteSecurityGroupUuid;
        const sgName = record?.remoteSecurityGroup?.name;

        if (ip && sgUuid) {
          throw JSON.stringify({
            ...item,
            verifyResult: {
              code: RuleVerifyCodeEnum["SG.1009"],
            },
          });
        }

        if (sgName && !sgUuid) {
          throw JSON.stringify({
            ...item,
            verifyResult: {
              code: RuleVerifyCodeEnum["SG.1011"],
            },
          });
        }

        try {
          if (ip) {
            await checkIp(ip as string, record.ipVersion as 4 | 6);
          }

          return record;
        } catch {
          throw JSON.stringify({
            ...item,
            verifyResult: {
              code: RuleVerifyCodeEnum["SG.1006"],
            },
          });
        }
      };

      const pipe = async (funs: Function[]) => {
        return async (input: any) => {
          let result = input;
          for (const fn of funs ?? []) {
            result = await fn(result);
          }
          return result;
        };
      };

      const execVerify = await pipe([
        verifySgRuleType,
        verifySgRulePolicy,
        verifySgRuleProtocol,
        verifySgRulePortRange,
        verifyIpVersion,
        verifyAuthorized,
      ]);

      try {
        const record = await execVerify(_item);

        return record;
      } catch (e: any) {
        const prasedItem = JSON.parse(e);
        return prasedItem;
      }
    },
  );

  const transformImportData = async (data: string[]) => {
    const getSrcIpRange = (ruleType: string, authorized?: string) => {
      if (!authorized) {
        return;
      }

      const _authorized = authorized.replace(/;/g, ",").replace(/~/g, "-");

      if (ruleType === SecurityGroupRuleType.Ingress) {
        return _authorized;
      }

      return;
    };

    const getDstIpRange = (ruleType: string, authorized?: string) => {
      if (!authorized) {
        return;
      }

      const _authorized = authorized.replace(/;/g, ",").replace(/~/g, "-");

      if (ruleType === SecurityGroupRuleType.Egress) {
        return _authorized;
      }

      return;
    };

    const _dataSource = await Promise.all(
      data.map(async (it, index) => {
        const [
          type,
          action,
          protocol,
          portRange,
          authorizedIp,
          authorizedSgName,
          ipVersion,
          _remoteSecurityGroupUuid,
        ] = it.split(",");

        const remoteSecurityGroupUuid = _remoteSecurityGroupUuid;

        const item = {
          uuid: genUuid(),
          securityGroupUuid: current.uuid,
          type,
          action,
          protocol,
          dstPortRange: portRange
            ? portRange.replace(/;/g, ",").replace(/~/g, "-")
            : undefined,
          srcIpRange: getSrcIpRange(type, authorizedIp),
          dstIpRange: getDstIpRange(type, authorizedIp),
          ipVersion: +ipVersion.replace("IPv", ""),
          remoteSecurityGroupUuid: remoteSecurityGroupUuid || undefined,
          remoteSecurityGroup: {
            name: authorizedSgName,
            uuid: remoteSecurityGroupUuid,
          },
        };

        const _item = await preVerify(item as any, index + 1);

        return _item;
      }),
    );

    const findMaxPriority = (type: SecurityGroupRuleType) => {
      return (
        _.maxBy(
          _.compact(current.rules).filter((it) => it.type === type),
          (rule) => rule.priority,
        )?.priority || 0
      );
    };

    // 计算优先级
    const ingressMaxPriority = findMaxPriority(SecurityGroupRuleType.Ingress);
    const egressMaxPriority = findMaxPriority(SecurityGroupRuleType.Egress);

    // 校验优先级
    const serializeDataSourceFn = (
      list: any[],
      type: SecurityGroupRuleType,
      maxPriority: number,
    ) => {
      return list
        .filter((it) => it.type === type)
        .map((it, index) => {
          const priority = maxPriority + index + 1;

          // 是否超过限制
          const maxLimitVerifyCode =
            priority > MaxRulesLimit
              ? RuleVerifyCodeEnum["SG.1010"]
              : RuleVerifyCodeEnum["SG.1000"];

          const code =
            it.verifyResult.code === RuleVerifyCodeEnum["SG.1000"]
              ? maxLimitVerifyCode
              : it.verifyResult.code;

          return {
            ...it,
            priority,
            verifyResult: {
              code,
            },
          };
        });
    };

    const serializeDataSource = [
      ...serializeDataSourceFn(
        _dataSource,
        SecurityGroupRuleType.Ingress,
        ingressMaxPriority,
      ),
      ...serializeDataSourceFn(
        _dataSource,
        SecurityGroupRuleType.Egress,
        egressMaxPriority,
      ),
    ];

    const serializeDataSourceMap = _.reduce(
      serializeDataSource,
      (obj, curr) => {
        if (!obj[curr.uuid]) {
          obj[curr.uuid] = curr;
        }
        return obj;
      },
      {} as any,
    );

    return _dataSource.map((it) => {
      if (serializeDataSourceMap[it.uuid]) {
        return serializeDataSourceMap[it.uuid];
      }
      return it;
    });
  };

  const onCheck = () => {
    message.destroy(MessageKey.Loading);

    message.loading({
      key: MessageKey.Loading,
      content: intl.formatMessage({
        id: "checkingSyntax",
        defaultMessage: "Syntax checking...",
      }),
      icon: <Icon type="loader" />,
    });

    const agent = window.navigator.userAgent?.toLowerCase();

    const byteArray = agent?.includes("win")
      ? GBK.decode(new Uint8Array(fileRef.current))
      : new Uint8Array(fileRef.current);

    const blob = new window.Blob([byteArray], {
      type: "text/plain",
    });

    const reader = new window.FileReader();

    reader.onload = async (e: any) => {
      // #ZSTAC-71234
      const importData = (e.target.result as string)
        .replace(/\r/g, "")
        .split("\n")
        .slice(1)
        .map((v) => v.trim())
        .filter((v) => !!v);

      const importRules = await transformImportData(importData);

      if (
        !importRules.some(
          (importRule) =>
            importRule.verifyResult.code === RuleVerifyCodeEnum["SG.1000"],
        )
      ) {
        setDataSource(importRules);
        return;
      }

      const paramsRules: (ISecurityGroupRuleParam & { uuid: string })[] = [];
      const paramsRulesIndex: number[] = [];
      importRules.forEach((importRule, index) => {
        if (importRule.verifyResult.code === RuleVerifyCodeEnum["SG.1000"]) {
          paramsRules.push(importRule);
          paramsRulesIndex.push(index);
        }
      });

      const rulesParamsMap = _.reduce(
        paramsRules,
        (obj, curr) => {
          if (!obj[curr.uuid]) {
            obj[curr.uuid] = curr;
          }
          return obj;
        },
        {} as any,
      );

      const resp = await apolloClient.mutate({
        mutation: validateSecurityGroupRule,
        variables: {
          input: {
            payload: {
              rules: paramsRules.map((it) =>
                _.omit(it, ["remoteSecurityGroup", "verifyResult", "uuid"]),
              ),
            },
          },
        },
      });
      const list: IValidateSecurityGroupRuleOutput[] =
        resp?.data?.validateSecurityGroupRule ?? [];

      message.destroy(MessageKey.Loading);
      if (!_.isEmpty(list)) {
        const _list = list.map((it, index) => ({
          ...it,
          paramsRulesIndex: paramsRulesIndex[index],
        }));

        const _listMap = _.reduce(
          _list,
          (obj, curr) => {
            if (!obj[curr.paramsRulesIndex]) {
              obj[curr.paramsRulesIndex] = curr;
            }

            return obj;
          },
          {} as any,
        );

        const _dataSource = importRules.map((it, index) => {
          if (rulesParamsMap[it.uuid]) {
            // 通过api校验的code
            const apiVerifyCode = _listMap[index].available
              ? RuleVerifyCodeEnum["SG.1000"]
              : _listMap[index].code;

            const code =
              it.verifyResult.code === RuleVerifyCodeEnum["SG.1000"]
                ? apiVerifyCode
                : it.verifyResult.code;

            return {
              ...it,
              ..._.omit(_listMap[index], ["__typename", "paramsRulesIndex"]),
              verifyResult: {
                code,
              },
            };
          }

          return it;
        });

        setDataSource(_dataSource.map((it) => _.omit(it, ["uuid"])));
      }
    };

    reader.readAsText(blob, agent?.includes("win") ? "UTF-8" : "GB2312");
  };

  const onCancel = () => {
    fileRef.current = null;
    setDataSource([]);
    setAllowPartialImport(false);
  };

  const invalidDataSourceCount = dataSource.length - validatedDataSource.length;

  const disabledConfirmBtn = React.useMemo(() => {
    return (
      !dataSource.length ||
      dataSource.length === invalidDataSourceCount ||
      (invalidDataSourceCount > 0 && !allowPartialImport)
    );
  }, [dataSource, invalidDataSourceCount, allowPartialImport]);

  const onOk = React.useCallback(async () => {
    const rules = validatedDataSource.map((it) => ({
      ..._.omit(it, [
        "available",
        "code",
        "priority",
        "remoteSecurityGroup",
        "securityGroupUuid",
        "verifyResult",
      ]),
      state: SecurityGroupRuleState.Disabled,
    }));

    doAction({
      mutation: addSecurityGroupRule,
      payload: {
        securityGroupUuid: current?.uuid,
        rules,
      },
      name: title,
      total: 1,
      type: "securityGroupRuleList",
      onFinish: () => {
        setVisible?.(false);
      },
    });
  }, [validatedDataSource, current.uuid, doAction, setVisible, title]);

  React.useEffect(() => {
    if (!visible) {
      onCancel();
    } else {
      form.resetFields();
    }
  }, [visible, form]);

  const footerEle = React.useMemo<JSX.Element>(() => {
    return (
      <div className="flex items-center gap-2">
        <Button key="cancel" variant="link" onClick={() => setVisible(false)}>
          {intl.formatMessage({ id: "bottun.cancel", defaultMessage: "Cancel" })}
        </Button>
        <Button
          key="ok"
          variant="primary"
          onClick={() => onOk()}
          disabled={disabledConfirmBtn}
        >
          {intl.formatMessage({ id: "button.ok", defaultMessage: "OK" })}
        </Button>
      </div>
    );
  }, [intl, disabledConfirmBtn, setVisible, onOk]);

  const handleFileChange = (file: File | null) => {
    setAllowPartialImport(false);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        fileRef.current = e.target?.result;
        onCheck();
      };
      reader.readAsArrayBuffer(file);
    } else {
      fileRef.current = null;
      setDataSource([]);
    }
  };

  const renderTableEmpty = () => (
    <Empty
      type="Select"
      description={intl.formatMessage(
        { id: "table.no.data", defaultMessage: "No data, {addNode}" },
        {
          addNode: (
            <Upload.Link
              className={style.uploadLink}
              accept=".csv"
              title={intl.formatMessage({
                id: "add.rule",
                defaultMessage: "Add Rule",
              })}
              onChange={(file) => {
                form.setFieldsValue({ file });
                handleFileChange(file);
              }}
            />
          ),
        },
      )}
    />
  );

  let alertMessage: React.ReactNode;
  if (invalidDataSourceCount <= 0) {
    alertMessage = null;
  } else if (invalidDataSourceCount >= dataSource.length) {
    alertMessage = (
      <div className={style.alert}>
        <Alert
          type="warning"
          display="weak"
          message={intl.formatMessage(
            {
              id: "sg.import.rule.alert.message",
              defaultMessage:
                "{m} rules to be imported. {n} rules do not pass the verification. Modify and try again.",
            },
            { m: dataSource.length, n: invalidDataSourceCount },
          )}
        />
      </div>
    );
  } else {
    alertMessage = (
      <div className={style.alert}>
        <Alert
          type="warning"
          display="weak"
          message={intl.formatMessage(
            {
              id: "sg.import.rule.alert.message.partial.import",
              defaultMessage:
                "{m} rules in total. {n} rules failed to be imported. Modify these rules and try again or import only the validated rules.",
            },
            { m: dataSource.length, n: invalidDataSourceCount },
          )}
        />
        <div className={style.checkboxPartialImport}>
          <label className="flex w-fit cursor-pointer items-center text-sm">
            <Checkbox
              checked={allowPartialImport}
              onCheckedChange={(val) => setAllowPartialImport(val === true)}
            />
            <span className="pl-2">
              {intl.formatMessage({
                id: "sg.import.checkbox.partial.import",
                defaultMessage: "Import only the validated rules.",
              })}
            </span>
          </label>
        </div>
      </div>
    );
  }

  return (
    <DialogForm
      title={title}
      widthClassName="w-250"
      form={form}
      visible={visible}
      setVisible={setVisible}
      onCancel={onCancel}
      footer={footerEle}
      alertType="info"
      alertMessage={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "securityGroup.import.securityGroupRule.alertMessage",
            defaultMessage:
              "1. Imported rules are disabled by default with priorities lower than all existing rules.\n2. You can manually reset the priorities and enable these rules after the import.\n3. Considering system compatibility, we recommend that you import a Microsoft Excel file that only be edited by using Microsoft Excel.",
          })}
        </ReactMarkdown>
      }
    >
      <Form form={form}>
        <Form.Item
          name="file"
          label={intl.formatMessage({
            id: "security.group.import.field.rule",
            defaultMessage: "Rule",
          })}
          rules={[isRequired(IIsRequiredType.select)]}
          required
        >
          <Upload.Select
            className="width-400"
            accept=".csv"
            onChange={handleFileChange}
          />
        </Form.Item>
        <Form.Item
          label={intl.formatMessage({
            id: "security.group.import.field.validation.result",
            defaultMessage: "Rule Validation",
          })}
          className={style.validationResultField}
        >
          <ConfigProvider renderEmpty={renderTableEmpty}>
            <Table columns={columns} dataSource={dataSource} />
          </ConfigProvider>
          {alertMessage}
        </Form.Item>
      </Form>
    </DialogForm>
  );
};

export default Action;
