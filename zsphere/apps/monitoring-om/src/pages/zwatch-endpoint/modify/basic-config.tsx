import { gql } from "@apollo/client";
// import SnmpTrapList from "zsv_administration/src/pages/snmp-trap/list";
import { Button, Input, RadioGroup, Text } from "@zstack/design";
import { Form, ListCollect, TextArea } from "@zstack/zsphere-components";
import {
  IIsRequiredType,
  useAction,
  useValidator,
} from "@zstack/zsphere-hooks";
import { EndPointType } from "@zstack/zsphere-types";
import type {
  AtPersonListItem,
  EmailAddress,
  Receiver,
} from "@zstack/zsphere-types/graphql";
import { isEmail } from "@zstack/zsphere-utils";
import type { FormInstance } from "antd/lib/form";
import React, { useCallback } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { getEndpointLocaleOptions } from "../action/schema";
import type { SecuritySettingType } from "../components";
import { SecuritySettingItem } from "../components";
import type { AtPersonType } from "../components/at-person-item";
import {
  AddSmsAtPersonFormItems,
  AtPersonFormItems,
} from "../components/at-person-item";
import FormListWithRequired from "../components/form-list-with-required";
import useEndPointTypeMap from "../hooks/use-end-point-type-map";

import style from "./style.module.less";

const snsSnmpTestConnection = gql`
  mutation snsSnmpTestConnection($input: SNSSnmpTestConnectionInput!) {
    snsSnmpTestConnection(input: $input) {
      actionId
    }
  }
`;

interface AddEmail {
  // email?: string
  emails?: any[];
  platform?: any[];
}

export interface AreaCodePhoneNumber {
  areaCode: string;
  phoneNumber: string;
  remark?: string;
}
interface AddSms {
  atPersonList?: { areaCode: string; phoneNumber: string }[];
  receivers?: AreaCodePhoneNumber[];
}

interface AddHttp {
  url: string;
  username?: string;
  password?: string;
}

interface AddDingTalk {
  url: string;
  object: AtPersonType;
  atPersonList?: { areaCode: string; phoneNumber: string; remark?: string }[];
  securitySetting?: SecuritySettingType;
  secret?: string;
}

interface AddFeiShu {
  object: AtPersonType;
  securitySetting?: SecuritySettingType;
  atPersonList?: { userId: string; remark?: string }[];
  url: string;
  secret?: string;
}

interface AddWeCom {
  object: AtPersonType;
  securitySetting?: SecuritySettingType;
  atPersonList?: { userId: string; remark?: string }[];
  url: string;
}

interface AddMicroTeams {
  url: string;
}

interface AddSnmpTrap {
  trapReceivers?: any[];
}

export interface IValuesByBaseConfig {
  name: string;
  description?: string;
  addEmail?: AddEmail;
  addAliyunSms?: AddSms;
  addHttp?: AddHttp;
  addDingTalk?: AddDingTalk;
  addFeiShu?: AddFeiShu;
  addWeCom?: AddWeCom;
  addMicroTeams?: AddMicroTeams;
  locale?: string;
  type?: string;
  addSnmpTrap?: AddSnmpTrap;
}
interface IProps {
  form: FormInstance;
  init: any;
}
const BasicConfig: React.FC<IProps> = ({ form, init }) => {
  const type = init?.type;
  const intl = useIntl();
  const doAction = useAction();

  const { commonNameRules, commonDescriptionRules, isRequired } =
    useValidator(intl);
  const endPointTypeMap = useEndPointTypeMap({ hasSystem: true });
  // ZSTAC-54399, 钉钉类型表单【对象】切换成【指定成员】时，手机号码默认展示一个输入框
  const handleChangeObject = (objectType: string) => {
    if (objectType === "atPerson") {
      switch (type) {
        case EndPointType.DingTalk:
          form.setFields([
            {
              name: [`add${type}`, "atPersonList"],
              value: [
                {
                  remark: "",
                  areaCode: "86",
                  phoneNumber: "",
                },
              ],
            },
          ]);
          break;
        case EndPointType.FeiShu:
        case EndPointType.WeCom:
          // 表单【对象】切换成【指定成员】时，userID 默认展示一个输入框
          form.setFields([
            {
              name: [`add${type}`, "atPersonList"],
              value: [
                {
                  userId: "",
                  remark: "",
                },
              ],
            },
          ]);
          break;
      }
    }
  };

  const checkSnmpTrap = async () => {
    const values = await form.validateFields();

    doAction({
      mutation: snsSnmpTestConnection,
      payload: { platformUuid: values?.addSnmpTrap?.trapReceivers?.[0]?.uuid },
      name: intl.formatMessage({
        id: "zwatchEndpoint.test.snmpTrap",
        defaultMessage: "Test SNMP Trap Receiver",
      }),
      total: 1,
    });
  };

  const genContent = useCallback((type) => {
    if (type === EndPointType.DingTalk) {
      if (init?.atPersonList?.length > 0) {
        init?.atPersonList.forEach((item: AtPersonListItem, index: number) => {
          const phoneNumber = item.phoneNumber?.replace("+", "").split("-");
          form.setFields([
            {
              name: ["addDingTalk", "atPersonList", index, "areaCode"],
              value: phoneNumber?.[0],
            },
            {
              name: ["addDingTalk", "atPersonList", index, "phoneNumber"],
              value: phoneNumber?.[1],
            },
            {
              name: ["addDingTalk", "atPersonList", index, "remark"],
              value: item.remark,
            },
          ]);
        });
      }
      form.setFields([
        {
          name: ["addDingTalk", "securitySetting"],
          value: init.secret ? "signature" : "none",
        },
      ]);
      if (init.secret) {
        form.setFields([
          { name: ["addDingTalk", "secret"], value: init.secret },
        ]);
      }
      let value;
      if (init?.atAll) {
        value = "atAll";
      } else if (init?.atPersonList?.length) {
        value = "atPerson";
      } else {
        value = "none";
      }
      form.setFields([{ name: ["addDingTalk", "object"], value }]);
      return (
        <>
          <Form.Item
            label={intl.formatMessage({
              id: "address",
              defaultMessage: "Address",
            })}
            icon="info"
            iconTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "zwatch.endpoint.webhook_url_tip",
                  defaultMessage: `### Address
Enter the Webhook address generated on the endpoint platform.`,
                })}
              </ReactMarkdown>
            }
          >
            <div className={style.webhookUrl}>
              <Text>{init?.url}</Text>
            </div>
          </Form.Item>
          <SecuritySettingItem type={EndPointType.DingTalk} form={form} />
          <AtPersonFormItems
            form={form}
            parentFieldName={`add${type}`}
            onChangeObject={handleChangeObject}
            supportAtType="phoneNumber"
          />
        </>
      );
    }
    if (type === EndPointType.FeiShu) {
      if (init?.atPersonList?.length > 0) {
        init.atPersonList.forEach((item: AtPersonListItem, index: number) => {
          form.setFields([
            {
              name: ["addFeiShu", "atPersonList", index, "userId"],
              value: item.userId,
            },
            {
              name: ["addFeiShu", "atPersonList", index, "remark"],
              value: item.remark,
            },
          ]);
        });
      }
      form.setFields([
        {
          name: ["addFeiShu", "securitySetting"],
          value: init.secret ? "signature" : "none",
        },
      ]);
      if (init.secret) {
        form.setFields([{ name: ["addFeiShu", "secret"], value: init.secret }]);
      }
      let value;
      if (init?.atAll) {
        value = "atAll";
      } else if (init?.atPersonList?.length) {
        value = "atPerson";
      } else {
        value = "none";
      }
      form.setFields([{ name: ["addFeiShu", "object"], value }]);
      return (
        <>
          <Form.Item
            label={intl.formatMessage({
              id: "address",
              defaultMessage: "Address",
            })}
            icon="info"
            iconTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "zwatch.endpoint.webhook_url_tip",
                  defaultMessage: `### Address
Enter the Webhook address generated on the endpoint platform.`,
                })}
              </ReactMarkdown>
            }
          >
            <div className={style.webhookUrl}>
              <Text>{init?.url}</Text>
            </div>
          </Form.Item>
          <SecuritySettingItem type={EndPointType.FeiShu} form={form} />
          <AtPersonFormItems
            form={form}
            parentFieldName={`add${type}`}
            onChangeObject={handleChangeObject}
            supportAtType="userId"
          />
        </>
      );
    }
    if (type === EndPointType.WeCom) {
      if (init?.atPersonList?.length > 0) {
        init?.atPersonList.forEach((item: AtPersonListItem, index: number) => {
          form.setFields([
            {
              name: ["addWeCom", "atPersonList", index, "userId"],
              value: item.userId,
            },
            {
              name: ["addWeCom", "atPersonList", index, "remark"],
              value: item.remark,
            },
          ]);
        });
      }
      let value;
      if (init?.atAll) {
        value = "atAll";
      } else if (init?.atPersonList?.length) {
        value = "atPerson";
      } else {
        value = "none";
      }
      form.setFields([{ name: ["addWeCom", "object"], value }]);
      return (
        <>
          <Form.Item
            label={intl.formatMessage({
              id: "address",
              defaultMessage: "Address",
            })}
            icon="info"
            iconTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "zwatch.endpoint.webhook_url_tip",
                  defaultMessage: `### Address
Enter the Webhook address generated on the endpoint platform.`,
                })}
              </ReactMarkdown>
            }
          >
            <div className={style.webhookUrl}>
              <Text>{init?.url}</Text>
            </div>
          </Form.Item>
          <AtPersonFormItems
            form={form}
            parentFieldName={`add${type}`}
            onChangeObject={handleChangeObject}
            supportAtType="userId"
          />
        </>
      );
    }
    if (type === EndPointType.Email) {
      const canAddEmail = () => {
        const { emails } = form.getFieldValue("addEmail") || [];
        return !emails?.length || emails?.length < 100;
      };
      form.setFields([
        {
          name: ["addEmail", "emails"],
          value: init.emailAddresses.map(
            (item: EmailAddress) => item.emailAddress,
          ),
        },
      ]);
      return (
        <div className={style["email"]}>
          <Form.Item
            label={intl.formatMessage({
              id: "emailServer",
              defaultMessage: "Email Server",
            })}
          >
            <div className={style.webhookUrl}>
              <Text>{init?.platform?.name}</Text>
            </div>
          </Form.Item>
          <Form.Item
            name="emails"
            label={intl.formatMessage({
              id: "emailAddress",
              defaultMessage: "Email Address",
            })}
            required
          >
            <FormListWithRequired
              form={form}
              name={["addEmail", "emails"]}
              required
              message={intl.formatMessage({
                id: "zwatchEndpoint.field.add.emailAddress.validator.required",
                defaultMessage: "This field is required.",
              })}
            >
              {(fields, { add, remove }) => {
                return (
                  <ListCollect
                    style={{ display: "contents" }}
                    addable={canAddEmail()}
                    label={intl.formatMessage(
                      {
                        id: "add.emailAddress.{count}/100)",
                        defaultMessage: "Add Email Address ({count}/100)",
                      },
                      {
                        count:
                          form.getFieldValue("addEmail")?.emails?.length || 0,
                      },
                    )}
                    dataSource={fields}
                    add={() => add()}
                    remove={remove}
                    layout="block"
                  >
                    {(field) => (
                      <Form.Item
                        {...field}
                        style={{ marginBottom: "5px" }}
                        validateTrigger="onBlur"
                        rules={[
                          {
                            validator(rule, value: string) {
                              if (!value) {
                                return Promise.reject(
                                  intl.formatMessage({
                                    id: "zwatchEndpoint.field.emailAddress.validator.required",
                                    defaultMessage: "This field is required.",
                                  }),
                                );
                              }
                              if (!isEmail(value)) {
                                return Promise.reject(
                                  intl.formatMessage({
                                    id: "zwatchEndpoint.field.emailAddress.validator.format",
                                    defaultMessage: "Invalid email address.",
                                  }),
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        <Input className={style["width-400"]} />
                      </Form.Item>
                    )}
                  </ListCollect>
                );
              }}
            </FormListWithRequired>
          </Form.Item>
        </div>
      );
    }
    if (type === EndPointType.AliyunSms) {
      init.receivers.forEach((item: Receiver, index: number) => {
        const phoneNumber = item.phoneNumber?.replace("+", "").split("-");
        form.setFields([
          {
            name: ["addAliyunSms", "atPersonList", index, "areaCode"],
            value: phoneNumber?.[0],
          },
          {
            name: ["addAliyunSms", "atPersonList", index, "phoneNumber"],
            value: phoneNumber?.[1],
          },
        ]);
      });
      return (
        <>
          <Form.Item
            label={intl.formatMessage({
              id: "accesskey.key",
              defaultMessage: "AccessKey ID ",
            })}
          >
            <div className={style.webhookUrl}>
              <Text>{init?.accessKey?.akey}</Text>
            </div>
          </Form.Item>

          <AddSmsAtPersonFormItems form={form} />
        </>
      );
    }
    if ([EndPointType.MicrosoftTeams, EndPointType.HTTP].includes(type)) {
      return (
        <Form.Item
          label={intl.formatMessage({
            id: "address",
            defaultMessage: "Address",
          })}
        >
          <div className={style.webhookUrl}>
            <Text>{init?.url}</Text>
          </div>
        </Form.Item>
      );
    }

    if (type === EndPointType.SNMP) {
      form.setFields([
        { name: ["addSnmpTrap", "trapReceivers"], value: [init?.platform] },
      ]);

      return (
        <Form.Item
          label={intl.formatMessage({
            id: "snmp.trap",
            defaultMessage: "SNMP Trap Receiver",
          })}
          required
        >
          <div className="flex items-center gap-2" wrap={false}>
            <Form.Item
              noStyle
              name={["addSnmpTrap", "trapReceivers"]}
              rules={[
                isRequired(
                  IIsRequiredType.select,
                  intl.formatMessage({
                    id: "snmp.trap.receiver",
                    defaultMessage: "SNMP Trap Receiver",
                  }),
                ),
              ]}
            >
              {/* <ModalSelect
                title={intl.formatMessage({
                  id: "select.snmpTrap",
                  defaultMessage: "选择SNPM Trap接收器",
                })}
                selectType="radio"
                className={style["width-400"]}
              >
                <SnmpTrapList view="select.zwatchEndpoint" />
              </ModalSelect> */}
            </Form.Item>
            <Form.Item
              noStyle
              shouldUpdate={(prev, curr) =>
                prev.addSnmpTrap?.trapReceivers !==
                curr.addSnmpTrap?.trapReceivers
              }
            >
              {({ getFieldValue }) => {
                return (
                  <Button
                    variant="link"
                    onClick={checkSnmpTrap}
                    style={{ padding: 0 }}
                    disabled={
                      !getFieldValue("addSnmpTrap")?.trapReceivers?.length
                    }
                  >
                    {intl.formatMessage({ id: "test", defaultMessage: "Test" })}
                  </Button>
                );
              }}
            </Form.Item>
          </div>
        </Form.Item>
      );
    }
  }, []);

  return (
    <>
      <Form.Item
        name="name"
        label={intl.formatMessage({
          id: "name",
          defaultMessage: "Name",
        })}
        validateTrigger="onBlur"
        required
        rules={commonNameRules}
      >
        <Input className={style["width-400"]} />
      </Form.Item>
      <Form.Item
        name="description"
        label={intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        })}
        validateTrigger="onBlur"
        rules={commonDescriptionRules}
      >
        <TextArea
          rows={3}
          className={style["width-400"]}
          isShowLimit
          limit={256}
        />
      </Form.Item>
      <Form.Item
        label={intl.formatMessage({
          id: "type",
          defaultMessage: "Type",
        })}
        name="type"
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "zwatch.endpoint.type_selection.tooltip",
              defaultMessage: `### Type
1. Supports 8 endpoint types:

    a. Email: Sends alarm messages as emails to specified email addresses. To create an endpoint of this type, add an email server to the Cloud and ensure the server availability in advance.

    b. SMS: Sends alarm messages as text messages to specified phone numbers. To create an endpoint of this type, create an SMS message template and set it as the default template in advance. Text messages are sent in the format defined by the template.

    c. DingTalk/Lark/WeCom: Sends alarm messages to DingTalk/Lark/WeCom groups via group robots.

    d. HTTP Application: Sends alarm messages to specified HTTP addresses through the HTTP Post method.

    e. Microsoft Teams: Sends alarm messages to Microsoft Teams groups via Webhook.

    f. SNMP Trap Receiver: Sends alarm messages as trap messages to specified SNMP Trap receivers. To create an endpoint of this type, enable SNMP Management and add an SNMP Trap receiver to the Cloud in advance.

2. Before you create an endpoint, make sure that the 3rd-party platform can communicate with the Cloud, including with the IP addresses of the Cloud management nodes, the Cloud VIP, and the UI server port.

3. You can create message templates in advance to make alarm messages sent to endpoints displayed in a unified format. If you do not customize a template, a system template is used by default. SMS endpoints are exceptions for you must create a message template manually in advance.`,
            })}
          </ReactMarkdown>
        }
      >
        {endPointTypeMap.get(type as EndPointType)}
      </Form.Item>
      {genContent(type)}
      {[
        EndPointType.Email,
        EndPointType.DingTalk,
        EndPointType.MicrosoftTeams,
        EndPointType.WeCom,
        EndPointType.FeiShu,
      ].includes(type as any) && (
        <Form.Item
          name="locale"
          label={intl.formatMessage({
            id: "endpointLocale",
            defaultMessage: "Message Language",
          })}
          rules={[
            {
              validator(rule, value: string) {
                if (!value) {
                  return Promise.reject(
                    intl.formatMessage({
                      id: "zwatchEndpoint.field.endpointLocale.validator.required",
                      defaultMessage: "Select a message language.",
                    }),
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <RadioGroup options={getEndpointLocaleOptions(intl)} />
        </Form.Item>
      )}
    </>
  );
};

export default BasicConfig;
