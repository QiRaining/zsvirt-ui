import { gql } from "@apollo/client";
import { Button, RadioGroup } from "@zstack/design";
import { Icon } from "@zstack/icon";
import {
  Form,
  ListCollect,
  ModalSelect,
  Select,
  TextArea,
} from "@zstack/zsphere-components";
import {
  IIsRequiredType,
  useAction,
  useValidator,
} from "@zstack/zsphere-hooks";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { EndPointType, Op } from "@zstack/zsphere-types";
import { isEmail, isUrl } from "@zstack/zsphere-utils";
import { Input } from "antd";
import type { FormInstance } from "antd/lib/form";
import React, { useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import EmailServerList from "zsv_shared/email-server/base-list";
import SnmpTrapList from "zsv_shared/snmp-trap/base-list";

import { getEndpointLocaleOptions } from "../action/schema";
import type { AtPersonType } from "../components/at-person-item";
import {
  AddSmsAtPersonFormItems,
  AtPersonFormItems,
} from "../components/at-person-item";
import FormListWithRequired from "../components/form-list-with-required";
import type { SecuritySettingType } from "../components/security-setting-item";
import { SecuritySettingItem } from "../components/security-setting-item";
import { TestConnectFormItems } from "../components/test-connect-item";
import useEndPointTypeMap from "../hooks/use-end-point-type-map";

import style from "./style.module.less";

const snsSnmpTestConnection = gql`
  mutation snsSnmpTestConnection($input: SNSSnmpTestConnectionInput!) {
    snsSnmpTestConnection(input: $input) {
      actionId
    }
  }
`;

const snsEmailTestConnection = gql`
  mutation snsEmailTestConnection($input: SNSEmailTestConnectionInput!) {
    snsEmailTestConnection(input: $input) {
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
}
interface AddSms {
  accessKey: string;
  secret: string;
  atPersonList: { areaCode: string; phoneNumber: string; remark?: string }[];
}

interface AddHttp {
  url: string;
  username?: string;
  password?: string;
}

interface AddDingTalk {
  url: string;
  atAll?: string;
  object: AtPersonType;
  atPersonList?: { areaCode: string; phoneNumber: string; remark?: string }[];
  secret?: string;
}

interface AddMicroTeams {
  url: string;
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
  addMicroTeams?: AddMicroTeams;
  addFeiShu?: AddFeiShu;
  addWeCom?: AddWeCom;
  addSnmpTrap?: AddSnmpTrap;
  locale?: string;
  type?: string;
}
interface IProps {
  form: FormInstance;
  setCanSubmit?: React.Dispatch<React.SetStateAction<boolean>>;
}
const BasicConfig: React.FC<IProps> = ({ form, setCanSubmit }) => {
  const { systemView } = usePlatformStore();
  const isBasicLicense = false;
  const intl = useIntl();
  const { commonNameRules, commonDescriptionRules, isRequired } =
    useValidator(intl);
  const doAction = useAction();
  const emailServerHelpRef = useRef<HTMLDivElement>(null);
  const snmpTrapHelpRef = useRef<HTMLDivElement>(null);
  const endPointTypeMap = useEndPointTypeMap({ hasSystem: false });

  const [currentEndpointType, setCurrentEndpointType] = useState(
    EndPointType.Email,
  );
  const [canTest, setCanTest] = useState(false);
  const emailTableListView = useMemo(() => {
    return systemView === "Admin"
      ? "select.virtualization.endpoint.create"
      : "select.virtualization.endpoint.create.normal";
  }, [systemView]);

  // 判断是否可以继续添加下一个邮箱地址
  const canAddEmail = () => {
    const { emails } = form.getFieldValue("addEmail") || [];
    return !emails?.length || emails?.length < 100;
  };

  // 发送测试消息
  const handleSendTestEmail = () => {
    const addEmail = form.getFieldValue("addEmail");
    const platformUuid = addEmail?.platform?.[0]?.uuid;
    const emails = (addEmail?.emails || []).filter(Boolean);
    if (!platformUuid || !emails.length) {
      return;
    }
    doAction({
      mutation: snsEmailTestConnection,
      payload: { platformUuid, emails },
      name: intl.formatMessage({
        id: "zwatchEndpoint.test.emailServer",
        defaultMessage: "Test Email Server",
      }),
      total: 1,
      onFinish: (result) => {
        if (result.fail === 0 && result.exception === 0) {
          setCanSubmit?.(true);
        }
      },
    });
  };

  // 测试snmpTrap
  const checkSnmpTrap = () => {
    doAction({
      mutation: snsSnmpTestConnection,
      payload: {
        platformUuid:
          form.getFieldValue("addSnmpTrap")?.trapReceivers?.[0]?.uuid,
      },
      name: intl.formatMessage({
        id: "zwatchEndpoint.test.snmpTrap",
        defaultMessage: "Test SNMP Trap Receiver",
      }),
      total: 1,
    });
  };

  // ZSTAC-54399, 钉钉类型表单【对象】切换成【指定成员】时，手机号码默认展示一个输入框
  const handleChangeObject = (type: string) => {
    if (type === "atPerson") {
      switch (currentEndpointType) {
        case EndPointType.DingTalk:
          form.setFields([
            {
              name: [`add${currentEndpointType}`, "atPersonList"],
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
              name: [`add${currentEndpointType}`, "atPersonList"],
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

  const handelTestConnectionChange = (status: "success" | "failed") => {
    if (status === "success") {
      setCanSubmit?.(true);
    } else {
      setCanSubmit?.(false);
    }
  };

  const handleTypeChange = (type: EndPointType) => {
    // 这些类型支持测试连通性，没有联通前无法创建通知对象
    if (
      [
        EndPointType.DingTalk,
        EndPointType.FeiShu,
        EndPointType.WeCom,
        EndPointType.MicrosoftTeams,
        EndPointType.Email,
      ].includes(type)
    ) {
      setCanSubmit?.(false);
    } else {
      setCanSubmit?.(true);
    }

    //切换到短信时赋初始值
    if (type === EndPointType.AliyunSms) {
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
    }

    setCurrentEndpointType(type);
  };

  const endPointTypeOptions = useMemo(
    () =>
      Array.from(endPointTypeMap).map(([key, value]) => (
        <Select.Option value={key} key={key}>
          {value}
        </Select.Option>
      )),
    [endPointTypeMap],
  );

  return (
    <div className={style["basic-config"]}>
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
            {isBasicLicense
              ? intl.formatMessage({
                  id: "zwatch.endpoint.type.select.tooltip.basic",
                  defaultMessage: `### Type
1. Supports 3 types of endpoint:
  - Email: Sends alarm messages as emails to specified email addresses. To create an endpoint of this type, add an email server to the platform and ensure the server availability in advance.
  - SMS: Sends alarm messages as text messages to specified phone numbers. Set up an SMS message template as default beforehand. SMS alerts will be sent according to the specified template format.
  - HTTP Application: Sends alarm as HTTP POST messages to specified Webhook addresses.
2. Before you add an endpoint to the platform, make sure that the endpoint can communicate with the platform, including with the MN IP, VIP, and UI server port.
3. You can create message templates to make alarm messages sent to endpoints in a unified format. If you do not customize a template, a system template is used by default.`,
                })
              : intl.formatMessage({
                  id: "zwatch.endpoint.type.select.tooltip.advanced",
                  defaultMessage: `### Type
1. Supports 8 types of endpoint:
  - Email: Sends alarm messages as emails to specified email addresses. To create an endpoint of this type, add an email server to the platform and ensure the server availability in advance.
  - DingTalk/Lark/WeCom: Sends alarm messages to DingTalk/Lark/WeCom groups via group robots.
  - SMS: Sends alarm messages as text messages to specified phone numbers. Set up an SMS message template as default beforehand. SMS alerts will be sent according to the specified template format.
  - HTTP Application: Sends alarm as HTTP POST messages to specified Webhook addresses.
  - Microsoft Teams: Sends alarm messages to Microsoft Teams groups via the Webhook provided by Microsoft Teams.
  - SNMP Trap Receiver: Sends alarm as trap messages to specified SNMP Trap receivers. To create an SNMP endpoint, enable SNMP Management and add an SNMP Trap receiver to the platform in advance.
2. Before you add an endpoint to the platform, make sure that the endpoint can communicate with the platform, including with the MN IP, VIP, and UI server port.
3. You can create message templates to make alarm messages sent to endpoints in a unified format. If you do not customize a template, a system template is used by default.`,
                })}
          </ReactMarkdown>
        }
      >
        <Select width="s" onChange={handleTypeChange}>
          {endPointTypeOptions}
        </Select>
      </Form.Item>

      {currentEndpointType === EndPointType.AliyunSms ? (
        <div className={style.caption}>
          {/* <Icon type="info-fill" /> */}
          {intl.formatMessage({
            id: "zwatchEndpoint.field.name.tips.info",
            defaultMessage: "Make sure that an SMS alarm message template is created and set as the defult template.",
          })}
        </div>
      ) : (
        ""
      )}
      {currentEndpointType === EndPointType.Email ? (
        <>
          <Form.Item
            label={intl.formatMessage({
              id: "emailServer",
              defaultMessage: "Email Server",
            })}
            labelAlign="left"
            required
          >
            <div className={style.selectEmailServer} ref={emailServerHelpRef}>
              <Form.Item
                noStyle
                name={["addEmail", "platform"]}
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({
                      id: "zwatchEndpoint.field.emailServer.validator.required",
                      defaultMessage: "Select Email Server",
                    }),
                  },
                ]}
                hideRequiredMessage
              >
                <ModalSelect
                  className={style.emailSelect}
                  title={intl.formatMessage({
                    id: "select.emailServer",
                    defaultMessage: "Select Email Server",
                  })}
                  selectType="radio"
                  getHelperContainer={() =>
                    emailServerHelpRef.current?.parentElement
                  }
                >
                  <EmailServerList
                    view={emailTableListView}
                    defaultQuery={{
                      conditions: [
                        {
                          key: "state",
                          op: Op.eq,
                          value: "Enabled",
                        },
                      ],
                    }}
                  />
                </ModalSelect>
              </Form.Item>
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
            <div className="flex">
              <div className="flex flex-col">
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
                        className={style["email-address"]}
                        label={intl.formatMessage(
                          {
                            id: "add.emailAddress.{count}/100)",
                            defaultMessage: "Add Email Address ({count}/100)",
                          },
                          {
                            count:
                              form.getFieldValue("addEmail")?.emails?.length ||
                              0,
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
              </div>
              <div className="mt-[5px] ml-2">
                <Button size="sm" variant="link" onClick={handleSendTestEmail}>
                  {intl.formatMessage({
                    id: "send.testMsg",
                    defaultMessage: "Send Test Message",
                  })}
                </Button>
              </div>
            </div>
          </Form.Item>
        </>
      ) : (
        ""
      )}
      {currentEndpointType === EndPointType.AliyunSms ? (
        <>
          <Form.Item
            name={["addAliyunSms", "accessKey"]}
            label={intl.formatMessage({
              id: "accesskey.key",
              defaultMessage: "AccessKey ID ",
            })}
            required
            rules={[isRequired()]}
          >
            <Input className={style["width-400"]} />
          </Form.Item>
          <Form.Item
            name={["addAliyunSms", "secret"]}
            required
            rules={[isRequired()]}
            label={intl.formatMessage({
              id: "accesskey.secret",
              defaultMessage: "AccessKey Secret",
            })}
          >
            <Input.Password
              type="password"
              className={style["width-400"]}
              iconRender={(visibles) =>
                visibles ? (
                  <Icon type="eye-fill" />
                ) : (
                  <Icon type="eye-off-fill" />
                )
              }
            />
          </Form.Item>
          <AddSmsAtPersonFormItems form={form} />
        </>
      ) : (
        ""
      )}
      {currentEndpointType === EndPointType.HTTP ? (
        <>
          <Form.Item
            name={["addHttp", "url"]}
            label={intl.formatMessage({
              id: "address",
              defaultMessage: "Address",
            })}
            required
            rules={[
              {
                validator(rule, value: string) {
                  if (!value) {
                    return Promise.reject(
                      intl.formatMessage({
                        id: "zwatchEndpoint.field.address.validator.required",
                        defaultMessage: "This field is required.",
                      }),
                    );
                  }
                  if (!isUrl(value)) {
                    return Promise.reject(
                      intl.formatMessage({
                        id: "zwatchEndpoint.field.address.validator.format",
                        defaultMessage: "Invalid address.",
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
          <Form.Item
            name={["addHttp", "username"]}
            label={intl.formatMessage({
              id: "username",
              defaultMessage: "Username",
            })}
          >
            <Input className={style["width-400"]} />
          </Form.Item>
          <Form.Item
            name={["addHttp", "password"]}
            label={intl.formatMessage({
              id: "password",
              defaultMessage: "Password",
            })}
          >
            <Input type="password" className={style["width-400"]} />
          </Form.Item>
        </>
      ) : (
        ""
      )}
      {currentEndpointType === EndPointType.DingTalk ? (
        <>
          <TestConnectFormItems
            type={currentEndpointType}
            form={form}
            onChange={handelTestConnectionChange}
          />
          <SecuritySettingItem type={currentEndpointType} form={form} />
          <AtPersonFormItems
            form={form}
            parentFieldName={`add${currentEndpointType}`}
            onChangeObject={handleChangeObject}
            supportAtType="phoneNumber"
          />
        </>
      ) : (
        ""
      )}
      {currentEndpointType === EndPointType.MicrosoftTeams ? (
        <TestConnectFormItems
          type={currentEndpointType}
          form={form}
          onChange={handelTestConnectionChange}
        />
      ) : (
        ""
      )}

      {currentEndpointType === EndPointType.FeiShu && (
        <>
          <TestConnectFormItems
            type={currentEndpointType}
            form={form}
            onChange={handelTestConnectionChange}
          />
          <SecuritySettingItem type={currentEndpointType} form={form} />
          <AtPersonFormItems
            form={form}
            parentFieldName={`add${currentEndpointType}`}
            onChangeObject={handleChangeObject}
          />
        </>
      )}

      {currentEndpointType === EndPointType.WeCom && (
        <>
          <TestConnectFormItems
            type={currentEndpointType}
            form={form}
            onChange={handelTestConnectionChange}
          />
          <AtPersonFormItems
            form={form}
            parentFieldName={`add${currentEndpointType}`}
            onChangeObject={handleChangeObject}
          />
        </>
      )}

      {currentEndpointType === EndPointType.SNMP && (
        <Form.Item
          label={intl.formatMessage({
            id: "snmp.trap",
            defaultMessage: "SNMP Trap Receiver",
          })}
          required
        >
          <div className={style.selectEmailServer} ref={snmpTrapHelpRef}>
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
              <ModalSelect
                className={style.emailSelect}
                title={intl.formatMessage({
                  id: "select.snmpTrap",
                  defaultMessage: "Select SNMP Trap Receiver",
                })}
                selectType="radio"
                getHelperContainer={() =>
                  snmpTrapHelpRef.current?.parentElement
                }
                onChange={() => {
                  setCanTest(
                    !!form.getFieldValue("addSnmpTrap")?.trapReceivers?.length,
                  );
                }}
              >
                <SnmpTrapList view="select.zwatchEndpoint" />
              </ModalSelect>
            </Form.Item>
            <Button
              variant="link"
              disabled={!canTest}
              onClick={checkSnmpTrap}
              className={style["test-btn"]}
            >
              {intl.formatMessage({ id: "test", defaultMessage: "Test" })}
            </Button>
          </div>
        </Form.Item>
      )}

      {/* ZSTAC-54095，邮箱、钉钉、Microsoft Teams的创建表单增加【通知语言】字段 */}
      {[
        EndPointType.Email,
        EndPointType.DingTalk,
        EndPointType.MicrosoftTeams,
        EndPointType.FeiShu,
        EndPointType.WeCom,
      ].includes(currentEndpointType) && (
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
    </div>
  );
};

export default BasicConfig;
