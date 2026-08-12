import { useLazyQuery } from "@apollo/client";
import { Alert } from "@zstack/design";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  EditAccountThirdPartyAuthConfigPayload,
  AccountThirdPartyAuth as IAccountThirdPartyAuth,
} from "@zstack/zsphere-types/graphql";
import { Decrypt } from "@zstack/zsphere-utils";
import React, { useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import {
  editAccountThirdPartyAuthConfig,
  getOAuthClientSecret,
} from "../../../gql/account-third-party-auth.gql";
import CreatBase from "../create/create";

const STYLE_MARGIN_BOTTOM_20 = { marginBottom: "20px" } as const;

const Action: React.FC<IActionWrapperProps<IAccountThirdPartyAuth>> = ({
  refetch,
  visible,
  selectedList,
  setSelectedList,
  setVisible,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const doAction = useAction();
  const [fetchClientSecret] = useLazyQuery<{
    getOAuthClientSecret: { clientSecret: string };
  }>(getOAuthClientSecret, {
    fetchPolicy: "no-cache",
    onCompleted: (data) => {
      const realSecret = data?.getOAuthClientSecret?.clientSecret;
      if (realSecret) {
        form.setFieldsValue({ clientSecret: Decrypt(realSecret) });
      }
    },
  });

  useEffect(() => {
    if (visible && selectedList?.[0]) {
      const current = selectedList[0];
      form.setFieldsValue({
        name: current.name,
        description: current.description,
        authorizationUrl: current.authorizationUrl,
        clientId: current.clientId,
        type: current.type,
        clientSecret: current.clientSecret,
        tokenUrl: current.tokenUrl,
        base: {
          name: current.usernameProperty,
        },
      });

      // 获取真实的 clientSecret 替代遮蔽值
      fetchClientSecret({ variables: { uuid: current.uuid } });
    }
  }, [visible, selectedList]);

  const onOk = async (values: any) => {
    const {
      name,
      description,
      authorizationUrl,
      clientId,
      clientSecret,
      tokenUrl,
      base,
    } = values;

    const payload: EditAccountThirdPartyAuthConfigPayload = {
      updateOAuthClientPayload: {
        uuid: selectedList?.[0]?.uuid,
        name,
        description,
        authorizationUrl,
        clientId,
        clientSecret,
        tokenUrl,
        usernameProperty: base.name,
      },
    };

    doAction({
      mutation: editAccountThirdPartyAuthConfig,
      payload,
      name: intl.formatMessage({
        id: "edit.config",
        defaultMessage: "Modify Configuration",
      }),
      total: 1,
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogForm
      widthClassName="w-150"
      title={intl.formatMessage({
        id: "edit.config",
        defaultMessage: "Modify Configuration",
      })}
      form={form}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
    >
      <Form form={form}>
        <Alert style={STYLE_MARGIN_BOTTOM_20} variant="info">
          <ReactMarkdown>
            {intl.formatMessage({
              id: "edit.third.party.auth.config.alert.info",
              defaultMessage: `
1. After you modify the configurations, SSO users synced to the platform may not be able to log into the platform without a password.
2. When an SSO user authenticated through a unified system logs into the platform, the platform will create or update the user information based on this login session.`,
            })}
          </ReactMarkdown>
        </Alert>
        <CreatBase />
      </Form>
    </DialogForm>
  );
};

export default Action;
