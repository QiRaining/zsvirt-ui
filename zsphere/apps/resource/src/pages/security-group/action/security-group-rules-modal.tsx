import { RadioGroup } from "@zstack/design";
import { Form, Input, Select, TextArea } from "@zstack/zsphere-components";
import { ModalSelect, Switch } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useValidator, IIsRequiredType } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps, Item } from "@zstack/zsphere-types";
import {
  SecurityGroupRuleType,
  SecurityGroupRulePolicy,
  SecurityGroupRuleProtocolType,
  SecurityGroupRuleState,
} from "@zstack/zsphere-types";
import type { AddRuleParam } from "@zstack/zsphere-types/graphql";
import {
  isEmpty as _isEmpty,
  keys as _keys,
  isBoolean as _isBoolean,
} from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import SecurityGroupList from "../list";
import {
  useSecurityGroupRuleType,
  useSecurityGroupRulePolicy,
  useValidIpOrPort,
} from "../utils";

import style from "./style.module.less";

export interface IProps extends IActionWrapperProps<
  Partial<AddRuleParam & Item>
> {
  setRule: Function;
  type: SecurityGroupRuleType;
  maxPriority: number;
  disableEditPriority?: boolean;
  disableEditIpVersion?: boolean;
  remoteSecurityGroupSelectType?: "checkbox" | "radio";
}

const initialValues = {
  action: SecurityGroupRulePolicy.ACCEPT,
  ipVersion: 4,
  protocol: SecurityGroupRuleProtocolType.TCP,
  authorized: 0,
  state: true,
};

const formItemMarginLeftStyle = { marginLeft: "168px" } as const;

const SecurityGroupRuleModal: React.FC<IProps> = ({
  visible,
  setVisible,
  type,
  maxPriority,
  setRule,
  selectedList,
  source,
  disableEditPriority,
  disableEditIpVersion,
  _remoteSecurityGroupSelectType = "checkbox",
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();

  const { isRequired, lengthRange } = useValidator(intl);

  const currentRule = React.useMemo(() => selectedList?.[0], [selectedList]);

  const { securityGroupRuleTypeMap } = useSecurityGroupRuleType();
  const { securityGroupRulePolicyMap } = useSecurityGroupRulePolicy();

  const { checkIp, checkIpLength, checkPort, checkPortLength, checkPortRange } =
    useValidIpOrPort();

  const isAdd = React.useMemo(() => _isEmpty(selectedList), [selectedList]);

  const title = React.useMemo(() => {
    if (type === SecurityGroupRuleType.Ingress) {
      return isAdd
        ? intl.formatMessage({
            id: "securityGroup.rules.modal.add.ingress.rule.title",
            defaultMessage: "Add Ingress Rule",
          })
        : intl.formatMessage({
            id: "securityGroupRule.action.revise.ingress.rule.title",
            defaultMessage: "Modify Ingress Rule",
          });
    }

    return isAdd
      ? intl.formatMessage({
          id: "securityGroup.rules.modal.add.egress.rule.title",
          defaultMessage: "Add Egress Rule",
        })
      : intl.formatMessage({
          id: "securityGroupRule.action.revise.egress.rule.title",
          defaultMessage: "Modify Egress Rule",
        });
  }, [isAdd, type, intl]);

  const { priorityOptions, defaultPriority } = React.useMemo(() => {
    const options = [];

    const _maxPriority = isAdd ? maxPriority + 1 : maxPriority;

    for (let i = 1; i <= _maxPriority; i++) {
      options.push({
        label: i.toString(),
        value: i,
      });
    }

    return {
      priorityOptions: options,
      defaultPriority: currentRule?.priority ?? _maxPriority,
    };
  }, [maxPriority, currentRule, isAdd]);

  React.useEffect(() => {
    if (currentRule && visible) {
      const rule: any = {
        ...currentRule,
        srcPortRange: currentRule.srcPortRange ?? currentRule.dstPortRange, // 暂时后端没有启用这个字段，不管出入方向都是使用dstPortRange，在hooks种处理
        authorized: currentRule.remoteSecurityGroupUuid ? 1 : 0,
        remoteSecurityGroups: currentRule.remoteSecurityGroupUuid
          ? [currentRule.remoteSecurityGroup]
          : undefined,
        state: _isBoolean(currentRule.state)
          ? currentRule.state
          : currentRule.state === SecurityGroupRuleState.Enabled,
      };

      form.setFields(
        _keys(rule).map((key) => ({
          name: key,
          value: rule[key],
        })),
      );
      return;
    }

    const _initialValues: any = {
      ...initialValues,
      type,
      priority: defaultPriority,
    };
    form.setFields(
      _keys(_initialValues).map((key) => ({
        name: key,
        value: _initialValues[key],
      })),
    );
  }, [currentRule, form, visible, type, defaultPriority]);

  React.useEffect(() => {
    if (!visible) {
      form.resetFields();
    }
  }, [visible]);

  const showToolTipProps = (isIp: boolean) => ({
    title: isIp ? (
      <ReactMarkdown>
        {intl.formatMessage({
          id: "ruleTemplate.field.ip.hover",
          defaultMessage: `1. You can enter a static IP address, IP range, or CIDR block. An IP range is formatted by using a hyphen (-), for example, 192.168.0.1-192.168.0.100.
2. If you enter multiple CIDR blocks, or enter a mixture of CIDR blocks and other IP formats, the netmasks of the CIDR blocks must be 24. If you enter one CIDR block, the netmask is not limited.
3. You can enter a maximum of ten entries, with each entry separated by a comma (,).`,
        })}
      </ReactMarkdown>
    ) : (
      <ReactMarkdown>
        {intl.formatMessage({
          id: "ruleTemplate.field.port.hover",
          defaultMessage: `1. You can enter ports or port ranges. A port range is formatted by using a hyphen (-), for example, 1-100.
2. You can enter a maximum of ten entries, with each entry separated by a comma (,).`,
        })}
      </ReactMarkdown>
    ),
  });

  const onOk = async (data: any) => {
    setRule(data);
  };
  return (
    <DialogForm
      form={form}
      title={title}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      resourceName={source?.name}
    >
      <Form form={form}>
        <Form.Item noStyle>
          <Form.Item
            label={intl.formatMessage({ id: "type" })}
            icon="info"
            iconTooltip={
              <ReactMarkdown>
                {type === SecurityGroupRuleType.Ingress
                  ? intl.formatMessage({
                      id: "securityGroup.rule.field.type.ingress.iconTooltip",
                      defaultMessage: "ingress",
                    })
                  : intl.formatMessage({
                      id: "securityGroup.rule.field.type.egress.iconTooltip",
                      defaultMessage: "egress",
                    })}
              </ReactMarkdown>
            }
          >
            {securityGroupRuleTypeMap.get(type)}
          </Form.Item>
          <Form.Item name="type" hidden>
            <Input />
          </Form.Item>
        </Form.Item>
        <Form.Item
          label={intl.formatMessage({
            id: "securityGroup.rule.field.priority",
            defaultMessage: "Priority",
          })}
          name="priority"
          icon="info"
          iconTooltip={
            <ReactMarkdown>
              {intl.formatMessage({
                id: "securityGroup.rule.field.priority.info.tooltip",
                defaultMessage: "tooltip",
              })}
            </ReactMarkdown>
          }
        >
          <Select
            width="l"
            options={priorityOptions}
            disabled={disableEditPriority}
          />
        </Form.Item>
        <Form.Item
          label={intl.formatMessage({
            id: "securityGroup.rule.field.action",
            defaultMessage: "Policy",
          })}
          name="action"
        >
          <RadioGroup
            options={[
              {
                value: SecurityGroupRulePolicy.ACCEPT,
                label: securityGroupRulePolicyMap.get(
                  SecurityGroupRulePolicy.ACCEPT,
                ),
              },
              {
                value: SecurityGroupRulePolicy.DROP,
                label: securityGroupRulePolicyMap.get(
                  SecurityGroupRulePolicy.DROP,
                ),
              },
            ]}
          />
        </Form.Item>
        <Form.Item
          label={intl.formatMessage({
            id: "ipAddressType",
            defaultMessage: "IP Address Type",
          })}
          name="ipVersion"
        >
          <RadioGroup
            options={[
              {
                value: 4,
                label: intl.formatMessage({
                  id: "ipv4",
                  defaultMessage: "IPv4",
                }),
              },
              {
                value: 6,
                label: intl.formatMessage({
                  id: "ipv6",
                  defaultMessage: "IPv6",
                }),
              },
            ]}
            disabled={disableEditIpVersion}
          />
        </Form.Item>
        <Form.Item
          label={intl.formatMessage({
            id: "protocol",
            defaultMessage: "Protocol",
          })}
          name="protocol"
          //           icon="info"
          //           iconTooltip={
          //             <ReactMarkdown>
          //               {intl.formatMessage({
          //                 id: 'securityGroup.field.protocol.tooltip',
          //                 defaultMessage: `
          // ### 协议
          // 网络协议类型，支持ALL、TCP、UDP、ICMP协议，ALL协议用于设置组内互通。`
          //               })}
          //             </ReactMarkdown>
          //           }
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: "securityGroup.field.protocol.validator.required",
                defaultMessage: "Select a protocol.",
              }),
            },
          ]}
          required
        >
          <Select width="l">
            <Select.Option value={SecurityGroupRuleProtocolType.ALL}>
              ALL
            </Select.Option>
            <Select.Option value={SecurityGroupRuleProtocolType.TCP}>
              TCP
            </Select.Option>
            <Select.Option value={SecurityGroupRuleProtocolType.UDP}>
              UDP
            </Select.Option>
            <Select.Option value={SecurityGroupRuleProtocolType.ICMP}>
              ICMP
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prev, curr) => prev.protocol !== curr.protocol}
        >
          {({ getFieldValue }) => {
            const protocol = getFieldValue("protocol");

            return [
              SecurityGroupRuleProtocolType.TCP,
              SecurityGroupRuleProtocolType.UDP,
            ].includes(protocol) ? (
              <Form.Item
                label={intl.formatMessage({
                  id: "port",
                  defaultMessage: "Port",
                })}
                name={
                  type === SecurityGroupRuleType.Ingress
                    ? "srcPortRange"
                    : "dstPortRange"
                }
                required
                validateFirst
                validateTrigger="onBlur"
                rules={[
                  isRequired(IIsRequiredType.input),
                  { validator: (_: any, value: string) => checkPort(value) },
                  {
                    validator: (_: any, value: string) => checkPortRange(value),
                  },
                  {
                    validator: (_: any, value: string) =>
                      checkPortLength(value),
                  },
                ]}
                tooltip={showToolTipProps(false)}
                icon="info"
                iconTooltip={
                  <ReactMarkdown>
                    {intl.formatMessage({
                      id: "securityGroup.field.portRange.tooltip",
                      defaultMessage: `### Port
With the protocol type as TCP or UDP, you need to set source or target port(s).

1. You can set a port range with a hyphen - connecting the start port and the end port.
2. You can set more than one (up to 10) port and port range, with each port (range) separated by a comma (,).
3. Example: 885-886,889`,
                    })}
                  </ReactMarkdown>
                }
              >
                <TextArea
                  className={style["width-320"]}
                  limit={10}
                  lengthFormat={(val) => {
                    const portList = String(val).split(",");
                    let { length } = portList;
                    if (portList.some((p) => p.includes("-"))) {
                      length += portList.filter((p) => p.includes("-")).length;
                    }
                    return length;
                  }}
                  autoSize
                  isShowLimit
                  // lengthFormat={countPortLength}
                />
              </Form.Item>
            ) : null;
          }}
        </Form.Item>

        <Form.Item
          label={
            type === SecurityGroupRuleType.Ingress
              ? intl.formatMessage({
                  id: "securityGroup.rule.field.authorized.src",
                  defaultMessage: "Source",
                })
              : intl.formatMessage({
                  id: "securityGroup.rule.field.authorized.dst",
                  defaultMessage: "Destination",
                })
          }
          name="authorized"
          // valuePropName="checked"
          // required
          // formItemHeigth="mini"
          icon="info"
          iconTooltip={
            <ReactMarkdown>
              {type === SecurityGroupRuleType.Ingress
                ? intl.formatMessage({
                    id: "securityGroup.field.authorized.src.tooltip",
                    defaultMessage: `### Source

Specify IP addresses or a security group as the target objects for ingress rules:

1. IP/CIDR: Allows/denies access to the NICs within the security group from the specified IP addresses.

    - To add an IP range, use the format "Start IP-End IP."
    - To add multiple IP addresses (or ranges), separate them with commas. For example: 192.168.24.10,192.168.24.12,192.168.24.62-192.168.24.70
    - Do not use 0.0.0.0/0 or ::/0

2. Security Group: Allows/denies access to the NICs in the current group from NICs within another security group.`,
                  })
                : intl.formatMessage({
                    id: "securityGroup.field.authorized.dst.tooltip",
                    defaultMessage: `### Destination

Specify IP addresses or a security group as the target objects for egress rules:

1. IP/CIDR: Allows/denies access to the NICs within the security group from the specified IP addresses.

    - To add an IP range, use the format "Start IP-End IP."
    - To add multiple IP addresses (or ranges), separate them with commas. For example: 192.168.24.10,192.168.24.12,192.168.24.62-192.168.24.70
    - Do not use 0.0.0.0/0 or ::/0

2. Security Group: Allow/reject the NICs in the current group to access NICs in another security group.`,
                  })}
            </ReactMarkdown>
          }
        >
          <RadioGroup
            options={[
              {
                value: 0,
                label: intl.formatMessage({
                  id: "securityGroup.rule.field.authorized.ip",
                  defaultMessage: "IP/CIDR",
                }),
              },
              {
                value: 1,
                label: intl.formatMessage({
                  id: "securityGroup.rule.field.authorized.sg",
                  defaultMessage: "Security Group",
                }),
              },
            ]}
          />
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prev, curr) =>
            prev.authorized !== curr.authorized ||
            prev.ipVersion !== curr.ipVersion
          }
        >
          {({ getFieldValue }) => {
            const authorized = getFieldValue("authorized");
            const ipVersion = getFieldValue("ipVersion");
            if (authorized === 0) {
              return (
                <Form.Item
                  style={formItemMarginLeftStyle}
                  name={
                    type === SecurityGroupRuleType.Ingress
                      ? "srcIpRange"
                      : "dstIpRange"
                  }
                  validateFirst
                  validateTrigger="onBlur"
                  rules={[
                    // isRequired(IIsRequiredType.input),
                    {
                      validator: (_: any, value: string) =>
                        checkIp(value, ipVersion),
                    },
                    {
                      validator: (_: any, value: string) =>
                        checkIpLength(value),
                    },
                  ]}
                  tooltip={showToolTipProps(true)}
                >
                  <TextArea
                    className={style["width-320"]}
                    limit={10}
                    lengthFormat={(val) => String(val).split(",").length}
                    autoSize
                    isShowLimit
                  />
                </Form.Item>
              );
            }

            if (authorized === 1) {
              return (
                <Form.Item
                  style={formItemMarginLeftStyle}
                  name="remoteSecurityGroups"
                  // rules={[isRequired(IIsRequiredType.select)]}
                >
                  <ModalSelect
                    className={style["width-320"]}
                    title={
                      type === SecurityGroupRuleType.Ingress
                        ? intl.formatMessage({
                            id: "add.remoteSecurityGroup",
                            defaultMessage: "",
                          })
                        : intl.formatMessage({
                            id: "add.destination.rule",
                            defaultMessage: "Add Destination Security Group",
                          })
                    }
                    hideHelper
                    // selectType={remoteSecurityGroupSelectType}
                    selectType="radio"
                  >
                    <SecurityGroupList view="select" />
                  </ModalSelect>
                </Form.Item>
              );
            }

            return null;
          }}
        </Form.Item>
        <Form.Item
          label={intl.formatMessage({
            id: "enable.status",
            defaultMessage: "State",
          })}
          name="state"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        <Form.Item
          label={intl.formatMessage({
            id: "description",
            defaultMessage: "Description",
          })}
          name="description"
          rules={[lengthRange(0, 255)]}
        >
          <TextArea
            isShowLimit
            rows={3}
            className={style["width-320"]}
            maxLength={255}
          />
        </Form.Item>
      </Form>
    </DialogForm>
  );
};

export default SecurityGroupRuleModal;
