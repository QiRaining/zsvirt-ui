import { Form, Input } from "@zstack/zsphere-components";
import { ZSVForm, TextArea } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import { isUrl } from "@zstack/zsphere-utils";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import styles from "./style.module.less";

const { Item } = Form;

const STYLE_MARGIN_BOTTOM_0 = { marginBottom: 0 } as const;

const CreateAccount: React.FC = () => {
  const intl = useIntl();
  const {
    commonNameRules,
    commonDescriptionRules,
    lengthRange,
    commonRegexChecker,
    isRequiredString,
  } = useValidator(intl);

  return (
    <div>
      <ZSVForm.Card
        title={intl.formatMessage({
          id: "basic.info",
          defaultMessage: "Basic Info",
        })}
      >
        <Item
          shouldUpdate={true}
          label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
          name="name"
          rules={commonNameRules}
        >
          <Input className="width-320" />
        </Item>
        <Item
          name="description"
          rules={commonDescriptionRules}
          label={intl.formatMessage({
            id: "introduction",
            defaultMessage: "Description",
          })}
        >
          <TextArea limit={256} rows={4} isShowLimit className="width-320" />
        </Item>
        <Item
          style={STYLE_MARGIN_BOTTOM_0}
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
          OIDC
        </Item>
      </ZSVForm.Card>
      <ZSVForm.Card
        title={intl.formatMessage({
          id: "config.info",
          defaultMessage: "Configurations",
        })}
      >
        <Item
          shouldUpdate={true}
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
        </Item>
        <Item
          shouldUpdate={true}
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
        </Item>
        <Item
          shouldUpdate={true}
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
        </Item>
        <Item
          shouldUpdate={true}
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
        </Item>

        <Item
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
        <div className={styles["config-container"]}>
          <Item
            className={styles["config-properties"]}
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
          </Item>
        </div>
      </ZSVForm.Card>
    </div>
  );
};

export default CreateAccount;
