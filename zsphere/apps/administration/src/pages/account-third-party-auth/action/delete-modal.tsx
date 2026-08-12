import { DialogP0Smart } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  AccountThirdPartyAuth as IAccountThirdPartyAuth,
  ThirdPartyAuthVO as IThirdPartyAuth,
} from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import {
  deleteAccountThirdPartyAuth,
  deleteThirdPartyAuths,
} from "../../../gql/account-third-party-auth.gql";
import { getSsoType } from "../uitls";

const Action: React.FC<
  IActionWrapperProps<IAccountThirdPartyAuth & IThirdPartyAuth>
> = ({ visible, setVisible, selectedList }) => {
  const intl = useIntl();
  const doAction = useAction();
  const current = selectedList?.[0];

  const gql = React.useMemo(() => {
    const { isLdapServer, isOIDC } = getSsoType(current);

    if (isOIDC) {
      return deleteAccountThirdPartyAuth;
    }
    if (isLdapServer) {
      return deleteThirdPartyAuths;
    }
  }, [current]);

  const onOk = () => {
    const payload = selectedList.map((item) => {
      return { uuid: item.uuid };
    });

    doAction({
      mutation: gql,
      payload,
      name: intl.formatMessage({
        id: "delete.3rdPartyAuthServer",
        defaultMessage: "Delete SSO Server",
      }),
      total: selectedList.length,
      onFinish: () => {},
    });
  };

  const translateDeleteAlertMessage = useMemo(() => {
    return intl.formatMessage({
      id: "account.3rdPartyAuthentication.modal.delete.alert.danger",
      defaultMessage: `Deleting the SSO server will also delete all of its users synchronized to the platform, while the corresponding users in the source SSO server are not affected.`,
    });
  }, [intl]);

  return (
    <DialogP0Smart
      title={intl.formatMessage({
        id: "thirdPartyAuth.modal.title.confirm.delete.3rdPartyAuthServer",
        defaultMessage: "Delete SSO Server?",
      })}
      visible={visible}
      setVisible={setVisible}
      bannerMessage={translateDeleteAlertMessage}
      resourceType={intl.formatMessage({
        id: "3rdPartyAuthServer",
        defaultMessage: "SSO Server",
      })}
      relatedResources={[
        {
          name: intl.formatMessage({ id: "user", defaultMessage: "User" }),
          count: current?.bindResourceref?.userCount ?? 0,
        },
      ]}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      onConfirm={onOk}
      guide={{
        confirmWord: "Delete",
      }}
    />
  );
};

export default Action;
