import { useLazyQuery } from "@apollo/client";
import { Button } from "@zstack/design";
import { Form, Input } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction, useValidator } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  AccountThirdPartyAuth as IAccountThirdPartyAuth,
  ThirdPartyAuthVO as IThirdPartyAuthVO,
} from "@zstack/zsphere-types/graphql";
import { Decrypt, genUuid } from "@zstack/zsphere-utils";
import { usePersistFn } from "ahooks";
import { pick as _pick } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import {
  editAccountThirdPartyAuthConfig,
  getOAuthClientSecret,
  testConnectionThirdParty,
  updateThirdPartyAuth,
} from "../../../gql/account-third-party-auth.gql";
import { LdapServerConfig, OIDCConfig } from "../create/authentication";
import { getSsoType } from "../uitls";

const STYLE_MARGIN_LEFT_4 = { marginLeft: "4px" } as const;

const UpdateLdapServerAction: React.FC<
  IActionWrapperProps<IThirdPartyAuthVO>
> = ({ visible, selectedList, setVisible }) => {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();
  const { isRequired } = useValidator(intl);

  const current = selectedList?.[0] || {};

  const updateLdapServer = usePersistFn((payload) => {
    doAction({
      mutation: updateThirdPartyAuth,
      payload,
      name: intl.formatMessage({
        id: "modify.config.Info",
        defaultMessage: "Update Configurations",
      }),
      total: 1,
    });
  });

  const testConnectLdapServer = usePersistFn(
    (values: any, isTest: boolean = false) => {
      const { configInfo, ...rest } = values || {};

      const payload = {
        ...configInfo,
        ...rest,
      };

      doAction({
        mutation: testConnectionThirdParty,
        payload: {
          ...payload,
          ..._pick(current, ["serverType", "url", "encryption", "name"]),
        },
        name: intl.formatMessage({
          id: "test.connection.3rdPartyAuthServer",
          defaultMessage: "Test Connection of SSO Server",
        }),
        onFinish: (result) => {
          if (result.fail || result.exception) {
            return;
          }

          if (!isTest) {
            // update ldap
            updateLdapServer({
              ...payload,
              ldapServerUuid: current.uuid,
            });
          }
        },
        total: 1,
      });
    },
  );

  const onOk = (values: any) => {
    testConnectLdapServer(values);
  };

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "account.3rdPartyAuthentication.ldapServer.modal.title.confirm.edit",
        defaultMessage: "Modify Configuration",
      })}
      form={form}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      alertType="warning"
      alertMessage={intl.formatMessage({
        id: "account.3rdPartyAuthentication.ldapServer.modal.title.confirm.edit.alert.message",
        defaultMessage: "The modified configuration will take effect after the next server synchronization.",
      })}
    >
      <Form form={form}>
        <LdapServerConfig key={genUuid()} form={form} current={current} />

        <Form.Item
          label={intl.formatMessage({ id: "password", defaultMessage: "Password" })}
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
          required
        >
          <Form.Item
            noStyle
            name={["configInfo", "password"]}
            rules={[isRequired()]}
          >
            <Input.Password className="width-240" />
          </Form.Item>

          <Button
            style={STYLE_MARGIN_LEFT_4}
            onClick={async (e) => {
              e.stopPropagation();
              testConnectLdapServer(await form.validateFields(), true);
            }}
          >
            {intl.formatMessage({
              id: "test.connect",
              defaultMessage: "Test Connection",
            })}
          </Button>
        </Form.Item>
      </Form>
    </DialogForm>
  );
};

const UpdateOIDCAction: React.FC<
  IActionWrapperProps<IAccountThirdPartyAuth>
> = ({ visible, selectedList, setVisible }) => {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();
  const [fetchClientSecret] = useLazyQuery<{
    getOAuthClientSecret: { clientSecret: string };
  }>(getOAuthClientSecret, {
    fetchPolicy: "no-cache",
    onCompleted: (data) => {
      const realSecret = data?.getOAuthClientSecret?.clientSecret;
      if (realSecret) {
        form.setFields([{ name: "clientSecret", value: Decrypt(realSecret) }]);
      }
    },
  });

  const current = selectedList?.[0] || {};

  const onOk = (values: any) => {
    doAction({
      mutation: editAccountThirdPartyAuthConfig,
      payload: {
        updateOAuthClientPayload: {
          ...values,
          uuid: current.uuid,
        },
      },
      name: intl.formatMessage({
        id: "edit.config",
        defaultMessage: "Modify Configuration",
      }),
      total: 1,
    });
  };

  React.useEffect(() => {
    if (visible) {
      form.setFields([
        {
          name: "clientId",
          value: current.clientId,
        },
        {
          name: "clientSecret",
          value: current.clientSecret,
        },
        {
          name: "authorizationUrl",
          value: current.authorizationUrl,
        },
        {
          name: "tokenUrl",
          value: current.tokenUrl,
        },
      ]);

      // 获取真实的 clientSecret 替代遮蔽值
      if (current.uuid) {
        fetchClientSecret({ variables: { uuid: current.uuid } });
      }
    }
  }, [current, form, visible]);

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "account.3rdPartyAuthentication.oidc.modal.title.confirm.edit",
        defaultMessage: "Edit SSO Server",
      })}
      form={form}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
    >
      <Form form={form}>
        <OIDCConfig form={form} />
      </Form>
    </DialogForm>
  );
};

const Action: React.FC<IActionWrapperProps<any>> = ({
  selectedList,
  ...props
}) => {
  const current = selectedList?.[0] || {};
  const { isLdapServer, isOIDC } = getSsoType(current);

  const action = React.useMemo(() => {
    if (isLdapServer) {
      return (
        <UpdateLdapServerAction
          {...props}
          selectedList={selectedList as IThirdPartyAuthVO[]}
        />
      );
    }

    if (isOIDC) {
      return (
        <UpdateOIDCAction
          {...props}
          selectedList={selectedList as IAccountThirdPartyAuth[]}
        />
      );
    }

    return null;
  }, [isLdapServer, isOIDC, props, selectedList]);

  return action;
};

export default Action;
