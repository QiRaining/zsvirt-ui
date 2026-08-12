import { RadioGroup } from "@zstack/design";
import { Form, Input, TextArea, Alert } from "@zstack/zsphere-components";
import { ZSVForm, Switch } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import type { ThirdPartyAuthVO as IThirdPartyAuthVO } from "@zstack/zsphere-types/graphql";
import { isIP, isPort, isUrl } from "@zstack/zsphere-utils";
import { AutoComplete } from "antd";
import type { FormInstance } from "antd/lib/form";
import { omit as _omit } from "lodash-es";
import React, { useEffect, useMemo, useImperativeHandle } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import CONSTANT, { SSO_URL_TEMPLATE, ServerType } from "../constant";
import { useServerType } from "../hooks";

import style from "./style.module.less";

const STYLE_MARGIN_BOTTOM_14 = { marginBottom: "14px" } as const;

export interface IProps {
  form: FormInstance;
  isCreate?: boolean;
}

interface IComponentRef {
  form?: FormInstance;
  transform?: (data: any) => any;
}

export const OIDCConfig: React.FC<IProps> = () => {
  const intl = useIntl();

  const { lengthRange, commonRegexChecker, isRequiredString } =
    useValidator(intl);

  return (
    <>
      <Form.Item
        label={intl.formatMessage({
          id: "sso.client.id",
          defaultMessage: "Client ID",
        })}
        required
        name="clientId"
        rules={[
          lengthRange(1, 128),
          commonRegexChecker(RegExp("[^\u4e00-\u9fa5]+"), "Client ID"),
          {
            validator(rule, value: string) {
              void rule;
              if (!value) {
                return Promise.reject(
                  intl.formatMessage({
                    id: "global.field.validator.input.required",
                    defaultMessage: "This field is required.",
                  }),
                );
              }
              return Promise.resolve();
            },
          },
        ]}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "third.party.auth.create.oidc.or.oauth2.client.id.warning",
              defaultMessage: `### Client ID

The unique ID that the authentication system assigns to the platform.`,
            })}
          </ReactMarkdown>
        }
      >
        <Input className="width-320" />
      </Form.Item>

      <Form.Item
        label={intl.formatMessage({
          id: "sso.client.secret",
          defaultMessage: "Client Secret",
        })}
        name="clientSecret"
        required
        rules={[
          lengthRange(1, 128),
          commonRegexChecker(RegExp("[^\u4e00-\u9fa5]+"), "Client Secret"),
          {
            validator(rule, value: string) {
              void rule;
              if (!value) {
                return Promise.reject(
                  intl.formatMessage({
                    id: "global.field.validator.input.required",
                    defaultMessage: "This field is required.",
                  }),
                );
              }
              return Promise.resolve();
            },
          },
        ]}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "third.party.auth.oidc.create.clientSecret.warning",
              defaultMessage: `### Client Secret

The secret that the authentication system assigns to the platform.`,
            })}
          </ReactMarkdown>
        }
      >
        <Input.Password className="width-320" />
      </Form.Item>

      <Form.Item
        label={intl.formatMessage({
          id: "sso.authorizationUrl",
          defaultMessage: "Authorization Request URL",
        })}
        name="authorizationUrl"
        required
        rules={[
          lengthRange(1, 128),
          {
            validator(rule, value: string) {
              void rule;
              if (!value) {
                return Promise.reject(
                  intl.formatMessage({
                    id: "global.field.validator.input.required",
                    defaultMessage: "This field is required.",
                  }),
                );
              }

              if (!isUrl(value)) {
                return Promise.reject(
                  intl.formatMessage({
                    id: "authorization.request.field.url.validator.format",
                    defaultMessage: "Invalid authorization request URL.",
                  }),
                );
              }
              return Promise.resolve();
            },
          },
        ]}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "third.party.auth.oidc.create.authorizationUrl.warning",
              defaultMessage: `Authorization Request URL

The request URL used to obtain an authorization grant in authorization code mode.`,
            })}
          </ReactMarkdown>
        }
      >
        <Input className="width-320" />
      </Form.Item>

      <Form.Item
        label={intl.formatMessage({
          id: "sso.tokenUrl",
          defaultMessage: "Token Request URL",
        })}
        name="tokenUrl"
        required
        rules={[
          lengthRange(1, 128),
          {
            validator(rule, value: string) {
              void rule;
              if (!value) {
                return Promise.reject(
                  intl.formatMessage({
                    id: "global.field.validator.input.required",
                    defaultMessage: "This field is required.",
                  }),
                );
              }

              if (!isUrl(value)) {
                return Promise.reject(
                  intl.formatMessage({
                    id: "token.request.field.url.validator.format",
                    defaultMessage: "Invalid token request URL.",
                  }),
                );
              }
              return Promise.resolve();
            },
          },
        ]}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "third.party.auth.create.tokenUrl.warning",
              defaultMessage: `Token Request URL

The request URL used to obtain an access token from the authentication server.`,
            })}
          </ReactMarkdown>
        }
      >
        <Input className="width-320" />
      </Form.Item>

      <Form.Item
        label={intl.formatMessage({
          id: "user.syncMappingRules",
          defaultMessage: "User Mapping Rule",
        })}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "3rdPartyAuthentication.field.sso.sync.mapping.rules.tooltip",
              defaultMessage: `### User Mapping

The rule used to map SSO attributes of an SSO user to local attributes. Through the mapping rule, the SSO user has local user attributes after it is synced to the platform. For example, if the SSO attribute "cn" of an SSO user is mapped to "User Name", then the User Name of the user is the value of the cn attribute, for example, Bob.`,
            })}
          </ReactMarkdown>
        }
      />
      <div className={style["config-container"]}>
        <Form.Item
          className={style["config-properties"]}
          label={intl.formatMessage({
            id: "account.information.name",
            defaultMessage: "Name",
          })}
          labelWidth={148}
          name={["base", "name"]}
          required
          rules={[isRequiredString]}
        >
          <Input className="width-320" />
        </Form.Item>
      </div>
    </>
  );
};

export const OIDC: React.FC<IProps> = ({ form }) => {
  const intl = useIntl();

  return (
    <>
      <ZSVForm.Card
        title={intl.formatMessage({
          id: "config.info",
          defaultMessage: "Configurations",
        })}
      >
        <OIDCConfig form={form} />
      </ZSVForm.Card>
    </>
  );
};

export const LdapServerConfig: React.FC<
  IProps & {
    current?: IThirdPartyAuthVO;
  }
> = ({ form, isCreate, current }) => {
  const intl = useIntl();
  const { isRequired } = useValidator(intl);

  const serverType: ServerType = isCreate
    ? form.getFieldValue("type")
    : current?.serverType;

  useEffect(() => {
    if (!isCreate) {
      const fields = [
        {
          name: ["configInfo", "base"],
          value: current?.base,
        },
        {
          name: ["configInfo", "username"],
          value: current?.username,
        },
        {
          name: "usernameProperty",
          value: current?.usernameProperty,
        },
        {
          name: "filter",
          value: current?.filter,
        },
      ];

      form.setFields(fields);
    }
  }, [isCreate, current, form]);

  const translateBaseDnTooltip = useMemo(() => {
    if (serverType === ServerType.AD) {
      return (
        <ReactMarkdown>
          {intl.formatMessage({
            id: "3rdPartyAuthentication.field.AdBaseDn.tooltip",
            defaultMessage: `### Base DN

Specifies the root for searching AD/LDAP users and defining the range of synchronizing them.`,
          })}
        </ReactMarkdown>
      );
    }

    return (
      <ReactMarkdown>
        {intl.formatMessage({
          id: "3rdPartyAuthentication.field.LdapBaseDn.tooltip",
          defaultMessage: `### Base DN

Specifies the root for searching AD/LDAP users and defining the range of synchronizing them.`,
        })}
      </ReactMarkdown>
    );
  }, [intl, serverType]);

  const translateUserDnTooltip = useMemo(() => {
    return (
      <ReactMarkdown>
        {intl.formatMessage(
          {
            id: "3rdPartyAuthentication.field.userDn.tooltip",
            defaultMessage: `### User DN

A particular user who owns all user permissions to check the base DN range. It can be used to access {type} servers and obtain associated data.`,
          },
          {
            type: serverType === ServerType.AD ? "AD" : "LDAP",
          },
        )}
      </ReactMarkdown>
    );
  }, [intl, serverType]);

  const translateFilteringRulesTooltip = useMemo(() => {
    return (
      <ReactMarkdown>
        {intl.formatMessage(
          {
            id: "3rdPartyAuthentication.field.filteringRules.tooltip",
            defaultMessage: `### Filter Rule

By default, the filter is disabled. You can set a filter rule to filter user information during synchronization.

1. The input syntax of a filter rule is consistent with that of the AD/LDAP filter rule. For more information, see Microsoft Documentations.

- Single rule: (name=filterName)
- Combination rule: (&(name=filterName)(description=departure))(description=departure))

- You can specify an allowlist rule or blocklist rule with the "!" symbol. For allowlist, only the user information configured in the filter rule can be synchronized to the platform. For a blocklist, the user information configured in the filter rule will not be synchronized to the platform.

2. The filter rule length is subject to the AD/LDAP server configurations. Make sure the user-defined length falls within the length.

3. If this parameter is left unconfigured, the system will add a (objectClass=person) rule by default.`,
          },
          {
            type: serverType === ServerType.AD ? "AD" : "LDAP",
          },
        )}
      </ReactMarkdown>
    );
  }, [intl, serverType]);

  const translateFilterRuleAlertInfo = useMemo(() => {
    return (
      <Alert
        className={style.alert}
        display="weak"
        type="warning"
        message={
          <ReactMarkdown>
            {intl.formatMessage(
              {
                id: "3rdPartyAuthentication.field.filterRule.alert.warning",
                defaultMessage:
                  "The filter rule length is subject to the {type} server configurations. Make sure the user-defined length falls within the length.",
              },
              {
                type: serverType === ServerType.AD ? "AD" : "LDAP",
              },
            )}
          </ReactMarkdown>
        }
      />
    );
  }, [intl, serverType]);

  const translateLoginPropertiesTooltip = useMemo(() => {
    if (serverType === ServerType.AD) {
      return (
        <ReactMarkdown>
          {intl.formatMessage({
            id: "3rdPartyAuthentication.field.AdLoginProperties.tooltip",
            defaultMessage: `### Login Attribute

Specifies AD/LDAP user attributes for platform logins.

- If cn is used as the login attribute, AD/LDAP users can use the value (such as Tom) matching cn as their login name in the platform.`,
          })}
        </ReactMarkdown>
      );
    }

    return (
      <ReactMarkdown>
        {intl.formatMessage({
          id: "3rdPartyAuthentication.field.LdapLoginProperties.tooltip",
          defaultMessage: `### Login Attribute

Specifies AD/LDAP user attributes for platform logins.

- If cn is used as the login attribute, AD/LDAP users can use the value (such as Tom) matching cn as their login name in the platform.`,
        })}
      </ReactMarkdown>
    );
  }, [intl, serverType]);

  const translateLoginPropertiesAlertInfo = useMemo(() => {
    return intl.formatMessage(
      {
        id: "3rdPartyAuthentication.field.loginProperties.alert.info",
        defaultMessage: "Specifies {type} authentication.",
      },
      {
        type: ServerType.AD === serverType ? "AD" : "LDAP",
      },
    );
  }, [intl, serverType]);

  const { logonAttributeList } = CONSTANT[serverType as keyof typeof CONSTANT];

  const autoCompleteFilterOption = (inputValue: any, option: any) => {
    return (
      option?.value
        ?.toUpperCase()
        ?.indexOf(inputValue && inputValue?.toString()?.toUpperCase()) !== -1
    );
  };

  return (
    <>
      <Form.Item
        label={intl.formatMessage({ id: "baseDn", defaultMessage: "Base DN" })}
        name={["configInfo", "base"]}
        icon="info"
        iconTooltip={translateBaseDnTooltip}
        tooltip={intl.formatMessage({
          id: "3rdPartyAuthentication.field.baseDn.hover",
          defaultMessage: "ou=people,dc=example",
        })}
        rules={[isRequired()]}
      >
        <Input className={style["width-320"]} />
      </Form.Item>

      <Form.Item
        label={intl.formatMessage({ id: "userDn", defaultMessage: "User DN" })}
        name={["configInfo", "username"]}
        icon="info"
        iconTooltip={translateUserDnTooltip}
        tooltip={intl.formatMessage({
          id: "3rdPartyAuthentication.field.userDn.hover",
          defaultMessage: "cn=AA,ou=BB,dc=CC,dc=DD",
        })}
        rules={[isRequired()]}
      >
        <Input className={style["width-320"]} />
      </Form.Item>

      {isCreate && (
        <Form.Item
          label={intl.formatMessage({ id: "password", defaultMessage: "Password" })}
          name={["configInfo", "password"]}
          icon="info"
          iconTooltip={
            <ReactMarkdown>
              {intl.formatMessage({
                id: "3rdPartyAuthentication.field.password.tooltip",
                defaultMessage: `### Password

Specifies the login password associated with the user DN.`,
              })}
            </ReactMarkdown>
          }
          rules={[isRequired()]}
        >
          <Input.Password className={style["width-320"]} />
        </Form.Item>
      )}

      <Form.Item
        label={intl.formatMessage({
          id: "filteringRules",
          defaultMessage: "Filter Rule",
        })}
        icon="info"
        iconTooltip={translateFilteringRulesTooltip}
        description={translateFilterRuleAlertInfo}
        name="filter"
        rules={[
          {
            validator(rule, value: string) {
              void rule;
              if (!value) {
                return Promise.resolve();
              }

              if (value.includes("（") || value.includes("）")) {
                return Promise.reject(
                  intl.formatMessage({
                    id: "3rdPartyAuthentication.field.filteringRules.validator.format",
                    defaultMessage: "Invalid filter rule.",
                  }),
                );
              }
              return Promise.resolve();
            },
          },
        ]}
        tooltip={intl.formatMessage({
          id: "3rdPartyAuthentication.field.filteringRules.hover",
          defaultMessage: "(&(name=filterName)(description=departure))",
        })}
        initialValue="(objectClass=person)"
      >
        <TextArea
          rows={4}
          className={style["width-320"]}
          placeholder={intl.formatMessage({
            id: "3rdPartyAuthentication.field.filter.placeholder",
            defaultMessage: `(&(name=filterName)
(description=departure))
          `,
          })}
        />
      </Form.Item>

      <Form.Item
        label={intl.formatMessage({
          id: "loginProperties",
          defaultMessage: "Login Attribute",
        })}
        icon="info"
        iconTooltip={translateLoginPropertiesTooltip}
        required
        style={STYLE_MARGIN_BOTTOM_14}
      >
        <Form.Item name="usernameProperty" rules={[isRequired()]}>
          <AutoComplete
            className={style["width-320"]}
            options={logonAttributeList}
            getPopupContainer={(triggerNode) =>
              triggerNode.parentElement || document.body
            }
            filterOption={(inputValue, option) =>
              autoCompleteFilterOption(inputValue, option)
            }
          />
        </Form.Item>
        <div className={style.caption}>{translateLoginPropertiesAlertInfo}</div>
      </Form.Item>
    </>
  );
};

export const LdapServer: React.FC<IProps> = ({ form, isCreate }) => {
  const intl = useIntl();
  const { isRequired } = useValidator(intl);

  useEffect(() => {
    if (isCreate) {
      form.setFields([
        {
          name: "encryption",
          value: true,
        },
        {
          name: "masterServerPort",
          value: "636",
        },
      ]);
    }
  }, [form, isCreate]);

  return (
    <>
      <ZSVForm.Card
        title={intl.formatMessage({
          id: "accountThirdPartyAuth.serverInfo.title",
          defaultMessage: "Server Info",
        })}
      >
        <Form.Item
          name="encryption"
          label={intl.formatMessage({
            id: "accountThirdPartyAuth.field.encryption",
            defaultMessage: "SSL/TLS Encryption",
          })}
          valuePropName="checked"
        >
          <Switch
            onChange={(checked) => {
              const masterServerPort = checked ? "636" : "389";

              form.setFields([
                {
                  name: "masterServerPort",
                  value: masterServerPort,
                },
              ]);
            }}
          />
        </Form.Item>

        <Form.Item
          label={intl.formatMessage({
            id: "master.server.ip",
            defaultMessage: "Primary Server IP/Domain",
          })}
          required={true}
        >
          <div className="flex items-center gap-1">
            <Form.Item
              name="masterServerIp"
              rules={[
                isRequired(),
                () => ({
                  validator(rule, values) {
                    void rule;
                    if (!values || isIP(values)) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      Error(
                        intl.formatMessage({
                          id: "3rdPartyAuthentication.field.primaryServerIp.validator.format",
                          defaultMessage: "Invalid IP address.",
                        }),
                      ),
                    );
                  },
                }),
              ]}
            >
              <Input
                className={style["width-160"]}
                placeholder={intl.formatMessage({
                  id: "ipAddress",
                  defaultMessage: "IP Address",
                })}
              />
            </Form.Item>

            <span className={style.split}>-</span>

            <Form.Item
              name="masterServerPort"
              rules={[
                isRequired(),
                () => ({
                  validator(rule, values) {
                    void rule;
                    if (!values || isPort(values)) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      Error(
                        intl.formatMessage({
                          id: "3rdPartyAuthentication.field.primaryServerPort.validator.format",
                          defaultMessage: "Incorrect port format.",
                        }),
                      ),
                    );
                  },
                }),
              ]}
            >
              <Input
                className={style["width-80"]}
                placeholder={intl.formatMessage({
                  id: "ipPort",
                  defaultMessage: "IP Port",
                })}
              />
            </Form.Item>
          </div>
        </Form.Item>

        <Form.Item
          label={intl.formatMessage({
            id: "secondaryServer.ip/domain",
            defaultMessage: "Secondary Server IP/Domain",
          })}
        >
          <div className="flex items-center gap-1">
            <Form.Item
              name="standbyServerIp"
              rules={[
                () => ({
                  validator(rule, values) {
                    void rule;
                    if (!values || isIP(values)) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      Error(
                        intl.formatMessage({
                          id: "3rdPartyAuthentication.field.secondaryServerIp.validator.format",
                          defaultMessage: "Invalid IP address.",
                        }),
                      ),
                    );
                  },
                }),
              ]}
            >
              <Input
                className={style["width-160"]}
                placeholder={intl.formatMessage({
                  id: "ipAddress",
                  defaultMessage: "IP Address",
                })}
              />
            </Form.Item>

            <span className={style.split}>-</span>

            <Form.Item
              name="standbyServerPort"
              rules={[
                () => ({
                  validator(rule, values) {
                    void rule;
                    if (!values || isPort(values)) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      Error(
                        intl.formatMessage({
                          id: "3rdPartyAuthentication.field.secondaryServerPort.validator.format",
                          defaultMessage: "Incorrect port format.",
                        }),
                      ),
                    );
                  },
                }),
              ]}
            >
              <Input
                className={style["width-80"]}
                placeholder={intl.formatMessage({
                  id: "ipPort",
                  defaultMessage: "IP Port",
                })}
              />
            </Form.Item>
          </div>
        </Form.Item>
      </ZSVForm.Card>

      <ZSVForm.Card
        title={intl.formatMessage({
          id: "config.info",
          defaultMessage: "Configurations",
        })}
      >
        <LdapServerConfig form={form} isCreate={isCreate} />
      </ZSVForm.Card>
    </>
  );
};

const Config: React.FC<IProps> = ({ form, isCreate }) => {
  const intl = useIntl();

  const { commonNameRules, commonDescriptionRules } = useValidator(intl);

  const { serverTypeList } = useServerType();

  useEffect(() => {
    form.setFields([
      {
        name: "type",
        value: ServerType.OIDC,
      },
    ]);
  }, []);

  return (
    <>
      <ZSVForm.Card
        title={intl.formatMessage({
          id: "basic.info",
          defaultMessage: "Basic Info",
        })}
      >
        <Form.Item
          label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
          name="name"
          rules={commonNameRules}
        >
          <Input className="width-320" />
        </Form.Item>
        <Form.Item
          name="description"
          rules={commonDescriptionRules}
          label={intl.formatMessage({
            id: "introduction",
            defaultMessage: "Description",
          })}
        >
          <TextArea limit={256} rows={4} isShowLimit className="width-320" />
        </Form.Item>
        <Form.Item
          name="type"
          label={intl.formatMessage({ id: "type", defaultMessage: "Type" })}
          required
          icon="info"
          iconTooltip={
            <ReactMarkdown>
              {intl.formatMessage({
                id: "account.third.party.auth.create.type.tip",
                defaultMessage: `### Type

1. OIDC: An SSO server that applies the OIDC protocol. It authenticates and authorizes SSO users to log in to the platform without password and syncs user information to the platform based on the mapping rule.

2. AD: Synchronizes AD users to the platform and allows using specified AD user attributes for login.

3. LDAP: Synchronizes LDAP users to the platform and allows using specified LDAP user attributes for login.`,
              })}
            </ReactMarkdown>
          }
        >
          <RadioGroup
            options={serverTypeList.map((it) => ({
              value: it.key,
              label: it.label,
            }))}
          />
        </Form.Item>
      </ZSVForm.Card>

      <Form.Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
        {() => {
          const type = form.getFieldValue("type");

          if (type === ServerType.OIDC) {
            return <OIDC form={form} />;
          }

          if ([ServerType.AD, ServerType.LDAP].includes(type)) {
            return <LdapServer form={form} isCreate={isCreate} />;
          }

          return null;
        }}
      </Form.Item>
    </>
  );
};

const Authentication: React.ForwardRefRenderFunction<
  { form?: FormInstance },
  { isCreate: boolean }
> = (_, ref) => {
  const [form] = Form.useForm();

  useImperativeHandle<IComponentRef, IComponentRef>(ref, () => ({
    form,
    transform: (formData) => {
      const { type, base, ...rest } = formData || {};

      if (type === ServerType.OIDC) {
        return {
          ..._omit(formData, ["base"]),
          usernameProperty: base.name,
          clientType: type,
          urlTemplate: SSO_URL_TEMPLATE,
        };
      }

      if ([ServerType.AD, ServerType.LDAP].includes(type)) {
        const systemTags: string[] = [];
        const tagList: string[] = [];

        if (rest.standbyServerIp && rest.standbyServerPort) {
          tagList.push(
            `ldapUrls::ldap://${rest.standbyServerIp}:${rest.standbyServerPort}`,
          );
        }

        return {
          ...rest.configInfo,
          ..._omit(rest, [
            "encryption",
            "masterServerIp",
            "masterServerPort",
            "configInfo",
            "standbyServerIp",
            "standbyServerPort",
            "filter",
          ]),
          type,
          encryption: rest.encryption ? "TLS" : "None",
          systemTags,
          serverType: type === ServerType.LDAP ? "OpenLdap" : "WindowsAD",
          url: `ldap://${rest.masterServerIp}:${rest.masterServerPort}`,
          tagList,
          filter: rest.filter || undefined,
        };
      }

      return {
        ...formData,
      };
    },
  }));

  return (
    <Form form={form}>
      <Config form={form} isCreate={_.isCreate} />
    </Form>
  );
};

export default React.forwardRef<{ form?: FormInstance }, { isCreate: boolean }>(
  Authentication,
);
